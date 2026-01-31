// server/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware de autenticación
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: 'Acceso no autorizado. Token requerido.' 
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificación simple del token
    // En producción, usar JWT con verificación criptográfica
    if (!token || token.length < 10) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token inválido' 
        });
    }
    
    // Decodificar el token (base64 simple)
    try {
        const decoded = Buffer.from(token, 'base64').toString();
        const [usuario, timestamp] = decoded.split(':');
        
        // Verificar que el token no sea muy viejo (24 horas)
        const tokenAge = Date.now() - parseInt(timestamp);
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas
        
        if (tokenAge > maxAge) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expirado' 
            });
        }
        
        req.user = { usuario };
        next();
    } catch (error) {
        console.error('Error decoding token:', error);
        return res.status(401).json({ 
            success: false, 
            message: 'Token inválido' 
        });
    }
};

// Verificar token
router.post('/verify', requireAuth, (req, res) => {
    res.json({ 
        success: true, 
        user: req.user,
        message: 'Token válido' 
    });
});

// Cambiar contraseña
router.post('/change-password', requireAuth, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { usuario } = req.user;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'Ambas contraseñas son requeridas' 
        });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'La nueva contraseña debe tener al menos 6 caracteres' 
        });
    }
    
    // Verificar contraseña actual
    db.get(
        "SELECT id FROM administradores WHERE usuario = ? AND password = ?",
        [usuario, currentPassword],
        (err, row) => {
            if (err) {
                console.error('Error verifying password:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error interno del servidor' 
                });
            }
            
            if (!row) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Contraseña actual incorrecta' 
                });
            }
            
            // Actualizar contraseña
            db.run(
                "UPDATE administradores SET password = ? WHERE usuario = ?",
                [newPassword, usuario],
                function(err) {
                    if (err) {
                        console.error('Error updating password:', err);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Error al actualizar contraseña' 
                        });
                    }
                    
                    res.json({ 
                        success: true, 
                        message: 'Contraseña actualizada exitosamente' 
                    });
                }
            );
        }
    );
});

// Crear nuevo administrador (solo para administradores)
router.post('/new-admin', requireAuth, (req, res) => {
    const { newUsuario, newPassword, email } = req.body;
    
    if (!newUsuario || !newPassword || !email) {
        return res.status(400).json({ 
            success: false, 
            message: 'Todos los campos son requeridos' 
        });
    }
    
    // Insertar nuevo administrador
    db.run(
        `INSERT INTO administradores (usuario, password, email) 
         VALUES (?, ?, ?)`,
        [newUsuario, newPassword, email],
        function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'El usuario ya existe' 
                    });
                }
                console.error('Error creating admin:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al crear administrador' 
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Administrador creado exitosamente',
                id: this.lastID 
            });
        }
    );
});

module.exports = { router, requireAuth };
