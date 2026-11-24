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

// Códigos que significan "correo o contraseña incorrectos" (los envía la API).
const CODIGOS_CREDENCIALES = [
  "credenciales_invalidas",
  "password_actual_incorrecta"
];

export function esErrorDeCredenciales(error) {
  return CODIGOS_CREDENCIALES.includes(error?.code);
}

// Convierte un error de la API en un mensaje entendible para el usuario.
export function mensajeError(error) {
  if (error?.code === "auth/network-request-failed") {
    return "No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.";
  }
  if (error?.name === "ApiError") return error.message;
  console.error(error);
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}
