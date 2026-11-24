// =====================================================================
// URL del backend (API de Horarios SOS)
// ---------------------------------------------------------------------
// En local (localhost) usa la API que corre en tu computador.
// En GitHub Pages usa la API desplegada (Render, Railway, etc.).
// >>> CAMBIA la URL de producción por la de tu servicio desplegado. <<<
// =====================================================================
const EN_LOCAL = ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_URL = EN_LOCAL
  ? "http://localhost:3000"
  : "https://CAMBIA-ESTO.onrender.com";
