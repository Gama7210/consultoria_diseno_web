// server/routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../database');
const nodemailer = require('nodemailer');

// Configurar transporter de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Middleware para verificar autenticación
const authenticate = (req, res, next) => {
    // En producción, usar JWT o sesiones
    const token = req.headers.authorization;
    if (!token || token !== `Bearer ${process.env.ADMIN_TOKEN}`) {
        // Para desarrollo, aceptamos cualquier token
        console.log('Auth attempt without token');
    }
    next();
};

// Obtener todos los mensajes
router.get('/mensajes', authenticate, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Obtener conteo total
    db.get("SELECT COUNT(*) as total FROM mensajes", (err, countResult) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // Obtener mensajes paginados
        db.all(
            `SELECT * FROM mensajes 
             ORDER BY fecha DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset],
            (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                res.json({
                    mensajes: rows,
                    pagination: {
                        page,
                        limit,
                        total: countResult.total,
                        totalPages: Math.ceil(countResult.total / limit)
                    }
                });
            }
        );
    });
});

// Enviar mensaje de contacto
router.post('/contacto', async (req, res) => {
    try {
        const { nombre, email, telefono, asunto, mensaje } = req.body;
        
        // Validar datos
        if (!nombre || !email || !asunto || !mensaje) {
            return res.status(400).json({ 
                success: false, 
                message: 'Todos los campos requeridos deben ser completados' 
            });
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Por favor ingresa un email válido' 
            });
        }
        
        // Insertar en la base de datos
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
                
                // Enviar correo automático de confirmación
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
                                    <p>Este es un correo automático, por favor no responder directamente a este mensaje.</p>
                                    <p>© 2026 RivGam Digital Studio. Todos los derechos reservados.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `,
                    text: `Hola ${nombre},\n\nHemos recibido tu mensaje con el asunto: ${asunto}\n\nNuestro equipo te responderá en un plazo máximo de 24 horas hábiles.\n\nAtentamente,\nEquipo RivGam Digital Studio`
                };
                
                // Enviar también una copia al administrador
                const adminMailOptions = {
                    from: `"Sistema RivGam" <${process.env.EMAIL_USER}>`,
                    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
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
                
                // Enviar correos
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error al enviar correo automático:', error);
                    } else {
                        console.log('Correo automático enviado:', info.response);
                        // Actualizar estado en base de datos
                        db.run(
                            "UPDATE mensajes SET respondido = 1, respuesta = ? WHERE id = ?",
                            ['Correo automático enviado', mensajeId]
                        );
                    }
                });
                
                transporter.sendMail(adminMailOptions, (error, info) => {
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
    } catch (error) {
        console.error('Error en /contacto:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// Login de administrador
router.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    
    if (!usuario || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Usuario y contraseña requeridos' 
        });
    }
    
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
                // En producción, generar un token JWT aquí
                const token = Buffer.from(`${usuario}:${Date.now()}`).toString('base64');
                
                res.json({ 
                    success: true, 
                    user: {
                        id: row.id,
                        usuario: row.usuario,
                        email: row.email,
                        token: token
                    },
                    message: 'Login exitoso'
                });
            } else {
                res.status(401).json({ 
                    success: false, 
                    message: 'Credenciales incorrectas' 
                });
            }
        }
    );
});

// Obtener estadísticas
router.get('/estadisticas', authenticate, (req, res) => {
    const queries = {
        total: "SELECT COUNT(*) as total FROM mensajes",
        hoy: "SELECT COUNT(*) as hoy FROM mensajes WHERE DATE(fecha) = DATE('now')",
        respondidos: "SELECT COUNT(*) as respondidos FROM mensajes WHERE respondido = 1",
        ultimos7dias: `
            SELECT DATE(fecha) as fecha, COUNT(*) as cantidad 
            FROM mensajes 
            WHERE fecha >= DATE('now', '-7 days') 
            GROUP BY DATE(fecha) 
            ORDER BY fecha DESC`
    };
    
    const resultados = {};
    let completadas = 0;
    const totalQueries = Object.keys(queries).length;
    
    Object.entries(queries).forEach(([key, query]) => {
        db.all(query, (err, rows) => {
            if (err) {
                console.error(`Error en query ${key}:`, err);
                return;
            }
            
            if (key === 'ultimos7dias') {
                resultados[key] = rows;
            } else {
                resultados[key] = rows[0][key];
            }
            
            completadas++;
            
            if (completadas === totalQueries) {
                res.json(resultados);
            }
        });
    });
});

// Actualizar estado de mensaje
router.put('/mensajes/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const { respondido, respuesta } = req.body;
    
    db.run(
        "UPDATE mensajes SET respondido = ?, respuesta = ? WHERE id = ?",
        [respondido ? 1 : 0, respuesta || '', id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.json({ 
                success: true, 
                message: 'Mensaje actualizado',
                changes: this.changes 
            });
        }
    );
});

// Eliminar mensaje
router.delete('/mensajes/:id', authenticate, (req, res) => {
    const { id } = req.params;
    
    db.run("DELETE FROM mensajes WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json({ 
            success: true, 
            message: 'Mensaje eliminado',
            changes: this.changes 
        });
    });
});

module.exports = router;