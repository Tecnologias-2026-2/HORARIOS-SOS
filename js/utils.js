// Utilidades compartidas por las páginas de Horarios SOS.

// Evita que texto escrito por el usuario (ej. el nombre de una materia)
// se interprete como HTML al pintarlo con innerHTML.
export function escapeHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Códigos de Firebase Auth que significan "correo o contraseña incorrectos".
const CODIGOS_CREDENCIALES = [
  "auth/invalid-credential",
  "auth/wrong-password",
  "auth/user-not-found",
  "auth/invalid-email",
  "auth/missing-password"
];

export function esErrorDeCredenciales(error) {
  return CODIGOS_CREDENCIALES.includes(error?.code);
}

// Convierte un error de Firebase en un mensaje entendible para el usuario.
export function mensajeError(error) {
  if (error?.code === "validacion") return error.message; // validaciones de js/validators.js
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "Este correo institucional ya está registrado.";
    case "auth/weak-password":
      return "La contraseña es muy débil. Usa una más larga.";
    case "auth/network-request-failed":
      return "No hay conexión con Firebase. Revisa tu internet e inténtalo de nuevo.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
    case "auth/operation-not-allowed":
      return "El inicio de sesión con correo/contraseña no está habilitado en Firebase (Authentication → Sign-in method).";
    case "auth/requires-recent-login":
      return "Por seguridad, vuelve a iniciar sesión e inténtalo de nuevo.";
    case "permission-denied":
      return "Firestore rechazó la operación (permission-denied). Revisa que las reglas de seguridad estén publicadas.";
    case "unavailable":
      return "No se pudo conectar con la base de datos. Revisa tu conexión.";
  }
  if (esErrorDeCredenciales(error)) return "Correo o contraseña incorrectos.";
  console.error(error);
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}
