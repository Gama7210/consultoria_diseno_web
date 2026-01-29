const sqlite3 = require('sqlite3').verbose();
const path = require('path');


const dbPath = path.resolve(__dirname, 'consultoria.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conexión exitosa a SQLite');
        inicializarTablas();
    }
});

// Crear tablas
function inicializarTablas() {
    // Tabla de mensajes de contacto
    db.run(`CREATE TABLE IF NOT EXISTS mensajes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL,
        telefono TEXT,
        asunto TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        respondido BOOLEAN DEFAULT 0,
        respuesta TEXT
    )`);

    // Tabla de administradores
    db.run(`CREATE TABLE IF NOT EXISTS administradores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);


    db.get("SELECT * FROM administradores WHERE usuario = 'admin'", (err, row) => {
        if (!row) {
            db.run("INSERT INTO administradores (usuario, password, email) VALUES (?, ?, ?)",
                ['admin', 'rivergam7210$', 'rivergam@gmail.com']);
            console.log('Administrador por defecto creado');
        }
    });
}

module.exports = db;