// server/server.js (versión corregida y simplificada)
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar transporter de nodemailer para enviar correos
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificar conexión de email al iniciar
transporter.verify((error, success) => {
    if (error) {
        console.log('⚠️  Correo no configurado:', error.message);
    } else {
        console.log('✅ Servidor de correo listo para enviar');
    }
});

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
            
            const mensajeId = this.lastID;
            console.log('Mensaje guardado con ID:', mensajeId);
            
            // Enviar correo de confirmación al usuario
            const mailOptions = {
                from: `"RivGam Digital Studio" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Confirmación de Recepción - RivGam Digital Studio',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>¡Gracias por contactarnos!</h1>
                                <p>RivGam Digital Studio</p>
                            </div>
                            <div class="content">
                                <h2>Hola ${nombre},</h2>
                                <p>Hemos recibido tu mensaje con el asunto: <strong>${asunto}</strong></p>
                                <p>Nuestro equipo de expertos revisará tu consulta y te responderá en un plazo máximo de 24 horas hábiles.</p>
                                <p><strong>Detalles de tu mensaje:</strong></p>
                                <blockquote style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0;">
                                    ${mensaje}
                                </blockquote>
                                <p><strong>Información de contacto registrada:</strong></p>
                                <ul>
                                    <li>Email: ${email}</li>
                                    ${telefono ? `<li>Teléfono: ${telefono}</li>` : ''}
                                </ul>
                                <p>Si necesitas hacer alguna modificación o tienes preguntas adicionales, no dudes en responder a este correo.</p>
                                <p>Atentamente,<br><strong>Equipo RivGam Digital Studio</strong></p>
                            </div>
                            <div class="footer">
                                <p>© 2026 RivGam Digital Studio. Todos los derechos reservados.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                text: `Hola ${nombre},\n\nHemos recibido tu mensaje con el asunto: ${asunto}\n\nNuestro equipo te responderá en un plazo máximo de 24 horas hábiles.\n\nAtentamente,\nEquipo RivGam Digital Studio`
            };
            
            // Enviar correo
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error al enviar correo:', error);
                } else {
                    console.log('Correo enviado exitosamente:', info.response);
                }
            });
            
            // Enviar notificación al administrador
            const adminMail = {
                from: `"Sistema RivGam" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `Nuevo mensaje de contacto: ${asunto}`,
                html: `
                    <h2>Nuevo mensaje de contacto recibido</h2>
                    <p><strong>ID:</strong> ${mensajeId}</p>
                    <p><strong>Nombre:</strong> ${nombre}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
                    <p><strong>Asunto:</strong> ${asunto}</p>
                    <p><strong>Mensaje:</strong></p>
                    <p>${mensaje}</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
                `
            };
            
            transporter.sendMail(adminMail, (error, info) => {
                if (error) {
                    console.error('Error al enviar correo al admin:', error);
                } else {
                    console.log('Correo al admin enviado:', info.response);
                }
            });
            
            res.json({ 
                success: true, 
                message: 'Mensaje enviado con éxito. Te hemos enviado un correo de confirmación.',
                id: mensajeId 
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
