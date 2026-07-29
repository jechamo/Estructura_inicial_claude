#!/usr/bin/env node
/**
 * SubagentStart / SubagentStop — deja rastro verificable de qué subagente trabajó.
 *
 * El problema que resuelve: la narración del chat ("ahora el backend-expert
 * implementa el caso de uso…") demuestra lo que el modelo *dice*, no lo que
 * *ocurrió*. Un botón de handoff cambia de agente; no prueba que ejecutara nada.
 *
 * Este hook lo registra desde fuera del modelo, en un fichero append-only:
 *   docs/specs/NNN-slug/execution-log.jsonl   (si hay spec activa)
 *   .sdd/agent-audit.jsonl                    (si no, para no perder el evento)
 *
 * Uso: node .claude/hooks/subagent-log.mjs start|stop
 */
import { readHookInput, projectRoot, logEjecucion, allow, valoresPorClave } from './_lib.mjs';

const evento = process.argv[2] === 'stop' ? 'stop' : 'start';
const input = await readHookInput();
const root = projectRoot(input);

const primero = (tokens) => valoresPorClave(input, tokens).find((v) => v && v.trim()) || null;

const agente =
  input.agent_type ||
  input.subagent_type ||
  primero(['agenttype', 'subagenttype', 'agentname', 'subagentname', 'agent']) ||
  'desconocido';

try {
  const { destino, spec } = logEjecucion(root, {
    evento: `subagent-${evento}`,
    agente,
    sesion: (input.session_id || '').slice(0, 8) || null,
    // `observed` = un hook del host vio el ciclo real del subagente.
    // Es el único nivel de verificación que no depende de lo que diga el modelo.
    verificacion: 'observed',
  });

  if (evento === 'stop') {
    const rel = destino.replace(/\\/g, '/').replace(root.replace(/\\/g, '/'), '.');
    process.stdout.write(
      `Bitácora: subagent-stop de \`${agente}\` registrado en ${rel}` +
        (spec ? ` (spec ${spec}).` : ' (sin spec activa).') +
        '\nAl cerrar la tarea en `tasks.md`, cita este agente y la evidencia real (ficheros, comandos, salida).\n',
    );
  }
} catch {
  /* la trazabilidad nunca debe romper la sesión */
}

allow();
