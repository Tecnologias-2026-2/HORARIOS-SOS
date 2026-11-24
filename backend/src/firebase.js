// Conexión con la base de datos del proyecto: Firebase Auth + Cloud Firestore
// (mismas colecciones que ya usa el proyecto: usuarios/{uid}/clases y /horarios).
const admin = require('firebase-admin');

function credencial() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return admin.credential.applicationDefault(); // GOOGLE_APPLICATION_CREDENTIALS
  let texto = raw.trim();
  if (!texto.startsWith('{')) texto = Buffer.from(texto, 'base64').toString('utf8');
  const cuenta = JSON.parse(texto);
  if (cuenta.private_key) cuenta.private_key = cuenta.private_key.replace(/\\n/g, '\n');
  return admin.credential.cert(cuenta);
}

admin.initializeApp({
  credential: credencial(),
  projectId: process.env.FIREBASE_PROJECT_ID || 'horarios-sos',
});

const db = admin.firestore();
const auth = admin.auth();
const { FieldValue } = admin.firestore;

const refUsuario = (uid) => db.collection('usuarios').doc(uid);
const clasesDe = (uid) => refUsuario(uid).collection('clases');
const horariosDe = (uid) => refUsuario(uid).collection('horarios');

// El Admin SDK no puede comprobar contraseñas, así que se usa la API REST de Firebase Auth.
// Devuelve { uid, correo } si son correctas, o null si son incorrectas.
async function verificarPassword(correo, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: correo, password, returnSecureToken: false }),
  });
  const datos = await resp.json().catch(() => ({}));
  if (resp.ok) return { uid: datos.localId, correo: String(datos.email || correo).toLowerCase() };

  const msg = datos?.error?.message || '';
  if (/TOO_MANY_ATTEMPTS/.test(msg)) {
    throw Object.assign(new Error('Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'), { http: 429 });
  }
  if (/USER_DISABLED/.test(msg)) {
    throw Object.assign(new Error('La cuenta está deshabilitada'), { http: 403 });
  }
  if (/INVALID_LOGIN_CREDENTIALS|EMAIL_NOT_FOUND|INVALID_PASSWORD|INVALID_EMAIL|MISSING_PASSWORD/.test(msg)) return null;
  throw new Error(`Firebase Auth respondió: ${msg || resp.status}`);
}

module.exports = { admin, db, auth, FieldValue, refUsuario, clasesDe, horariosDe, verificarPassword };
