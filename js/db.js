// =====================================================================
// Capa de datos con Cloud Firestore
// ---------------------------------------------------------------------
// Estructura (todo cuelga del uid del usuario, así cada estudiante
// solo puede ver y modificar lo suyo — ver firestore.rules):
//
//   usuarios/{uid}                      -> perfil
//       nombre, correo, carrera, codigo, semestre, creadoEn, actualizadoEn
//   usuarios/{uid}/clases/{claseId}     -> materias (bloques de horario)
//       nombre, sede, dia, inicio, fin, color, creadoEn
//   usuarios/{uid}/horarios/{horarioId} -> horarios guardados
//       nombre, clases[ {nombre, sede, dia, inicio, fin, color} ],
//       creadoEn, actualizadoEn
//
// Equivalencia con el localStorage anterior:
//   usuariosList / usuarioActivo -> usuarios/{uid}  (+ Firebase Auth)
//   clases_[correo]              -> usuarios/{uid}/clases
//   misHorarios_[correo]         -> usuarios/{uid}/horarios
// =====================================================================
import { db } from "../firebaseconfig.js";
import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import {
  validarClase, haySolape, exigirSinCruces, errorValidacion,
  validarPerfil
} from "./validators.js";

const perfilRef = (uid) => doc(db, "usuarios", uid);
const clasesCol = (uid) => collection(db, "usuarios", uid, "clases");
const horariosCol = (uid) => collection(db, "usuarios", uid, "horarios");

// Ordena por fecha de creación (los documentos sin fecha quedan primero).
function porCreacion(a, b) {
  const ta = a.creadoEn?.toMillis?.() ?? 0;
  const tb = b.creadoEn?.toMillis?.() ?? 0;
  return ta - tb;
}

// Solo los campos de una clase que se guardan dentro de un horario.
function soloCamposDeClase({ nombre, sede, dia, inicio, fin, color }) {
  return { nombre, sede, dia, inicio, fin, color };
}

// ---------------------------------------------------------------- PERFIL
export async function crearPerfil(uid, datos) {
  // Mismas validaciones del backend: campos obligatorios y correo institucional.
  const { error, perfil } = validarPerfil(datos);
  if (error) throw errorValidacion(error);
  await setDoc(perfilRef(uid), {
    ...perfil,
    creadoEn: serverTimestamp()
  });
}

export async function obtenerPerfil(uid) {
  const snap = await getDoc(perfilRef(uid));
  return snap.exists() ? snap.data() : null;
}

// merge:true => funciona aunque el perfil no exista todavía y no pisa creadoEn.
export async function guardarPerfil(uid, datos) {
  const { error, perfil } = validarPerfil(datos);
  if (error) throw errorValidacion(error);
  await setDoc(perfilRef(uid), {
    ...perfil,
    actualizadoEn: serverTimestamp()
  }, { merge: true });
}

// ---------------------------------------------------------------- CLASES
export async function listarClases(uid) {
  const snap = await getDocs(clasesCol(uid));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(porCreacion);
}

export async function agregarClase(uid, clase) {
  // Validaciones del backend: sede/día/horas válidas y sin cruces con otras clases.
  const { error, clase: limpia } = validarClase(clase);
  if (error) throw errorValidacion(error);

  const existentes = await listarClases(uid);
  const choque = existentes.find((o) => haySolape(limpia, o));
  if (choque) {
    throw errorValidacion(
      `Cruce de horario con "${choque.nombre}" (${choque.dia} ${choque.inicio}-${choque.fin}).`
    );
  }

  const datos = soloCamposDeClase(limpia);
  const ref = await addDoc(clasesCol(uid), { ...datos, creadoEn: serverTimestamp() });
  return { id: ref.id, ...datos };
}

export async function eliminarClase(uid, claseId) {
  await deleteDoc(doc(db, "usuarios", uid, "clases", claseId));
}

// -------------------------------------------------------------- HORARIOS
export async function listarHorarios(uid) {
  const snap = await getDocs(horariosCol(uid));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(porCreacion);
}

// Si recibe "id" actualiza ese horario; si no, crea uno nuevo.
// Devuelve el horario guardado: { id, nombre, clases }.
export async function guardarHorario(uid, { id, nombre, clases }) {
  if (typeof nombre !== "string" || !nombre.trim() || nombre.trim().length > 120) {
    throw errorValidacion("El nombre del horario es obligatorio (máximo 120 caracteres).");
  }
  if (!Array.isArray(clases) || clases.length > 100) {
    throw errorValidacion("El horario debe tener una lista de máximo 100 clases.");
  }
  const copiaClases = clases.map((c) => {
    const { error, clase } = validarClase(c);
    if (error) throw errorValidacion(`Clase inválida en el horario: ${error}`);
    return soloCamposDeClase(clase);
  });
  exigirSinCruces(copiaClases);
  nombre = nombre.trim();

  if (id) {
    await setDoc(doc(db, "usuarios", uid, "horarios", id), {
      nombre,
      clases: copiaClases,
      actualizadoEn: serverTimestamp()
    }, { merge: true });
    return { id, nombre, clases: copiaClases };
  }

  const ref = await addDoc(horariosCol(uid), {
    nombre,
    clases: copiaClases,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return { id: ref.id, nombre, clases: copiaClases };
}

export async function eliminarHorario(uid, horarioId) {
  await deleteDoc(doc(db, "usuarios", uid, "horarios", horarioId));
}
