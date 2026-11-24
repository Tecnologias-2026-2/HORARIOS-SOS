// =====================================================================
// Autenticación contra la API (que usa Firebase Authentication por detrás)
// La sesión vive en una cookie httpOnly de 30 días que pone el backend.
// =====================================================================
import { get, post, put, guardarToken, borrarToken } from "./api.js";

export async function registrarUsuario({ nombre, correo, password, carrera, codigo, semestre }) {
  const { usuario, token } = await post("/api/usuarios", {
    nombre, correo, password, carrera, codigo, semestre
  });
  guardarToken(token);
  return usuario;
}

export async function iniciarSesion(correo, password) {
  const { usuario, token } = await post("/api/login", { correo, password });
  guardarToken(token);
  return usuario;
}

export async function cerrarSesion() {
  try {
    await post("/api/logout");
  } finally {
    borrarToken();
  }
}

// Devuelve el usuario de la sesión activa: { uid, email, nombre, correo, ... }.
// Si no hay sesión, redirige a la página de inicio de sesión.
export async function requerirSesion(destino = "inicio.html") {
  try {
    const { usuario } = await get("/api/me");
    return { ...usuario, email: usuario.correo };
  } catch (error) {
    if (error.status === 401) {
      borrarToken();
      window.location.replace(destino);
    } else {
      alert(error.message || "No se pudo conectar con el servidor.");
    }
    return new Promise(() => {}); // la página se va (o queda sin datos): la promesa no se resuelve
  }
}

// Cambiar la contraseña exige confirmar la actual.
export async function cambiarPassword(passwordActual, passwordNueva) {
  const { usuario } = await get("/api/me");
  await put(`/api/usuarios/${encodeURIComponent(usuario.correo)}/password`, {
    correo: usuario.correo,
    passwordActual,
    nuevaPassword: passwordNueva,
    confirmarPassword: passwordNueva
  });
}
