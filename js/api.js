// =====================================================================
// Cliente HTTP de la API de Horarios SOS
// ---------------------------------------------------------------------
// - Envía la cookie de sesión del backend (credentials: "include").
// - Además guarda el token y lo manda como "Authorization: Bearer" como
//   respaldo, porque algunos navegadores (Safari, Brave) bloquean las
//   cookies entre sitios distintos (github.io -> onrender.com).
// =====================================================================
import { API_URL } from "./config.js";

const CLAVE_TOKEN = "sos_token";

export class ApiError extends Error {
  constructor(mensaje, { status, code } = {}) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const leerToken = () => {
  try { return localStorage.getItem(CLAVE_TOKEN); } catch { return null; }
};
export const guardarToken = (token) => {
  try { if (token) localStorage.setItem(CLAVE_TOKEN, token); } catch { /* sin storage */ }
};
export const borrarToken = () => {
  try { localStorage.removeItem(CLAVE_TOKEN); } catch { /* sin storage */ }
};

async function peticion(metodo, ruta, cuerpo) {
  const headers = {};
  if (cuerpo !== undefined) headers["Content-Type"] = "application/json";
  const token = leerToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let resp;
  try {
    resp = await fetch(API_URL + ruta, {
      method: metodo,
      headers,
      credentials: "include",
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined
    });
  } catch {
    throw new ApiError("No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.", {
      code: "auth/network-request-failed"
    });
  }

  const datos = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new ApiError(datos.error || `Error ${resp.status} del servidor`, {
      status: resp.status,
      code: datos.codigo
    });
  }
  return datos;
}

export const get = (ruta) => peticion("GET", ruta);
export const post = (ruta, cuerpo = {}) => peticion("POST", ruta, cuerpo);
export const put = (ruta, cuerpo = {}) => peticion("PUT", ruta, cuerpo);
export const del = (ruta) => peticion("DELETE", ruta);
