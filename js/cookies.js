// =====================================================================
// Cookies del sitio. La sesión de Firebase se guarda en el navegador sin
// vencimiento; esta cookie la hace caducar a los 30 días.
// (No guarda datos sensibles: solo una marca de "sesión iniciada".)
// =====================================================================
export const DIAS_SESION = 30;
export const COOKIE_SESION = "sos_sesion";
export const COOKIE_CONSENTIMIENTO = "sos_consentimiento";
const DIAS_CONSENTIMIENTO = 180;

export function guardarCookie(nombre, valor, dias = DIAS_SESION) {
  const seguro = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${nombre}=${encodeURIComponent(valor)}; Max-Age=${dias * 24 * 60 * 60}; Path=/; SameSite=Lax${seguro}`;
}

export function leerCookie(nombre) {
  for (const parte of document.cookie.split(";")) {
    const i = parte.indexOf("=");
    if (i > 0 && parte.slice(0, i).trim() === nombre) {
      try { return decodeURIComponent(parte.slice(i + 1).trim()); } catch { return null; }
    }
  }
  return null;
}

export function borrarCookie(nombre) {
  document.cookie = `${nombre}=; Max-Age=0; Path=/; SameSite=Lax`;
}

// ---------------------------------------------------------------------
// Consentimiento: el usuario decide en el aviso de cookies (js/banner-cookies.js)
// ---------------------------------------------------------------------
// Devuelve "si", "no" o null (todavía no ha decidido).
export function decisionCookies() {
  const v = leerCookie(COOKIE_CONSENTIMIENTO);
  return v === "si" || v === "no" ? v : null;
}

export const cookiesAceptadas = () => decisionCookies() === "si";

export function guardarConsentimiento(acepta) {
  guardarCookie(COOKIE_CONSENTIMIENTO, acepta ? "si" : "no", DIAS_CONSENTIMIENTO);
  if (!acepta) borrarCookie(COOKIE_SESION); // sin permiso no se conserva la sesión
}
