Instala dependencias:

npm install

▶️ Ejecutar en desarrollo

Inicia el proyecto con Webpack:

npm run dev -- --webpack


Por defecto normalmente se abre en:

http://localhost:3000

Si el puerto cambia, revisa la consola: ahí se muestra la URL exacta.

🔐 Acceso al panel de administrador

Credenciales (modo práctica):

## Usuario: admin

## Contraseña: admin123

Ruta típica (según tu implementación):

http://localhost:3000/login (inicio de sesión)

http://localhost:3000/admin (panel)

Si tu proyecto usa otra ruta, revisa las carpetas de pages/ o app/ para ver el path exacto.

🗄️ Base de datos (SQLite)

La base de datos del sistema está en:

## server/consultoria.db


Ahí se guardan los registros que se van generando conforme se usan los formularios o el panel.

🔎 Ver la BD con DB Browser for SQLite

Para ver los cambios en la base de datos:

Abre DB Browser for SQLite

Clic en Open Database

Navega a la carpeta del proyecto:

server/

Selecciona el archivo:

consultoria.db

Ve a la pestaña Browse Data para revisar tablas y registros

Cada vez que hagas nuevas solicitudes en la web, puedes refrescar (o reabrir la BD) para ver los cambios.

Consejo: si estás viendo datos antiguos, cierra y vuelve a abrir el archivo .db para asegurarte de ver lo último.
