import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const readText = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : null);

export function seguridad_versionada(destino) {
  const checklist = readText(join(destino, 'docs/security/SECURITY-CHECKLIST.md')) || '';
  return /OWASP Top 10:2025/.test(checklist) && /ASVS 5\.0\.0/.test(checklist) &&
    Array.from({ length: 10 }, (_, i) => `A${String(i + 1).padStart(2, '0')}:2025`)
      .every((categoria) => checklist.includes(categoria));
}

export function contrato_jwt(destino) {
  const tokens = readText(join(destino, 'docs/security/AUTH-TOKENS.md')) || '';
  return /alg\s*:\s*none/i.test(tokens) &&
    ['iss', 'aud', 'sub', 'iat', 'exp', 'nbf', 'jti'].every((claim) => new RegExp(`\\b${claim}\\b`).test(tokens)) &&
    /firma|signature/i.test(tokens) && /rotaci[oó]n de claves|key rotation/i.test(tokens) &&
    /refresh token rotation/i.test(tokens) && /reuse detection/i.test(tokens) &&
    /revocaci[oó]n|revocation/i.test(tokens) && /logout/i.test(tokens) &&
    /roles|scopes/i.test(tokens) && /401/.test(tokens) && /403/.test(tokens) && /IDOR/.test(tokens) &&
    /URL|query/i.test(tokens) && /logs?/i.test(tokens) &&
    /no (?:se )?(?:impone|presupone|activa).*JWT/i.test(tokens);
}

export function csrf_no_samesite_solo(destino) {
  const tokens = readText(join(destino, 'docs/security/AUTH-TOKENS.md')) || '';
  return /SameSite[\s\S]{0,220}(?:no sustituye|no reemplaza|defensa en profundidad)/i.test(tokens) &&
    /HttpOnly/i.test(tokens) && /Secure/i.test(tokens) && /CSRF/i.test(tokens) &&
    /GET[\s\S]{0,100}(?:no muta|no debe mutar|sin mutaci[oó]n|no cambia(?:n)? estado)/i.test(tokens) &&
    /Bearer[\s\S]{0,220}(?:cookie|CSRF)/i.test(tokens);
}

export function matriz_seguridad(destino) {
  const spec = readText(join(destino, 'docs/specs/_TEMPLATE/spec.md')) || '';
  const plan = readText(join(destino, 'docs/specs/_TEMPLATE/plan.md')) || '';
  const tasks = readText(join(destino, 'docs/specs/_TEMPLATE/tasks.md')) || '';
  const tests = readText(join(destino, 'docs/specs/_TEMPLATE/test-plan.md')) || '';
  const evidence = readText(join(destino, 'docs/specs/_TEMPLATE/evidence.md')) || '';
  return /Impacto de seguridad/.test(spec) &&
    /Control\s*\|\s*ASVS\s*\|\s*OWASP\s*\|\s*Aplica\s*\|\s*Decisión \/ justificación\s*\|\s*Tarea\s*\|\s*Test\s*\|\s*Evidencia/.test(plan) &&
    /Controles de seguridad/.test(tasks) && /abuso|negativ/i.test(tests) &&
    /Informe de seguridad/.test(evidence) && /Controles de seguridad ejecutados/.test(evidence);
}

export function portabilidad_seguridad(destino) {
  const indice = readText(join(destino, 'docs/README.md')) || '';
  return /security\/AUTH-TOKENS\.md/.test(indice) &&
    /security\/SECURITY-CHECKLIST\.md/.test(indice) &&
    existsSync(join(destino, '.codex/agents/security-auditor.toml')) &&
    existsSync(join(destino, '.cursor/agents/security-auditor.md')) &&
    existsSync(join(destino, '.github/agents/security-auditor.agent.md'));
}

export function contrato_auditor_solo_lectura(destino) {
  const perfil = readText(join(destino, '.claude/agents/security-auditor.md')) || '';
  const cabecera = perfil.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] || '';
  const tools = cabecera.match(/^tools:\s*(.+)$/m)?.[1] || '';
  const camposHandoff = [
    'Agente origen', 'Fase completada', 'Fuentes consultadas', 'Estándares', 'Alcance',
    'Controles evaluados', 'Evidencias y comandos', 'Hallazgos', 'Riesgos aceptados',
    'Controles no ejecutados', 'Veredicto', 'Informe a materializar', 'Siguiente agente sugerido',
    'Comando / contexto durable',
  ];
  return /\bRead\b/.test(tools) && !/\b(?:Write|Edit|Agent)\b/.test(tools) &&
    /auditor de seguridad de solo lectura/i.test(perfil) && /### HANDOFF/.test(perfil) &&
    camposHandoff.every((campo) => perfil.includes(`- ${campo}:`));
}

