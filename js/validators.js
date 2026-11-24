// =====================================================================
// Validaciones de clases y horarios (pasadas del backend del fork)
// Se ejecutan en el navegador ANTES de escribir en Firestore.
// Las reglas de firestore.rules repiten las más importantes en el servidor.
// =====================================================================
export const SEDES = ["Calle 100", "Campus Cajicá", "Sede Medicina"];
export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const DOMINIO_CORREO = "@unimilitar.edu.co";
export const COLOR_POR_DEFECTO = "#00ffff";

const norm = (s) =>
  String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

const SEDES_MAP = Object.fromEntries(SEDES.map((s) => [norm(s), s]));
const DIAS_MAP = Object.fromEntries(DIAS.map((d) => [norm(d), d]));

export const correoInstitucionalValido = (correo) =>
  typeof correo === "string" && correo.trim().toLowerCase().endsWith(DOMINIO_CORREO) &&
  /^[^@\s]+@unimilitar\.edu\.co$/i.test(correo.trim());

export const PASSWORD_MIN = 8; // el backend exigía mínimo 8 (Firebase por defecto solo exige 6)
export const passwordValida = (p) => typeof p === "string" && p.length >= PASSWORD_MIN;

const textoObligatorio = (v, max) => {
  const t = String(v ?? "").trim();
  return t.length > 0 && t.length <= max;
};

// Devuelve { error } o { perfil } con los campos limpios (igual que POST/PUT /usuarios del backend).
export function validarPerfil(d) {
  if (!d || typeof d !== "object") return { error: "El perfil es inválido." };
  if (!textoObligatorio(d.nombre, 120)) return { error: "El nombre es obligatorio (máximo 120 caracteres)." };
  if (!correoInstitucionalValido(d.correo)) return { error: `El correo debe terminar en ${DOMINIO_CORREO}.` };
  if (!textoObligatorio(d.carrera, 120)) return { error: "La carrera es obligatoria (máximo 120 caracteres)." };
  if (!textoObligatorio(d.codigo, 40)) return { error: "El código es obligatorio (máximo 40 caracteres)." };
  if (!textoObligatorio(d.semestre, 60)) return { error: "El semestre es obligatorio (máximo 60 caracteres)." };
  return {
    perfil: {
      nombre: String(d.nombre).trim(),
      correo: String(d.correo).trim().toLowerCase(),
      carrera: String(d.carrera).trim(),
      codigo: String(d.codigo).trim(),
      semestre: String(d.semestre).trim()
    }
  };
}

const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const horaValida = (h) => typeof h === "string" && HORA_RE.test(h) && h >= "07:00" && h <= "23:00";

// Error de validación: mensajeError() lo muestra tal cual al usuario.
export function errorValidacion(mensaje) {
  return Object.assign(new Error(mensaje), { code: "validacion" });
}

// Devuelve { error } o { clase } con los valores normalizados (sin id).
export function validarClase(c) {
  if (!c || typeof c !== "object") return { error: "La clase es inválida." };
  if (typeof c.nombre !== "string" || !c.nombre.trim() || c.nombre.trim().length > 120) {
    return { error: "El nombre de la clase es obligatorio (máximo 120 caracteres)." };
  }
  const sede = SEDES_MAP[norm(c.sede)];
  if (!sede) return { error: `Sede inválida. Opciones: ${SEDES.join(", ")}.` };
  const dia = DIAS_MAP[norm(c.dia)];
  if (!dia) return { error: `Día inválido. Opciones: ${DIAS.join(", ")}.` };
  if (!horaValida(c.inicio)) return { error: "La hora de inicio debe estar entre 07:00 y 23:00." };
  if (!horaValida(c.fin)) return { error: "La hora de fin debe estar entre 07:00 y 23:00." };
  if (c.fin <= c.inicio) return { error: "La hora de fin debe ser mayor que la de inicio." };

  const color = typeof c.color === "string" && /^#[0-9a-fA-F]{3,8}$/.test(c.color)
    ? c.color : COLOR_POR_DEFECTO;
  return { clase: { nombre: c.nombre.trim(), sede, dia, inicio: c.inicio, fin: c.fin, color } };
}

// Dos clases chocan si son el mismo día y sus horas se solapan.
export const haySolape = (a, b) => a.dia === b.dia && a.inicio < b.fin && b.inicio < a.fin;

// Lanza errorValidacion si alguna clase de la lista choca con otra.
export function exigirSinCruces(clases) {
  for (let i = 0; i < clases.length; i++) {
    for (let j = i + 1; j < clases.length; j++) {
      if (haySolape(clases[i], clases[j])) {
        throw errorValidacion(
          `Cruce de horario entre "${clases[i].nombre}" y "${clases[j].nombre}" (${clases[i].dia}).`
        );
      }
    }
  }
}
