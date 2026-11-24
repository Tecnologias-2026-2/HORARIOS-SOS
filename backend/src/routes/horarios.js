const express = require('express');
const { FieldValue, horariosDe } = require('../firebase');
const { requiereAuth } = require('../auth');
const { esTextoNoVacio, validarClase, haySolape, idValido } = require('../validators');

const router = express.Router();
router.use(requiereAuth);

const hacerAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const fila = (id, d) => ({ id, nombre: d.nombre, clases: d.clases || [] });
const millis = (d) => d.creadoEn?.toMillis?.() ?? 0;

// Valida nombre + clases y devuelve { error, status } o { nombre, clases } listas para guardar.
function validarHorario(body) {
  const { nombre, clases } = body || {};
  if (!esTextoNoVacio(nombre) || nombre.trim().length > 120) {
    return { status: 400, error: 'El nombre del horario es obligatorio (máximo 120 caracteres)' };
  }
  if (!Array.isArray(clases) || clases.length > 100) {
    return { status: 400, error: '"clases" debe ser una lista de máximo 100 clases' };
  }
  const limpias = [];
  for (const c of clases) {
    const { error, clase } = validarClase(c);
    if (error) return { status: 400, error: `Clase inválida en el horario: ${error}` };
    const { id: _omitido, ...sinId } = clase; // dentro de un horario las clases no llevan id
    limpias.push(sinId);
  }
  for (let i = 0; i < limpias.length; i++) {
    for (let j = i + 1; j < limpias.length; j++) {
      if (haySolape(limpias[i], limpias[j])) {
        return {
          status: 409,
          error: `Cruce de horario entre "${limpias[i].nombre}" y "${limpias[j].nombre}" (${limpias[i].dia})`,
        };
      }
    }
  }
  return { nombre: nombre.trim(), clases: limpias };
}

router.get('/', hacerAsync(async (req, res) => {
  const snap = await horariosDe(req.usuario.uid).get();
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => millis(a) - millis(b));
  res.json(docs.map((d) => fila(d.id, d)));
}));

// Crear
router.post('/', hacerAsync(async (req, res) => {
  const v = validarHorario(req.body);
  if (v.error) return res.status(v.status).json({ error: v.error });

  const { id } = req.body;
  if (id !== undefined && id !== null && !idValido(String(id))) {
    return res.status(400).json({ error: 'El id solo puede tener letras, números, guion y guion bajo' });
  }
  const col = horariosDe(req.usuario.uid);
  const ref = id ? col.doc(String(id)) : col.doc();
  try {
    await ref.create({
      nombre: v.nombre, clases: v.clases,
      creadoEn: FieldValue.serverTimestamp(), actualizadoEn: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    if (e.code === 6 || e.code === 'already-exists') return res.status(409).json({ error: 'Ya existe un horario con ese id' });
    throw e;
  }
  res.status(201).json({ id: ref.id, nombre: v.nombre, clases: v.clases });
}));

// Actualizar uno existente (el frontend lo usa al volver a guardar un horario con el mismo nombre)
router.put('/:id', hacerAsync(async (req, res) => {
  if (!idValido(req.params.id)) return res.status(404).json({ error: 'Horario no encontrado' });
  const v = validarHorario(req.body);
  if (v.error) return res.status(v.status).json({ error: v.error });

  const ref = horariosDe(req.usuario.uid).doc(req.params.id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: 'Horario no encontrado' });
  await ref.update({ nombre: v.nombre, clases: v.clases, actualizadoEn: FieldValue.serverTimestamp() });
  res.json({ id: ref.id, nombre: v.nombre, clases: v.clases });
}));

router.delete('/:id', hacerAsync(async (req, res) => {
  if (!idValido(req.params.id)) return res.status(404).json({ error: 'Horario no encontrado' });
  const ref = horariosDe(req.usuario.uid).doc(req.params.id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: 'Horario no encontrado' });
  await ref.delete();
  res.json({ mensaje: 'Horario eliminado' });
}));

module.exports = router;
