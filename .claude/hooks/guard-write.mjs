#!/usr/bin/env node
/**
 * PreToolUse (Edit|Write|MultiEdit|NotebookEdit) — controla dónde se puede escribir.
 *
 * Tres niveles de decisión, no dos:
 *   deny  → prohibido (secretos, artefactos generados)
 *   ask   → escala al humano (políticas de agentes, configuración compartida)
 *   allow → adelante
 */
import { readHookInput, decide, gatesEnabled, toolCall, rutasDe } from './_lib.mjs';

const input = await readHookInput();
const { entrada, antigravity } = toolCall(input);
const rutas = rutasDe(entrada);
const contenido = entrada.content || entrada.new_string || '';

if (!rutas.length) decide('allow', 'Sin ruta que evaluar.', antigravity);

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
    if (p.re.test(r)) decide('deny', `Escritura bloqueada en \`${r}\`. ${p.motivo}`, antigravity);
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
        antigravity,
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
  /(^|\/)\.agents\/(rules|workflows)\//,
  /(^|\/)(AGENTS|CLAUDE|GEMINI)\.md$/,
  /(^|\/)docs\/architecture\/constitution\.md$/,
  /(^|\/)\.mcp\.json$/,
];

if (gatesEnabled()) {
  for (const r of rutas) {
    if (politica.some((p) => p.test(r))) {
      decide(
        'ask',
        `\`${r}\` define el comportamiento de los agentes o la arquitectura del proyecto. ` +
          'Un cambio aquí afecta a todas las sesiones futuras: requiere revisión humana.',
        antigravity,
      );
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

decide('allow', 'Ruta permitida por la guarda SDD.', antigravity);
