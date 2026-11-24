// =====================================================================
// Inicialización de Firebase (Horarios SOS)
// ---------------------------------------------------------------------
// El proyecto es HTML estático sin bundler, por eso el SDK se importa
// desde la CDN oficial (gstatic) y no desde "firebase/app".
// Todos los imports de Firebase del proyecto deben usar LA MISMA versión.
// Los demás módulos usan este archivo así:
//     import { auth, db } from "../firebaseconfig.js";
// =====================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_cBgPUyfBlA5D_WSovrnwhVEqV6VLx8c",
  authDomain: "horarios-sos.firebaseapp.com",
  projectId: "horarios-sos",
  storageBucket: "horarios-sos.firebasestorage.app",
  messagingSenderId: "111766566137",
  appId: "1:111766566137:web:41b83f28e089f7d8b41e28",
  measurementId: "G-3WWL7CW7F8"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics es opcional: se carga aparte para que, si el navegador o un
// bloqueador de anuncios lo impide, el resto de la app siga funcionando.
import("https://www.gstatic.com/firebasejs/13.4.0/firebase-analytics.js")
  .then(({ getAnalytics, isSupported }) =>
    isSupported().then((ok) => { if (ok) getAnalytics(app); })
  )
  .catch(() => { /* sin analytics, no pasa nada */ });
