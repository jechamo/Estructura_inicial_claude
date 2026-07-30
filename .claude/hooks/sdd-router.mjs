#!/usr/bin/env node
/**
 * UserPromptSubmit — recuerda la fase SDD adecuada según lo que pide el usuario.
 * No bloquea nunca: orienta. Bloquear el prompt del usuario sería insoportable.
 */
import { readHookInput, projectRoot, inject, allow, readIfExists, findActiveSpec } from './_lib.mjs';
import { join } from 'node:path';

const input = await readHookInput();
const prompt = (input.prompt || '').toLowerCase();
const root = projectRoot(input);

// Si el usuario ya invoca una skill del circuito, no estorbamos.
if (/^\s*\/(sdd-|onboard|adr|bitacora|tdd|security-scan|design-sync)/.test(input.prompt || '')) allow();

const patrones = [
  {
    re: /\b(implementa|impleméntalo|codifica|escribe el c[óo]digo|h[aá]zme (el|la)|prog[rá]amalo|desarrolla)\b/,
    aviso:
      'El usuario pide implementar. Antes de escribir código verifica que existe una spec ' +
      'aprobada y una tarea en `tasks.md` con test asociado. Si no la hay → `/sdd-specify`. ' +
      'Si la hay → `/sdd-implement` con ciclo rojo-verde-refactor.',
  },
  {
    re: /\b(nueva funcionalidad|nueva feature|a[ñn]ade|quiero que tambi[ée]n|necesito que haga)\b/,
    aviso: 'Suena a funcionalidad nueva → empieza por `/sdd-specify` (agente `spec-analyst`).',
  },
  {
    re: /\b(proyecto nuevo|desde cero|empezar un proyecto|crear (una )?(app|aplicaci[óo]n|api))\b/,
    aviso: 'Suena a proyecto nuevo → `/sdd-init` (agente `architect`) para fijar arquitectura y constitución.',
  },
  {
    re: /\b(ca[íi]d[oa]|producci[óo]n.*(cae|falla|rot[oa])|incidente|urgente|usuarios.*(no pueden|afectad)|est[áa] roto ahora)\b/,
    aviso:
      '⚠️ Suena a INCIDENTE en producción → `/respond-incident`. Primero se para el dolor ' +
      '(feature flag, reversión, degradación), después se diagnostica. No diagnostiques con ' +
      'usuarios cayéndose, y no toques la base de datos a mano.',
  },
  {
    re: /\b(no funciona|falla|error|bug|se rompe|petado)\b/,
    aviso:
      'Suena a defecto → triage con `@research-analyst`, y luego test de regresión ROJO antes del arreglo. ' +
      'Regla de las tres hipótesis: si tres intentos no confirman la causa, para de parchear y revisa supuestos. ' +
      'Si cambia el comportamiento esperado, es una spec nueva.',
  },
  {
    re: /\b(refactoriza|limpia|mejora el c[óo]digo|huele mal|deuda t[ée]cnica)\b/,
    aviso: 'Refactor → `@refactor-specialist`. Requisito previo: tests que cubran lo que vas a tocar, en verde.',
  },
  {
    re: /\b(lento|rendimiento|performance|optimiza|tarda mucho)\b/,
    aviso: 'Rendimiento → `@performance-optimizer`. No optimices sin medición previa ni sin objetivo declarado.',
  },
  {
    re: /\b(seguridad|vulnerab|owasp|inyecci[óo]n|autenticaci[óo]n|autorizaci[óo]n)\b/,
    aviso: 'Seguridad → `/security-scan` (agente `security-auditor`).',
  },
  {
    re: /\b(despliega|deploy|producci[óo]n|release|publica)\b/,
    aviso: 'Entrega → `/sdd-verify` y después `/sdd-ship`. Nada de push, merge ni deploy sin permiso explícito.',
  },
  {
    re: /\b(por qu[ée] (hicimos|se decidi[óo]|est[áa])|qui[ée]n decidi[óo]|hist[óo]rico)\b/,
    aviso: 'Consulta de memoria → `/bitacora` (agente `bitacora-keeper`).',
  },
];

const avisos = patrones.filter((p) => p.re.test(prompt)).map((p) => p.aviso);
if (!avisos.length) allow();

const salida = ['## Recordatorio SDD', ...avisos.map((a) => `- ${a}`)];

const spec = findActiveSpec(root);
if (spec) salida.push(`- Spec activa: **${spec.nombre}** (${spec.hechas}/${spec.total} tareas).`);
else if (!readIfExists(join(root, 'docs/architecture/constitution.md')))
  salida.push('- ⚠️ No hay constitución: el proyecto aún no está inicializado (`/sdd-init` o `/onboard`).');

inject(salida.join('\n'));
