// =====================================================================
// Autenticación con Firebase Auth (correo + contraseña)
// Reemplaza a "usuariosList" y "usuarioActivo" de localStorage.
// La contraseña la guarda Firebase (cifrada); nunca se guarda en Firestore.
// =====================================================================
import { auth } from "../firebaseconfig.js";
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

export function registrarCuenta(correo, password) {
  return createUserWithEmailAndPassword(auth, correo, password);
}

export function iniciarSesion(correo, password) {
  return signInWithEmailAndPassword(auth, correo, password);
}

export function cerrarSesion() {
  return signOut(auth);
}

// Se usa si el registro falla a medias (cuenta creada pero perfil no guardado),
// para que el usuario pueda volver a intentarlo con el mismo correo.
export async function eliminarCuentaActual() {
  if (auth.currentUser) await deleteUser(auth.currentUser);
}

// Espera a que Firebase restaure la sesión guardada y devuelve el usuario.
// Si no hay sesión, redirige a la página de inicio de sesión.
export function requerirSesion(destino = "inicio.html") {
  return new Promise((resolve) => {
    const cancelar = onAuthStateChanged(auth, (user) => {
      cancelar();
      if (user) {
        resolve(user);
      } else {
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
