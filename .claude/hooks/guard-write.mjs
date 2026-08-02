#!/usr/bin/env node
/**
 * PreToolUse (Edit|Write|MultiEdit|NotebookEdit) — controla dónde se puede escribir.
 *
 * Tres niveles de decisión, no dos:
 *   deny  → prohibido (secretos, artefactos generados, territorio ajeno)
 *   ask   → escala al humano (políticas de agentes, configuración compartida)
 *   allow → adelante
 */
import {
  readHookInput, decide, gatesEnabled, toolCall, rutasDe, hostDestino,
  projectRoot, readIfExists, agenteActivo, globARegExp,
} from './_lib.mjs';
import { join } from 'node:path';

const input = await readHookInput();
const { entrada } = toolCall(input);
const host = hostDestino();
const root = projectRoot(input);
const rutas = rutasDe(entrada);
const contenido = entrada.content || entrada.new_string || '';

if (!rutas.length) decide('allow', 'Sin ruta que evaluar.', host);

// `.env.example` / `.sample` / `.template` sí se editan: documentan nombres, no valores.
const esPlantillaEnv = (r) => /(^|\/)\.env\.(example|sample|template|dist)$/.test(r);

// ── deny: nunca ──────────────────────────────────────────────────────────────
const prohibidas = [
  { re: /(^|\/)\.env($|\.)/, motivo: 'Los ficheros .env contienen secretos.' },
  { re: /(^|\/)(secrets?|credentials?)\//i, motivo: 'Directorio de secretos.' },
  { re: /\.(pem|key|p12|pfx|keystore|jks)$/i, motivo: 'Material criptográfico.' },
  { re: /(^|\/)id_(rsa|dsa|ecdsa|ed25519)/, motivo: 'Clave SSH privada.' },
  { re: /(^|\/)node_modules\//, motivo: 'Dependencias instaladas: edita el manifiesto.' },
  { re: /(^|\/)(dist|build|out|\.next|target|coverage)\//, motivo: 'Artefacto generado: edita la fuente.' },
  { re: /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|poetry\.lock|Cargo\.lock)$/,
    motivo: 'Lockfile: se regenera con el gestor de paquetes.' },
  { re: /(^|\/)\.git\//, motivo: 'Internals de git.' },
  { re: /(^|\/)(execution-log|agent-audit)\.jsonl$/,
    motivo: 'Bitácora append-only de ejecuciones: la escriben los hooks, no el agente. ' +
            'Reescribirla destruiría la única evidencia de qué agente hizo qué.' },
];

for (const r of rutas) {
  if (esPlantillaEnv(r)) continue;
  for (const p of prohibidas) {
    if (p.re.test(r)) decide('deny', `Escritura bloqueada en \`${r}\`. ${p.motivo}`, host);
  }
}

// ── deny: secretos en el contenido ───────────────────────────────────────────
const secretos = [
  { re: /\b(sk-[A-Za-z0-9]{20,}|sk-ant-[A-Za-z0-9_-]{20,})\b/, que: 'clave de API tipo OpenAI/Anthropic' },
  { re: /\bghp_[A-Za-z0-9]{30,}\b/, que: 'token de GitHub' },
  { re: /\bAKIA[0-9A-Z]{16}\b/, que: 'access key de AWS' },
  { re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, que: 'clave privada' },
  { re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/, que: 'JWT con aspecto real' },
  { re: /(password|passwd|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"\s${}]{12,}['"]/i, que: 'credencial literal' },
];

if (gatesEnabled() && contenido) {
  for (const s of secretos) {
    if (s.re.test(contenido)) {
      decide(
        'deny',
        `Posible secreto en \`${rutas[0]}\` (${s.que}). Usa una variable de entorno y ` +
          'documenta su nombre en `.env.example`, sin el valor. Si es un valor de prueba, hazlo evidente.',
        host,
      );
    }
  }
}

// ── ask: política compartida del ecosistema ──────────────────────────────────
// Cambiar un agente, una skill o un hook cambia el comportamiento de TODO el
// proyecto y de todas las sesiones futuras. Eso lo aprueba una persona.
const politica = [
  /(^|\/)\.claude\/(agents|skills|hooks)\//,
  /(^|\/)\.claude\/settings\.json$/,
  /(^|\/)\.github\/(agents|prompts|instructions)\//,
  /(^|\/)\.cursor\/(rules|agents|commands)\//,
  /(^|\/)\.codex\/(agents\/|config\.toml$)/,
  /(^|\/)\.agents\/(rules|workflows)\//,
  /(^|\/)(AGENTS|CLAUDE|GEMINI)\.md$/,
  /(^|\/)docs\/architecture\/constitution\.md$/,
  /(^|\/)\.mcp\.json$/,
  // Aprobar una skill de terceros es una decisión de cadena de suministro (ASI04):
  // instrucciones que el agente obedecerá, más scripts que puede ejecutar.
  /(^|\/)\.sdd\/external-skills\.json$/,
];

if (gatesEnabled()) {
  for (const r of rutas) {
    if (politica.some((p) => p.test(r))) {
      decide(
        'ask',
        `\`${r}\` define el comportamiento de los agentes o la arquitectura del proyecto. ` +
          'Un cambio aquí afecta a todas las sesiones futuras: requiere revisión humana.',
        host,
      );
    }
  }
}

// ── deny: territorio ajeno ───────────────────────────────────────────────────
//
// Un handoff hace que el trabajo avance; NO impide que un agente haga lo que no le
// toca. Eso lo impide esto: se cruza el agente activo (que registran SubagentStart/
// SubagentStop) con la ruta que intenta escribir.
//
// La regla es "no entres en el territorio de otro", no "quédate en el tuyo": una ruta
// que no pertenece a nadie se permite. En un repo recién creado nadie sabe todavía
// dónde vive cada cosa, y una guarda que bloquea lo desconocido se desactiva el primer día.
if (gatesEnabled()) {
  const cfg = (() => {
    try {
      return JSON.parse(readIfExists(join(root, '.sdd/territories.json')) || 'null');
    } catch {
      return null; // un mapa ilegible no debe bloquear el trabajo; check-sdd lo denuncia
    }
  })();

  const agente = agenteActivo(root, input.session_id || 'default');
  const modo = cfg?.modo || 'deny';

  // Sin agente identificado es el hilo principal —el humano y su agente—, no un especialista.
  if (cfg && agente && modo !== 'off' && !(cfg.coordinadores || []).includes(agente)) {
    for (const [nombre, t] of Object.entries(cfg.territorios || {})) {
      const duenos = t.duenos || [];
      if (duenos.includes(agente)) continue;

      for (const r of rutas) {
        if (!(t.patrones || []).some((p) => globARegExp(p).test(r))) continue;
        decide(
          modo,
          `\`${r}\` es territorio de **${nombre}** (${duenos.join(', ') || 'sin dueño declarado'}) ` +
            `y quien escribe es **${agente}**.\n` +
            `Cada capa tiene su procedimiento —puertas de entrada, ciclo TDD y comprobaciones ` +
            `propias— y saltárselo es la forma habitual de colar un fallo. Devuelve el control a ` +
            `quien te invocó y que delegue en el especialista.\n` +
            `Si el reparto es incorrecto, se corrige en \`.sdd/territories.json\`, no ignorándolo.`,
          host,
        );
      }
    }
  }
}

// ── aviso que no bloquea ─────────────────────────────────────────────────────
const esNucleo = rutas.some(
  (r) => /^(src|app|lib|packages|services)\//.test(r) &&
         !/\.(test|spec)\./.test(r) &&
         /(^|\/)(domain|application)\//.test(r),
);
if (gatesEnabled() && esNucleo) {
  process.stderr.write(
    'ℹ️  Código de dominio/aplicación: asegúrate de tener el test ROJO demostrado antes.\n',
  );
}

decide('allow', 'Ruta permitida por la guarda SDD.', host);
