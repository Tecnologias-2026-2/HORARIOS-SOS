// =====================================================================
// Capa de datos: ahora habla con la API, que guarda todo en Cloud Firestore
// ---------------------------------------------------------------------
// Las funciones conservan los mismos nombres y parámetros de antes (el
// parámetro "uid" se mantiene por compatibilidad, pero la API identifica
// al usuario por su sesión, así que no se envía).
//
//   usuarios/{uid}                      -> perfil
//   usuarios/{uid}/clases/{claseId}     -> materias
//   usuarios/{uid}/horarios/{horarioId} -> horarios guardados
// =====================================================================
import { get, post, put, del, guardarToken } from "./api.js";

// ---------------------------------------------------------------- PERFIL
export async function obtenerPerfil(_uid) {
  const { usuario } = await get("/api/me");
  return usuario;
}

export async function guardarPerfil(_uid, { nombre, correo, carrera, codigo, semestre }) {
  const { token } = await put(`/api/usuarios/${encodeURIComponent(correo)}`, {
    nombre, correo, carrera, codigo, semestre
  });
  guardarToken(token);
}

// ---------------------------------------------------------------- CLASES
export const listarClases = (_uid) => get("/api/clases");

export const agregarClase = (_uid, { nombre, sede, dia, inicio, fin, color }) =>
  post("/api/clases", { nombre, sede, dia, inicio, fin, color });

export const eliminarClase = (_uid, claseId) => del(`/api/clases/${encodeURIComponent(claseId)}`);

// -------------------------------------------------------------- HORARIOS
export const listarHorarios = (_uid) => get("/api/horarios");

// Si recibe "id" actualiza ese horario; si no, crea uno nuevo.
// Devuelve el horario guardado: { id, nombre, clases }.
export function guardarHorario(_uid, { id, nombre, clases }) {
  return id
    ? put(`/api/horarios/${encodeURIComponent(id)}`, { nombre, clases })
    : post("/api/horarios", { nombre, clases });
}

export const eliminarHorario = (_uid, horarioId) => del(`/api/horarios/${encodeURIComponent(horarioId)}`);
