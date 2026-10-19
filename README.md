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
-> usuariosList: Almacena las cuentas registradas en el sistema (Nombre, Correo institucional, Contraseña, Código de estudiante y Semestre).
-> usuarioActivo: Mantiene la sesión actual del usuario autenticado en el sistema.
-> clases_[correo]: Colección específica vinculada a cada usuario que almacena el listado de materias agregadas (id, nombre, sede, dia, inicio, fin, color).
-> misHorarios_[correo]: Almacena los horarios configurados y guardados por el usuario, agrupando el nombre del horario y su respectiva lista de clases asociadas para su consulta en el perfil.

🧩 7. Documentación del Sistema
El proyecto se encuentra organizado de manera modular para separar los estilos, las vistas y los recursos gráficos:
/css: Contiene las hojas de estilo dedicadas con un diseño neo-neon dark-themed (estiloperfil.css, estilomishorarios.css, estilo2.css, estilo.css, dashboard.css).
/assets: Almacena los recursos gráficos e imágenes institucionales y de marca de la aplicación (como logo-sos.png).


🚀 8. Instalación y Ejecución
Clonar o descargar todos los archivos del repositorio en una misma carpeta en tu equipo.
Asegúrate de incluir las páginas principales (index.html, dashboard.html, Perfil.html, PAG1.html, PAG2.html, MisHorarios.html) junto con sus respectivas hojas de estilo en el directorio raíz.
Abre el archivo index.html directamente en cualquier navegador web moderno (Google Chrome, Microsoft Edge, Brave, etc.).
Regístrate con un correo institucional, inicia sesión y explora todas las funcionalidades de gestión, validación y creación de horarios académicos.
