// server/server.js (versión corregida y simplificada)
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin-panel')));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
    next();
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'API funcionando',
        timestamp: new Date().toISOString()
    });
});

// Ruta para login de administrador
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;
    
    console.log('Intento de login:', { usuario, password });
    
    if (!usuario || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Usuario y contraseña requeridos' 
        });
    }
    
    // Credenciales fijas (por ahora)
    if (usuario === 'admin' && password === 'admin123') {
        console.log('Login exitoso para:', usuario);
        res.json({ 
            success: true, 
            user: {
                id: 1,
                usuario: 'admin',
                email: 'admin@rivgam.com'
            },
            message: 'Login exitoso'
        });
    } else {
        // Buscar en la base de datos
        db.get(
            "SELECT id, usuario, email FROM administradores WHERE usuario = ? AND password = ?",
            [usuario, password],
            (err, row) => {
                if (err) {
                    console.error('Error en login:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error interno del servidor' 
                    });
                }
                
                if (row) {
                    res.json({ 
                        success: true, 
                        user: {
                            id: row.id,
                            usuario: row.usuario,
                            email: row.email
                        },
                        message: 'Login exitoso'
                    });
                } else {
                    console.log('Credenciales incorrectas para:', usuario);
                    res.status(401).json({ 
                        success: false, 
                        message: 'Credenciales incorrectas' 
                    });
                }
            }
        );
    }
});

// Ruta para obtener mensajes
app.get('/api/mensajes', (req, res) => {
    console.log('Obteniendo mensajes...');
    db.all("SELECT * FROM mensajes ORDER BY fecha DESC", (err, rows) => {
        if (err) {
            console.error('Error al obtener mensajes:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`Enviando ${rows.length} mensajes`);
        res.json(rows);
    });
});

// Ruta para enviar mensaje de contacto
app.post('/api/contacto', (req, res) => {
    const { nombre, email, telefono, asunto, mensaje } = req.body;
    
    console.log('Nuevo mensaje de contacto:', { nombre, email, asunto });
    
    // Validación simple
    if (!nombre || !email || !asunto || !mensaje) {
        return res.status(400).json({ 
            success: false, 
            message: 'Todos los campos requeridos deben ser completados' 
        });
    }
    
    // Guardar en la base de datos
    db.run(
        `INSERT INTO mensajes (nombre, email, telefono, asunto, mensaje) 
         VALUES (?, ?, ?, ?, ?)`,
        [nombre, email, telefono, asunto, mensaje],
        function(err) {
            if (err) {
                console.error('Error al guardar mensaje:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al guardar el mensaje' 
                });
            }
            
            console.log('Mensaje guardado con ID:', this.lastID);
            
            res.json({ 
                success: true, 
                message: 'Mensaje enviado con éxito',
                id: this.lastID 
            });
        }
    );
});

// Ruta para verificar si el servidor está funcionando
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'RivGam Consultoría API',
        time: new Date().toLocaleTimeString()
    });
});

// Para todas las demás rutas, servir el index.html (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Manejo de errores 404 para API
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Ruta de API no encontrada' 
    });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: err.message
    });
});

// Inicializar servidor
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Servidor RivGam Digital Studio');
    console.log('='.repeat(50));
    console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`✅ API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`✅ API Test: http://localhost:${PORT}/api/test`);
    console.log(`✅ Panel Admin: http://localhost:${PORT}/admin/login.html`);
    console.log(`👤 Credenciales: admin / admin123`);
    console.log('='.repeat(50));
});