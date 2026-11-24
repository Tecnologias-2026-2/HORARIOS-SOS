const express = require('express');
const { auth, FieldValue, refUsuario, verificarPassword } = require('../firebase');
const {
  firmarToken, requiereAuth, ponerCookieSesion, borrarCookieSesion,
} = require('../auth');
const {
  esTextoNoVacio, normalizarCorreo, correoValido, mensajeCorreo, passwordValida,
} = require('../validators');

const router = express.Router();
const hacerAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const publico = (uid, p) => ({
  uid, nombre: p.nombre, correo: p.correo, carrera: p.carrera, codigo: p.codigo, semestre: p.semestre,
});

// Abre sesión: cookie httpOnly de 30 días + token en el cuerpo (respaldo sin cookies).
function abrirSesion(req, res, status, uid, perfil) {
  const token = firmarToken(uid, perfil.correo);
  ponerCookieSesion(req, res, token);
  res.status(status).json({ usuario: publico(uid, perfil), token });
}

// Registro: crea la cuenta en Firebase Auth y el perfil en usuarios/{uid}
router.post('/usuarios', hacerAsync(async (req, res) => {
  const { nombre, correo, password, carrera, codigo, semestre } = req.body || {};
  if (!esTextoNoVacio(nombre)) return res.status(400).json({ error: 'El nombre es obligatorio' });
  if (!correoValido(correo)) return res.status(400).json({ error: mensajeCorreo() });
  if (!passwordValida(password)) return res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres' });
  if (!esTextoNoVacio(carrera)) return res.status(400).json({ error: 'La carrera es obligatoria' });
  if (!esTextoNoVacio(String(codigo ?? ''))) return res.status(400).json({ error: 'El código es obligatorio' });
  if (!esTextoNoVacio(String(semestre ?? ''))) return res.status(400).json({ error: 'El semestre es obligatorio' });

  const email = normalizarCorreo(correo);
  let cuenta;
  try {
    cuenta = await auth.createUser({ email, password, displayName: nombre.trim() });
  } catch (e) {
    if (e.code === 'auth/email-already-exists') return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
    if (e.code === 'auth/invalid-password') return res.status(400).json({ error: 'La contraseña no es válida' });
    if (e.code === 'auth/invalid-email') return res.status(400).json({ error: mensajeCorreo() });
    throw e;
  }

  const perfil = {
    nombre: nombre.trim(), correo: email, carrera: carrera.trim(),
    codigo: String(codigo).trim(), semestre: String(semestre).trim(),
  };
  try {
    await refUsuario(cuenta.uid).set({ ...perfil, creadoEn: FieldValue.serverTimestamp() });
  } catch (e) {
    await auth.deleteUser(cuenta.uid).catch(() => {}); // deshace la cuenta para poder reintentar
    throw e;
  }
  abrirSesion(req, res, 201, cuenta.uid, perfil);
}));

// Login
router.post('/login', hacerAsync(async (req, res) => {
  const { correo, password } = req.body || {};
  const malas = { error: 'Correo o contraseña incorrectos', codigo: 'credenciales_invalidas' };
  if (!correoValido(correo) || typeof password !== 'string' || !password) return res.status(400).json(malas);

  const ok = await verificarPassword(normalizarCorreo(correo), password);
  if (!ok) return res.status(401).json(malas);

  const snap = await refUsuario(ok.uid).get();
  const perfil = snap.exists
    ? snap.data()
    : { nombre: ok.correo, correo: ok.correo, carrera: '', codigo: '', semestre: '' };
  abrirSesion(req, res, 200, ok.uid, { ...perfil, correo: ok.correo });
}));

// Cerrar sesión: borra la cookie
router.post('/logout', (req, res) => {
  borrarCookieSesion(req, res);
  res.json({ mensaje: 'Sesión cerrada' });
});

// Usuario de la sesión actual (el frontend lo usa para saber si hay sesión)
router.get('/me', requiereAuth, hacerAsync(async (req, res) => {
  const { uid, correo } = req.usuario;
  const snap = await refUsuario(uid).get();
  const perfil = snap.exists ? snap.data() : { nombre: correo, correo, carrera: '', codigo: '', semestre: '' };
  res.json({ usuario: publico(uid, { ...perfil, correo }) });
}));

// Solo el dueño de la cuenta puede modificarla.
function soloDueno(req, res, next) {
  let correoUrl;
  try { correoUrl = normalizarCorreo(decodeURIComponent(req.params.correo)); } catch { correoUrl = ''; }
  if (correoUrl !== req.usuario.correo) {
    return res.status(403).json({ error: 'No puedes modificar a otro usuario' });
  }
  req.correoActual = correoUrl;
  next();
}

// Editar perfil
router.put('/usuarios/:correo', requiereAuth, soloDueno, hacerAsync(async (req, res) => {
  const { nombre, codigo, correo, carrera, semestre } = req.body || {};
  if (!esTextoNoVacio(nombre)) return res.status(400).json({ error: 'El nombre es obligatorio' });
  if (!correoValido(correo)) return res.status(400).json({ error: mensajeCorreo() });
  if (!esTextoNoVacio(carrera)) return res.status(400).json({ error: 'La carrera es obligatoria' });
  if (!esTextoNoVacio(String(codigo ?? ''))) return res.status(400).json({ error: 'El código es obligatorio' });
  if (!esTextoNoVacio(String(semestre ?? ''))) return res.status(400).json({ error: 'El semestre es obligatorio' });

  const { uid } = req.usuario;
  const nuevo = normalizarCorreo(correo);
  if (nuevo !== req.correoActual) {
    try {
      await auth.updateUser(uid, { email: nuevo });
    } catch (e) {
      if (e.code === 'auth/email-already-exists') return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
      throw e;
    }
  }
  const perfil = {
    nombre: nombre.trim(), correo: nuevo, carrera: carrera.trim(),
    codigo: String(codigo).trim(), semestre: String(semestre).trim(),
  };
  await refUsuario(uid).set({ ...perfil, actualizadoEn: FieldValue.serverTimestamp() }, { merge: true });
  // Si cambió el correo, el token anterior ya no coincide: se entrega uno nuevo.
  abrirSesion(req, res, 200, uid, perfil);
}));

// Cambiar contraseña (exige la actual, igual que Firebase)
router.put('/usuarios/:correo/password', requiereAuth, soloDueno, hacerAsync(async (req, res) => {
  const { correo, passwordActual, nuevaPassword, confirmarPassword } = req.body || {};
  if (correo !== undefined && normalizarCorreo(correo) !== req.correoActual) {
    return res.status(400).json({ error: 'El correo no coincide con el de la ruta' });
  }
  if (typeof passwordActual !== 'string' || !passwordActual) {
    return res.status(400).json({ error: 'Debes enviar la contraseña actual' });
  }
  if (!passwordValida(nuevaPassword)) {
    return res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres' });
  }
  if (nuevaPassword !== confirmarPassword) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }
  const ok = await verificarPassword(req.correoActual, passwordActual);
  if (!ok) return res.status(400).json({ error: 'La contraseña actual no es correcta', codigo: 'password_actual_incorrecta' });

  await auth.updateUser(req.usuario.uid, { password: nuevaPassword });
  res.json({ mensaje: 'Contraseña actualizada' });
}));

module.exports = router;
