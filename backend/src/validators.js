const SEDES = ['Calle 100', 'Campus Cajicá', 'Sede Medicina'];
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
// Vacío (DOMINIO_CORREO=) = acepta cualquier correo.
const DOMINIO = (process.env.DOMINIO_CORREO ?? '@unimilitar.edu.co').trim().toLowerCase();
const COLOR_POR_DEFECTO = '#00ffff';

const norm = (s) =>
  String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

const SEDES_MAP = Object.fromEntries(SEDES.map((s) => [norm(s), s]));
const DIAS_MAP = Object.fromEntries(DIAS.map((d) => [norm(d), d]));

const esTextoNoVacio = (v) => typeof v === 'string' && v.trim().length > 0;

function normalizarCorreo(correo) {
  return typeof correo === 'string' ? correo.trim().toLowerCase() : '';
}

function correoValido(correo) {
  const c = normalizarCorreo(correo);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c) || c.length > 254) return false;
  return !DOMINIO || c.endsWith(DOMINIO);
}

const mensajeCorreo = () =>
  DOMINIO ? `El correo debe terminar en ${DOMINIO}` : 'El correo no es válido';

function passwordValida(p) {
  return typeof p === 'string' && p.length >= 8;
}

// Los ids se usan como id de documento en Firestore.
const idValido = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(id);

const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const horaValida = (h) => typeof h === 'string' && HORA_RE.test(h) && h >= '07:00' && h <= '23:00';

// Devuelve { error } o { clase } con los valores normalizados.
function validarClase(c) {
  if (!c || typeof c !== 'object') return { error: 'La clase es inválida' };
  if (!esTextoNoVacio(c.nombre) || c.nombre.trim().length > 120) {
    return { error: 'El nombre de la clase es obligatorio (máximo 120 caracteres)' };
  }

  const sede = SEDES_MAP[norm(c.sede ?? '')];
  if (!sede) return { error: `Sede inválida. Opciones: ${SEDES.join(', ')}` };

  const dia = DIAS_MAP[norm(c.dia ?? '')];
  if (!dia) return { error: `Día inválido. Opciones: ${DIAS.join(', ')}` };

  if (!horaValida(c.inicio)) return { error: 'La hora de inicio debe estar entre 07:00 y 23:00 (formato HH:MM)' };
  if (!horaValida(c.fin)) return { error: 'La hora de fin debe estar entre 07:00 y 23:00 (formato HH:MM)' };
  if (c.fin <= c.inicio) return { error: 'La hora de fin debe ser mayor que la de inicio' };

  const clase = {
    nombre: c.nombre.trim(),
    sede,
    dia,
    inicio: c.inicio,
    fin: c.fin,
    color: typeof c.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(c.color) ? c.color : COLOR_POR_DEFECTO,
  };
  if (c.id !== undefined && c.id !== null && String(c.id).trim() !== '') {
    if (!idValido(String(c.id))) return { error: 'El id solo puede tener letras, números, guion y guion bajo' };
    clase.id = String(c.id);
  }
  return { clase };
}

// Dos clases chocan si son el mismo día y sus horas se solapan.
const haySolape = (a, b) => a.dia === b.dia && a.inicio < b.fin && b.inicio < a.fin;

module.exports = {
  SEDES, DIAS, DOMINIO, COLOR_POR_DEFECTO,
  esTextoNoVacio, normalizarCorreo, correoValido, mensajeCorreo, passwordValida,
  idValido, horaValida, validarClase, haySolape,
};
