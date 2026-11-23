🌐 Nombre del Proyecto: Horarios SoS

Horarios SOS es una aplicación web y móvil que permite a los estudiantes universitarios registrarse con su cuenta institucional, gestionar las materias que van a cursar, crear, guardar y visualizar diferentes alternativas de horarios teniendo en cuenta la sede donde se imparte cada materia, con el objetivo de elegir la opción que mejor se adapte a sus necesidades antes de realizar la carga académica oficial en la plataforma Univex.

👥 Integrantes:

Orlando Antonio Cely Mojica - 1202838

Alejandro Salazar Ortiz - 1202836

Danna Mychelle Bravo Aguilar - 1202820


🎯 1. Objetivo General:Esta iniciativa surge a partir de la pregunta sobre por qué se desarrolla esta propuesta y cuáles son los beneficios que ofrece. La razón principal es que la planificación previa a la carga académica es una práctica común entre los estudiantes, quienes buscan organizar y evaluar diferentes opciones de horarios y combinaciones de grupos para identificar las alternativas que mejor se ajusten a sus necesidades. Sin embargo, este proceso suele volverse confuso, ya que es fácil cometer errores al comparar horas, mezclar grupos o perder el orden de las opciones disponibles. Ante esta situación, la aplicación permitiría mantener una organización clara y estructurada de los horarios, facilitaría la visualización de las combinaciones posibles y contribuyendo a reducir errores, confusiones y el estrés durante el proceso de carga académica.

🌍 2. Contexto de Uso: Esta aplicación está dirigida a estudiantes universitarios de la Universidad Militar Nueva Granada. Su objetivo es facilitar la planificación de horarios con anticipación, ayudando a simplificar el proceso frustrante que puede ser la organización manual de los horarios.

📋 3. Requerimientos del Sistema
Requerimientos Funcionales:
-> El usuario puede registrarse en la aplicación mediante una cuenta vinculada a su correo electrónico. 
-> Dar la posibilidad de guardar múltiples combinaciones de horarios, junto con una lista organizada de los grupos y clases incluidas.
-> Implementar la opción de ingresar bloques de horario para cada grupo y clase de manera personalizada.
-> Permitir al usuario trabajar con un horario en blanco donde pueda combinar las opciones ingresadas previamente.  

Cómo debe comportarse el sistema:
-> Alertar al usuario cuando se pasa de créditos en un horario o está por debajo de la cantidad por semestre.
-> No permitir que dos diferentes materias o grupos de se crucen. 
-> Tener un apartado donde se encuentre los enlaces de las distintas páginas web donde se puede consultar información sobre la carga académica, además de los horarios publicados para el semestre por la universidad para las diferentes carreras.

🧠 4. Diagramas UML

Diagrama de Casos de Uso
La aplicación permite a los estudiantes gestionar su proceso académico mediante un sistema de registro e inicio de sesión que interactúa con el correo institucional, facilitando la creación de horarios personalizados a partir de la selección de materias, grupos y bloques de tiempo. Durante la planificación, el sistema incorpora herramientas de validación para detectar cruces de horarios y evaluar la viabilidad de los desplazamientos entre las sedes de Bogotá o Cajicá, además de verificar la validez de los créditos seleccionados. Una vez configurado y revisado, el usuario puede almacenar sus horarios preferidos en el sistema para consultarlos durante la carga académica, complementando su gestión con el acceso directo a enlaces, recursos oficiales e información de los diferentes programas académicos.

Diagrama de Secuencia
El proceso inicia cuando el estudiante inicia sesión y comienza a crear un nuevo horario ingresando las materias, grupos y bloques de tiempo correspondientes. A continuación, el sistema verifica que no existan cruces de horarios y que los créditos seleccionados sean válidos según los requisitos establecidos. Si se detectan conflictos o créditos inválidos, el flujo permite realizar correcciones antes de continuar. Finalmente, al superarse las validaciones, el estudiante guarda la configuración para visualizar su horario académico completo de forma organizada.

🎨 5. URL del Prototipo

https://www.figma.com/design/gaApeAscHBf9GRidXQ4lxr/WEB-HORARIOS-SOS?node-id=117-281&t=DMZvwGp7xpiRKpT4-1

🗄️ 6. Diseño de Base de Datos
La aplicación usa Firebase: Authentication (correo y contraseña) para las cuentas y Cloud Firestore para los datos. Todo cuelga del uid del usuario, de modo que cada estudiante solo accede a su propia información (ver firestore.rules).
-> Firebase Authentication: gestiona el registro, el inicio de sesión y la sesión activa. La contraseña la guarda Firebase y nunca se almacena en Firestore. Reemplaza a usuariosList y usuarioActivo.
-> usuarios/{uid}: perfil del estudiante (nombre, correo, carrera, codigo, semestre, creadoEn, actualizadoEn).
-> usuarios/{uid}/clases/{claseId}: materias agregadas por el usuario (nombre, sede, dia, inicio, fin, color, creadoEn). Reemplaza a clases_[correo].
-> usuarios/{uid}/horarios/{horarioId}: horarios guardados (nombre, clases[ {nombre, sede, dia, inicio, fin, color} ], creadoEn, actualizadoEn). Reemplaza a misHorarios_[correo].

🧩 7. Documentación del Sistema
El proyecto se encuentra organizado de manera modular para separar los estilos, las vistas, la lógica de Firebase y los recursos gráficos:
/css: Contiene las hojas de estilo dedicadas con un diseño dark-themed y detalles neón (styles.css, dashboard.css, estilo.css, estilomishorarios.css, estiloperfil.css).
/assets: Almacena los recursos gráficos e imágenes de marca de la aplicación (como logo-sos.png).
/js: Lógica de Firebase compartida por las páginas: auth.js (registro, inicio y cierre de sesión, cambio de contraseña), db.js (lectura y escritura en Firestore), sesion.js (protege las páginas privadas y conecta el cierre de sesión) y utils.js (utilidades y mensajes de error).
firebaseconfig.js: Inicializa Firebase (app, auth y db) y lo importan los módulos de /js.
firestore.rules: Reglas de seguridad de Firestore que se publican en Firebase Console.

🚀 8. Instalación y Ejecución
Clonar o descargar todos los archivos del repositorio en una misma carpeta en tu equipo.

Configuración de Firebase (una sola vez, en https://console.firebase.google.com, proyecto horarios-sos):
-> Authentication → Sign-in method: habilitar el proveedor "Correo electrónico/contraseña".
-> Firestore Database: crear la base de datos. No hace falta crear colecciones ni campos a mano: se crean solos la primera vez que se guarda un dato.
-> Firestore Database → Reglas: pegar el contenido de firestore.rules y pulsar "Publicar".
-> Authentication → Settings → Authorized domains: localhost viene autorizado; si se publica el sitio (por ejemplo en GitHub Pages) hay que agregar ese dominio.

Ejecución: como el código usa módulos de JavaScript y Firebase Authentication, ya NO se puede abrir index.html con doble clic (file://). Hay que servir la carpeta con un servidor local, por ejemplo:
-> Con Python: ejecutar "python -m http.server 5500" dentro de la carpeta y abrir http://localhost:5500
-> Con VS Code: instalar la extensión Live Server y pulsar "Go Live" sobre index.html.
Luego regístrate con un correo institucional, inicia sesión y explora todas las funcionalidades de gestión, validación y creación de horarios académicos.