const todosLosTextosCumplen = (textos, expresiones) =>
  textos.every((texto) => expresiones.every((expresion) => expresion.test(texto)));

const seccionSsrf = (texto) => {
  const inicio = texto.search(/^#{2,3}\s+(?:Peticiones salientes \(SSRF\/egress\)|SSRF y peticiones salientes \(egress\))\s*$/mi);
  if (inicio < 0) return '';
  const resto = texto.slice(inicio);
  const trasTitulo = resto.indexOf('\n') + 1;
  const siguiente = resto.slice(trasTitulo).search(/^#{1,3}\s+/m);
  return siguiente < 0 ? resto : resto.slice(0, trasTitulo + siguiente);
};

export function registrarContratosSsrf({ comprueba, origen, destinoInstalado }) {
  const skillFuente = readText(join(origen, '.agents/skills/security-scan/SKILL.md')) || '';
  const checklistFuente = readText(join(origen, 'docs/security/SECURITY-CHECKLIST.md')) || '';
  const skillInstalada = readText(join(destinoInstalado, '.agents/skills/security-scan/SKILL.md')) || '';
  const checklistInstalada = readText(join(destinoInstalado, 'docs/security/SECURITY-CHECKLIST.md')) || '';
  const adapterClaude = readText(join(destinoInstalado, '.claude/skills/security-scan/SKILL.md')) || '';
  const guiaFuente = readText(join(origen, 'docs/guides/COMO-TRABAJAR-CON-LOS-AGENTES.md')) || '';
  const guiaInstalada = readText(join(destinoInstalado, 'docs/guides/COMO-TRABAJAR-CON-LOS-AGENTES.md')) || '';
  const contratos = [skillFuente, checklistFuente, skillInstalada, checklistInstalada];
  const contratosSsrf = contratos.map(seccionSsrf);
  const clausulasExcepcion = [/local.*privad.*link-local|local, privada o link-local/is,
    /responsable/i, /alcance/i, /motivo material/i, /evidencia/i, /revisi[oó]n/i];
  const clausulasEstado = [/SSRF|petici[oó]n saliente|egress/i,
    /aplicabilidad/i, /estado/i, /decisi[oó]n/i, /evidencia/i, /no ejecutado/i,
    /nunca.*(?:PASS|superado|verde)/is, /riesgo/i, /responsable|owner/i, /siguiente paso/i];

  comprueba('contrato_ssrf_exige_destino_permitido',
    todosLosTextosCumplen(contratosSsrf, [/destino solicitado/i, /permitid|allowlist/i]),
    'falta una decisión explícita sobre el destino solicitado');
  comprueba('contrato_ssrf_exige_protocolo_permitido',
    todosLosTextosCumplen(contratosSsrf, [/protocolo/i, /permitid|allowlist/i]),
    'falta una decisión explícita sobre el protocolo');
  comprueba('contrato_ssrf_revalida_destino_efectivo',
    todosLosTextosCumplen(contratosSsrf, [/destino efectivo/i, /A\/AAAA/i, /antes de (?:conectar|continuar)/i]),
    'falta evaluar todas las resoluciones A/AAAA antes de conectar');
  comprueba('contrato_ssrf_revalida_cada_redireccion',
    todosLosTextosCumplen(contratosSsrf, [/cada (?:salto|redirecci[oó]n)/i, /revalid/i]),
    'falta revalidar cada redirección antes del siguiente salto');
  comprueba('contrato_ssrf_bloquea_metadata_sin_excepcion',
    todosLosTextosCumplen(contratosSsrf, [/metadata/i, /sin excepci[oó]n/i]),
    'metadata de infraestructura debe rechazarse sin excepción');
  comprueba('contrato_ssrf_exige_excepcion_interna_completa',
    todosLosTextosCumplen(contratosSsrf, clausulasExcepcion),
    'una excepción interna necesita responsable, alcance, motivo material, evidencia y revisión');
  comprueba('contrato_ssrf_no_admite_verde_implicito',
    todosLosTextosCumplen(contratosSsrf, clausulasEstado),
    'la ausencia de evidencia no puede presentarse como control superado');
  comprueba('contrato_ssrf_detecta_excepcion_sin_motivo_ni_revision',
    !todosLosTextosCumplen(contratosSsrf.map((texto) =>
      texto.replace(/motivo material, evidencia y revisi[oó]n/gi, 'evidencia')), clausulasExcepcion),
    'el test mutante debe detectar una excepción que pierda motivo material y revisión');
  comprueba('contrato_ssrf_detecta_perdida_de_separacion_del_estado',
    !todosLosTextosCumplen(contratosSsrf.map((texto) =>
      texto.replace(/aplicabilidad, estado, decisi[oó]n y evidencia/gi, 'resultado')), clausulasEstado),
    'el test mutante debe detectar la pérdida de aplicabilidad, estado, decisión y evidencia');
  comprueba('contrato_ssrf_separa_no_aplica_de_no_ejecutado',
    todosLosTextosCumplen(contratosSsrf, [/no aplica/i, /justificaci[oó]n\s+material/i, /no ejecutado/i]),
    'aplicabilidad y ejecución deben registrarse por separado');
  comprueba('contrato_ssrf_trata_contenido_como_dato',
    todosLosTextosCumplen([skillFuente, skillInstalada].map(seccionSsrf),
      [/documentos.*URLs.*respuestas.*evidencias/is, /datos? no confiables?/i,
        /no.*(?:reducir|omitir).*controles/is]),
    'el contenido auditado no puede redefinir el gate');
  comprueba('contrato_ssrf_minimiza_evidencia',
    todosLosTextosCumplen(contratosSsrf, [/sin (?:secretos|credenciales)/i,
      /sin (?:cuerpos completos|cuerpo completo)/i]),
    'la evidencia debe excluir secretos, credenciales y cuerpos completos');
  comprueba('instala_contrato_ssrf_portable_sin_duplicados',
    skillFuente === skillInstalada && checklistFuente === checklistInstalada &&
      todosLosTextosCumplen(contratosSsrf, [/SSRF/i, /destino efectivo/i]) &&
      /\.agents\/skills\/security-scan\/SKILL\.md/.test(adapterClaude) &&
      !/## (?:Alcance y marco|SSRF|Peticiones salientes)/i.test(adapterClaude),
    'la instalación debe conservar una fuente canónica y un adaptador mínimo');
  comprueba('contrato_ssrf_exige_timeout_material',
    todosLosTextosCumplen(contratosSsrf, [/timeout/i, /cancelaci[oó]n/i, /reintentos acotados/i,
      /hallazgo/i]),
    'la ausencia de timeout, cancelación o reintentos acotados debe producir un hallazgo');
  comprueba('contrato_ssrf_exige_limite_de_respuesta',
    todosLosTextosCumplen(contratosSsrf, [/l[ií]mite (?:m[aá]ximo|material).*(?:respuesta|datos)/is,
      /procesamiento/i, /hallazgo/i]),
    'la respuesta y su procesamiento necesitan un límite material o un hallazgo');
  comprueba('contrato_ssrf_resume_resultados_verificables',
    todosLosTextosCumplen([skillFuente, skillInstalada].map(seccionSsrf), [/resumen/i, /totales/i,
      /superado/i, /fallido/i, /no ejecutado/i, /no-aplica/i]),
    'el resumen opcional debe distinguir cada resultado verificable');
  comprueba('contrato_ssrf_agrupa_sin_perder_escenarios',
    todosLosTextosCumplen([skillFuente, skillInstalada].map(seccionSsrf), [/agrup/i,
      /IDs? (?:individuales|de escenario)/i, /no sustituye.*tabla individual/is]),
    'agrupar hallazgos debe conservar cada escenario y su fila individual');
  comprueba('la_guia_enlaza_el_contrato_ssrf_portable',
    todosLosTextosCumplen([guiaFuente, guiaInstalada], [/toda petici[oó]n saliente/i,
      /destino efectivo/i, /redirecciones/i, /metadata/i, /excepci[oó]n/i, /l[ií]mites/i,
      /evidencia/i, /\.agents\/skills\/security-scan\/SKILL\.md/i,
      /docs\/security\/SECURITY-CHECKLIST\.md/i]),
    'DOC-SKILLS debe explicar el corte y enlazar sus dos fuentes');
}
