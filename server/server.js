const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


app.post('/api/contacto', (req, res) => {
    const { nombre, email, telefono, asunto, mensaje } = req.body;
    
    // Guardar en base de datos
    db.run(`INSERT INTO mensajes (nombre, email, telefono, asunto, mensaje) 
            VALUES (?, ?, ?, ?, ?)`, 
            [nombre, email, telefono, asunto, mensaje], 
            function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        const mensajeId = this.lastID;
        
        // Enviar correo automático
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Gracias por contactar a RivGam Digital Studio',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a6ee0;">¡Hola ${nombre}!</h2>
                    <p>Hemos recibido tu mensaje con el asunto: <strong>${asunto}</strong></p>
                    <p>Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas.</p>
                    <p><strong>Resumen de tu mensaje:</strong></p>
                    <p>${mensaje}</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        RivGam Digital Studio - Consultoría de Diseño Web<br>
                        Tel: +52 55 52524633<br>
                        Email: rivergam49@gmail.com
                    </p>
                </div>
            `
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error enviando correo:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Mensaje guardado pero error al enviar correo' 
                });
            }
            
            
            db.run("UPDATE mensajes SET respondido = 1, respuesta = ? WHERE id = ?", 
                ['Correo automático enviado', mensajeId]);
            
            res.json({ 
                success: true, 
                message: 'Mensaje enviado y correo automático enviado',
                id: mensajeId 
            });
        });
    });
});


app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;
    
    db.get("SELECT * FROM administradores WHERE usuario = ? AND password = ?", 
        [usuario, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (row) {
            res.json({ 
                success: true, 
                user: {
                    id: row.id,
                    usuario: row.usuario,
                    email: row.email
                }
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Credenciales incorrectas' 
            });
        }
    });
});


app.get('/api/mensajes', (req, res) => {
  
    db.all("SELECT * FROM mensajes ORDER BY fecha DESC", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});


app.use('/admin', express.static(path.join(__dirname, '../admin-panel')));

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});