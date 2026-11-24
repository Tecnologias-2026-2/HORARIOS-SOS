# Horarios SOS – API

API en Node.js + Express conectada a la base de datos del proyecto en **Firebase**
(Authentication para las cuentas y Cloud Firestore para los datos). Usa las mismas
colecciones que ya existían: `usuarios/{uid}`, `usuarios/{uid}/clases` y `usuarios/{uid}/horarios`.

## Correr en local
```bash
cd backend
npm install
cp .env.example .env     # completa JWT_SECRET y FIREBASE_SERVICE_ACCOUNT
npm start                # http://localhost:3000
```
Luego sirve el frontend desde la raíz del repo (`python -m http.server 5500`) y abre http://localhost:5500.

## Variables de entorno
| Variable | Descripción |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | JSON de la cuenta de servicio (en una línea o en base64). **Secreto.** |
| `GOOGLE_APPLICATION_CREDENTIALS` | Alternativa local: ruta al JSON descargado |
| `FIREBASE_PROJECT_ID` | `horarios-sos` |
| `FIREBASE_API_KEY` | La `apiKey` web del proyecto (pública); sirve para verificar contraseñas |
| `JWT_SECRET` | Secreto para firmar la sesión |
| `ALLOWED_ORIGINS` | Orígenes del frontend permitidos por CORS (coma). Incluye `https://tecnologias-2026-2.github.io` |
| `DOMINIO_CORREO` | Dominio de correo exigido (vacío = cualquiera) |
| `PORT` | Puerto (Render lo asigna solo) |

La cuenta de servicio se genera en Firebase Console → Configuración del proyecto → Cuentas de servicio → *Generar nueva clave privada*.

## Sesión y cookies
Al registrarse o iniciar sesión la API pone la cookie **`sos_sesion`** (httpOnly, `Secure`, `SameSite=None`
en producción) que **expira a los 30 días**, y también devuelve el `token` (JWT de 30 días) en el cuerpo
como respaldo para navegadores que bloquean cookies entre sitios (Safari/Brave).
Las rutas protegidas aceptan la cookie o `Authorization: Bearer <token>`.

## Endpoints
| Método | Ruta | Auth |
|---|---|---|
| POST | `/api/usuarios` (registro) | no |
| POST | `/api/login` | no |
| POST | `/api/logout` | no |
| GET | `/api/me` | sí |
| PUT | `/api/usuarios/:correo` | sí (solo el dueño) |
| PUT | `/api/usuarios/:correo/password` (requiere `passwordActual`) | sí (solo el dueño) |
| GET / POST | `/api/clases` | sí |
| DELETE | `/api/clases/:id` | sí |
| GET / POST | `/api/horarios` | sí |
| PUT / DELETE | `/api/horarios/:id` | sí |

## Despliegue (Render)
Web Service con Root Directory `backend`, build `npm install`, start `npm start`, y las variables de arriba.
Después pon la URL pública del servicio en `js/config.js` (raíz del repo).
