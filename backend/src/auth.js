const jwt = require('jsonwebtoken');

const COOKIE = 'sos_sesion';
const DIAS_SESION = 30;
const MS_SESION = DIAS_SESION * 24 * 60 * 60 * 1000; // 30 días

const firmarToken = (uid, correo) =>
  jwt.sign({ uid, correo }, process.env.JWT_SECRET, { expiresIn: `${DIAS_SESION}d` });

function leerCookie(req, nombre) {
  for (const parte of (req.headers.cookie || '').split(';')) {
    const i = parte.indexOf('=');
    if (i > 0 && parte.slice(0, i).trim() === nombre) {
      try { return decodeURIComponent(parte.slice(i + 1).trim()); } catch { return null; }
    }
  }
  return null;
}

// Frontend (github.io) y API (onrender.com) son sitios distintos, así que en producción la
// cookie debe ser SameSite=None + Secure. En localhost (mismo sitio) basta Lax sin Secure.
function opcionesCookie(req) {
  const local = ['localhost', '127.0.0.1'].includes(req.hostname);
  return {
    httpOnly: true,
    secure: !local,
    sameSite: local ? 'lax' : 'none',
    path: '/',
  };
}

function ponerCookieSesion(req, res, token) {
  res.cookie(COOKIE, token, { ...opcionesCookie(req), maxAge: MS_SESION }); // expira en 30 días
}

function borrarCookieSesion(req, res) {
  res.clearCookie(COOKIE, opcionesCookie(req));
}

// Acepta el token por cookie (httpOnly) o por "Authorization: Bearer" (respaldo para
// navegadores que bloquean cookies de terceros, como Safari).
function requiereAuth(req, res, next) {
  const [tipo, bearer] = (req.headers.authorization || '').split(' ');
  const candidatos = [tipo === 'Bearer' ? bearer : null, leerCookie(req, COOKIE)].filter(Boolean);
  if (!candidatos.length) {
    return res.status(401).json({ error: 'Debes iniciar sesión', codigo: 'sesion_invalida' });
  }
  for (const token of candidatos) {
    try {
      const p = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = { uid: p.uid, correo: p.correo };
      return next();
    } catch { /* prueba el siguiente */ }
  }
  res.status(401).json({ error: 'Sesión inválida o vencida', codigo: 'sesion_invalida' });
}

module.exports = {
  COOKIE, DIAS_SESION, firmarToken, requiereAuth, ponerCookieSesion, borrarCookieSesion,
};
