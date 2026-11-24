// =====================================================================
// Autenticación con Firebase Auth (correo + contraseña)
// Reemplaza a "usuariosList" y "usuarioActivo" de localStorage.
// La contraseña la guarda Firebase (cifrada); nunca se guarda en Firestore.
// =====================================================================
import { auth } from "../firebaseconfig.js";
import { guardarCookie, leerCookie, borrarCookie } from "./cookies.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

// Cookie "sos_sesion": marca de sesión iniciada que vence a los 30 días.
const COOKIE_SESION = "sos_sesion";

export async function registrarCuenta(correo, password) {
  const credencial = await createUserWithEmailAndPassword(auth, correo, password);
  guardarCookie(COOKIE_SESION, "1"); // 30 días
  return credencial;
}

export async function iniciarSesion(correo, password) {
  const credencial = await signInWithEmailAndPassword(auth, correo, password);
  guardarCookie(COOKIE_SESION, "1"); // 30 días
  return credencial;
}

export async function cerrarSesion() {
  borrarCookie(COOKIE_SESION);
  await signOut(auth);
}

// Se usa si el registro falla a medias (cuenta creada pero perfil no guardado),
// para que el usuario pueda volver a intentarlo con el mismo correo.
export async function eliminarCuentaActual() {
  borrarCookie(COOKIE_SESION);
  if (auth.currentUser) await deleteUser(auth.currentUser);
}

// Espera a que Firebase restaure la sesión guardada y devuelve el usuario.
// Si no hay sesión, o la cookie de 30 días ya venció, cierra sesión y redirige
// a la página de inicio de sesión.
export function requerirSesion(destino = "inicio.html") {
  return new Promise((resolve) => {
    const cancelar = onAuthStateChanged(auth, async (user) => {
      cancelar();
      if (user && leerCookie(COOKIE_SESION)) {
        resolve(user);
      } else {
        if (user) await signOut(auth).catch(() => {}); // sesión vencida (más de 30 días)
        window.location.replace(destino); // la promesa queda pendiente: la página se va
      }
    });
  });
}

// Cambiar la contraseña exige confirmar la actual (re-autenticación).
export async function cambiarPassword(passwordActual, passwordNueva) {
  const user = auth.currentUser;
  const credencial = EmailAuthProvider.credential(user.email, passwordActual);
  await reauthenticateWithCredential(user, credencial);
  await updatePassword(user, passwordNueva);
}
