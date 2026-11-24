// =====================================================================
// Aviso de cookies (Aceptar / Rechazar)
// ---------------------------------------------------------------------
// Se muestra mientras el usuario no haya decidido. Si rechaza, las
// páginas públicas siguen funcionando; en inicio/registro el aviso
// vuelve a aparecer porque sin la cookie de sesión no se puede entrar.
// Se carga con: <script type="module" src="js/banner-cookies.js"></script>
// =====================================================================
import { decisionCookies, guardarConsentimiento, DIAS_SESION } from "./cookies.js";

const ES_PAGINA_DE_ACCESO = /(inicio|registro)(\.html)?\/?$/.test(window.location.pathname);

const ESTILOS = `
#sos-cookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;max-width:760px;margin:0 auto;
  display:flex;flex-wrap:wrap;gap:14px 18px;align-items:center;justify-content:space-between;
  padding:16px 18px;border:1px solid #28283d;border-radius:14px;background:#171727;color:#f6f6fa;
  box-shadow:0 12px 40px rgba(0,0,0,.55);font:14px/1.5 'Manrope',Inter,system-ui,-apple-system,'Segoe UI',sans-serif}
#sos-cookies strong{display:block;margin-bottom:2px;color:#00eaf5;font-size:15px}
#sos-cookies p{margin:0;flex:1 1 320px;color:#d6d6e2}
#sos-cookies .sos-cookies-botones{display:flex;gap:10px;flex:0 0 auto}
#sos-cookies button{cursor:pointer;border-radius:10px;padding:10px 18px;font:inherit;font-weight:700;border:1px solid #00eaf5}
#sos-cookies .sos-aceptar{background:#00eaf5;color:#090910}
#sos-cookies .sos-rechazar{background:transparent;color:#00eaf5}
#sos-cookies button:hover{filter:brightness(1.12)}
#sos-cookies button:focus-visible{outline:2px solid #ffd500;outline-offset:2px}
@media (max-width:520px){#sos-cookies .sos-cookies-botones{width:100%}#sos-cookies button{flex:1}}
`;

function mostrarAviso(rechazadoAntes) {
  const estilo = document.createElement("style");
  estilo.textContent = ESTILOS;

  const aviso = document.createElement("div");
  aviso.id = "sos-cookies";
  aviso.setAttribute("role", "dialog");
  aviso.setAttribute("aria-label", "Aviso de cookies");
  aviso.innerHTML = `
    <p>
      <strong>Usamos una cookie para tu sesión</strong>
      Guardamos una cookie necesaria que mantiene tu sesión iniciada durante ${DIAS_SESION} días.
      No guarda datos personales ni se usa para publicidad.
      ${rechazadoAntes ? "<br><b>Sin esta cookie no puedes iniciar sesión.</b>" : "Si la rechazas, no podrás iniciar sesión."}
    </p>
    <div class="sos-cookies-botones">
      <button type="button" class="sos-rechazar">Rechazar</button>
      <button type="button" class="sos-aceptar">Aceptar</button>
    </div>`;

  const cerrar = (acepta) => {
    guardarConsentimiento(acepta);
    aviso.remove();
    estilo.remove();
  };
  aviso.querySelector(".sos-aceptar").addEventListener("click", () => cerrar(true));
  aviso.querySelector(".sos-rechazar").addEventListener("click", () => cerrar(false));

  document.head.appendChild(estilo);
  document.body.appendChild(aviso);
  aviso.querySelector(".sos-aceptar").focus({ preventScroll: true });
}

const decision = decisionCookies();
if (decision === null || (decision === "no" && ES_PAGINA_DE_ACCESO)) {
  mostrarAviso(decision === "no");
}
