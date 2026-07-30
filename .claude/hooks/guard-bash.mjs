#!/usr/bin/env node
/**
 * PreToolUse (Bash) — controla comandos.
 *
 *   deny  → destructivo o irreversible sin recuperación
 *   ask   → afecta infraestructura, datos remotos o historial compartido
 *   allow → adelante
 *
 * Distinguir `deny` de `ask` importa: bloquear un `terraform apply` legítimo
 * frustra; dejarlo pasar sin preguntar, arruina.
 */
import { readHookInput, decide, gatesEnabled, toolCall, comandosDe, hostDestino } from './_lib.mjs';

const input = await readHookInput();
const { entrada } = toolCall(input);
const host = hostDestino();
const comandos = comandosDe(entrada);
if (!comandos.length || !gatesEnabled()) decide('allow', 'Sin comando que evaluar.', host);

// ── deny: destructivo sin vuelta atrás ───────────────────────────────────────
const destructivos = [
  { re: /\brm\s+(-[a-z]*[rf][a-z]*\s+)+(\/|\/\*|~|\$HOME)(\s|$)/, motivo: 'Borrado recursivo de raíz o del home.' },
  { re: /\brm\s+-[a-z]*[rf]/, motivo: 'Borrado recursivo forzado. Enumera los ficheros.' },
  { re: /\bRemove-Item\b[^\r\n]*(-Recurse[^\r\n]*-Force|-Force[^\r\n]*-Recurse)/i, motivo: 'Borrado recursivo forzado (PowerShell).' },
  { re: /\bgit\s+reset\s+--hard\b/, motivo: 'Descarta cambios sin recuperación.' },
  { re: /\bgit\s+clean\s+-[a-z]*f/, motivo: 'Borra ficheros no rastreados de forma irreversible.' },
  { re: /\b(DROP|TRUNCATE)\s+(DATABASE|SCHEMA)\b/i, motivo: 'DDL destructivo sobre la base completa.' },
  { re: /\bDELETE\s+FROM\b(?![\s\S]*\bWHERE\b)/i, motivo: 'DELETE sin WHERE.' },
  { re: /\bUPDATE\s+\w+\s+SET\b(?![\s\S]*\bWHERE\b)/i, motivo: 'UPDATE sin WHERE.' },
  { re: /\b(curl|wget)\b[^|]*\|\s*(sudo\s+)?(ba)?sh\b/, motivo: 'Descargar y ejecutar a ciegas. Descarga, revisa y luego ejecuta.' },
  { re: /\bchmod\s+(-R\s+)?777\b/, motivo: 'Permisos 777.' },
  { re: /\bmkfs\b|\bdd\s+.*of=\/dev\//, motivo: 'Escritura directa sobre dispositivo.' },
  { re: /\bhistory\s+-c\b|\bshred\b/, motivo: 'Borrado de rastro.' },
  { re: /\b(cat|type|less|more|head|tail)\s+[^|;&]*\.env(\s|$)/, motivo: 'Lectura de secretos. Usa `.env.example`.' },
];

for (const cmd of comandos) {
  for (const d of destructivos) {
    if (d.re.test(cmd)) {
      decide(
        'deny',
        `Comando bloqueado: ${cmd.slice(0, 120)}\nMotivo: ${d.motivo}\n` +
          'Si es realmente necesario, explícaselo al usuario y que lo ejecute él.',
        host,
      );
    }
  }
}

// ── ask: reversible, pero con consecuencias fuera de tu máquina ──────────────
const sensibles = [
  { re: /\bgit\s+push\b[^\r\n]*(--force|-f)\b(?!\S*with-lease)/, motivo: 'Reescribe historia compartida. Considera --force-with-lease.' },
  { re: /\bgit\s+push\b/, motivo: 'Publica en el remoto.' },
  { re: /\bgit\s+(commit|merge|rebase)\b/, motivo: 'Modifica el historial local del repositorio.' },
  { re: /\bgit\s+branch\s+-D\b/, motivo: 'Borrado forzado de rama.' },
  { re: /\bDROP\s+TABLE\b/i, motivo: 'Elimina una tabla.' },
  { re: /\b(terraform|tofu|pulumi)\s+(apply|destroy)\b/, motivo: 'Cambia infraestructura real. Muestra el plan primero.' },
  { re: /\b(kubectl|helm)\b[^\r\n]*(delete|apply|upgrade)\b/, motivo: 'Cambia recursos en el clúster.' },
  { re: /\b(npm|pnpm|yarn)\s+publish\b|\bcargo\s+publish\b|\btwine\s+upload\b/, motivo: 'Publicación pública e irreversible.' },
  { re: /\bdocker\s+system\s+prune\b.*-a/, motivo: 'Purga total de Docker.' },
  { re: /\bgh\s+(pr\s+(create|merge)|release\s+create)\b/, motivo: 'Acción pública en GitHub.' },
];

for (const cmd of comandos) {
  for (const s of sensibles) {
    if (s.re.test(cmd)) {
      decide('ask', `${s.motivo}\nComando: ${cmd.slice(0, 160)}`, host);
    }
  }
}

decide('allow', 'Comando permitido por la guarda SDD.', host);
