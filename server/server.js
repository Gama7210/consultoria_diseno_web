// server/server.js (versión actualizada)
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
require('dotenv').config();

// Importar rutas
const apiRoutes = require('./routes/api');
const { router: authRoutes, requireAuth } = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://tudominio.com', 'https://www.tudominio.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin-panel')));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rutas de la API
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'RivGam Consultoría API'
    });
});

// Ruta para verificar base de datos
app.get('/api/db-status', requireAuth, (req, res) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            const tableInfo = [];
            let completed = 0;
            
            tables.forEach(table => {
                db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, result) => {
                    tableInfo.push({
                        table: table.name,
                        records: result.count
                    });
                    
                    completed++;
                    
                    if (completed === tables.length) {
                        res.json({
                            status: 'connected',
                            tables: tableInfo,
                            totalTables: tables.length
                        });
                    }
                });
            });
        });
    });
});

// Ruta para backup de la base de datos (protegida)
app.get('/api/backup', requireAuth, (req, res) => {
    const backupPath = path.join(__dirname, 'backups', `backup-${Date.now()}.db`);
    
    db.backup(backupPath)
        .then(() => {
            res.json({
                success: true,
                message: 'Backup creado exitosamente',
                path: backupPath
            });
        })
        .catch(err => {
            console.error('Error en backup:', err);
            res.status(500).json({ error: err.message });
        });
});

// Manejo de errores 404 para API
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Ruta de API no encontrada' 
    });
});

// Para todas las demás rutas, servir el index.html (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Error interno del servidor' 
        : err.message;
    
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// Inicializar servidor
const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📧 Email configurado: ${process.env.EMAIL_USER ? '✅' : '❌'}`);
    console.log(`📁 Panel admin: http://localhost:${PORT}/admin/login.html`);
});

// Manejo de cierre elegante
process.on('SIGTERM', () => {
    console.log('Recibido SIGTERM, cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado.');
        db.close();
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Recibido SIGINT, cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado.');
        db.close();
        process.exit(0);
    });
});

module.exports = app;