require('dotenv').config();
const express = require('express');
const cors = require('cors');

for (const k of ['JWT_SECRET', 'FIREBASE_API_KEY']) {
  if (!process.env[k]) {
    console.error(`Falta la variable de entorno ${k}`);
    process.exit(1);
  }
}
if (!process.env.FIREBASE_SERVICE_ACCOUNT && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Falta FIREBASE_SERVICE_ACCOUNT (o GOOGLE_APPLICATION_CREDENTIALS) para conectar con Firestore');
  process.exit(1);
}

require('./firebase'); // inicializa Firebase Admin (Auth + Firestore)

const ORIGENES = (process.env.ALLOWED_ORIGINS ||
  'https://tecnologias-2026-2.github.io,http://localhost:5500,http://127.0.0.1:5500')
  .split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean);

const app = express();
app.set('trust proxy', 1); // Render va detrás de un proxy HTTPS

app.use(cors({
  origin(origin, cb) {
    if (!origin || ORIGENES.includes(origin)) return cb(null, true); // sin origen = curl/Postman
    cb(null, false);
  },
  credentials: true, // necesario para que el navegador envíe/reciba la cookie de sesión
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => res.json({ servicio: 'horarios-sos-api', estado: 'ok' }));

app.use('/api', require('./routes/usuarios'));
app.use('/api/clases', require('./routes/clases'));
app.use('/api/horarios', require('./routes/horarios'));

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  if (err.http) return res.status(err.http).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en el puerto ${PORT}`));
