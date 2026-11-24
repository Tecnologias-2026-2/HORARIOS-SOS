// =====================================================================
// Sesión para las páginas privadas (dashboard, perfil, pag1, pag2,
// mis-horarios). Al importarlo:
//   1) exige sesión iniciada (si no hay, redirige a inicio.html)
//   2) conecta el modal de "Cerrar sesión" que usan todas esas páginas
//
// Uso:   import { usuarioListo } from "./js/sesion.js";
//        const usuario = await usuarioListo;   // usuario de Firebase Auth
// =====================================================================
import { requerirSesion, cerrarSesion } from "./auth.js";

export const usuarioListo = requerirSesion();

function abrirModalLogout() {
  const modal = document.getElementById("logout-modal");
  if (modal) {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }
}

function cerrarModalLogout() {
  const modal = document.getElementById("logout-modal");
  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }
}

async function confirmarCierreSesion() {
  try {
    await cerrarSesion();
  } finally {
    window.location.href = "index.html";
  }
}

// Los botones del HTML usan onclick="abrirModalLogout()", así que deben ser globales.
Object.assign(window, { abrirModalLogout, cerrarModalLogout, confirmarCierreSesion });
