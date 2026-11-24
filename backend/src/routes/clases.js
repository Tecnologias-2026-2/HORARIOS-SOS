const express = require('express');
const { FieldValue, clasesDe } = require('../firebase');
const { requiereAuth } = require('../auth');
const { validarClase, haySolape, idValido } = require('../validators');

const router = express.Router();
router.use(requiereAuth);

const hacerAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const fila = (id, d) => ({ id, nombre: d.nombre, sede: d.sede, dia: d.dia, inicio: d.inicio, fin: d.fin, color: d.color });
const millis = (d) => d.creadoEn?.toMillis?.() ?? 0;

// Orden de creación (igual que antes); las clases sin fecha van primero.
router.get('/', hacerAsync(async (req, res) => {
  const snap = await clasesDe(req.usuario.uid).get();
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => millis(a) - millis(b));
  res.json(docs.map((d) => fila(d.id, d)));
}));

router.post('/', hacerAsync(async (req, res) => {
  const { error, clase } = validarClase(req.body);
  if (error) return res.status(400).json({ error });

  const col = clasesDe(req.usuario.uid);
  const delDia = await col.where('dia', '==', clase.dia).get();
  const choque = delDia.docs.map((d) => ({ id: d.id, ...d.data() }))
    .find((o) => o.id !== clase.id && haySolape(clase, o));
  if (choque) {
    return res.status(409).json({
      error: `Cruce de horario con "${choque.nombre}" (${choque.dia} ${choque.inicio}-${choque.fin})`,
    });
  }

  const ref = clase.id ? col.doc(clase.id) : col.doc();
  const { id: _omitido, ...datos } = clase;
  try {
    await ref.create({ ...datos, creadoEn: FieldValue.serverTimestamp() });
  } catch (e) {
    if (e.code === 6 || e.code === 'already-exists') return res.status(409).json({ error: 'Ya existe una clase con ese id' });
    throw e;
  }
  res.status(201).json({ id: ref.id, ...datos });
}));

router.delete('/:id', hacerAsync(async (req, res) => {
  if (!idValido(req.params.id)) return res.status(404).json({ error: 'Clase no encontrada' });
  const ref = clasesDe(req.usuario.uid).doc(req.params.id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: 'Clase no encontrada' });
  await ref.delete();
  res.json({ mensaje: 'Clase eliminada' });
}));

module.exports = router;
