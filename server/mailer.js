// server/mailer.js
const nodemailer = require('nodemailer');

class Mailer {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        // Verificar configuración del transporter
        this.verifyConnection();
    }
    
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Servidor de correo configurado correctamente');
        } catch (error) {
            console.error('❌ Error en la configuración del correo:', error);
            console.log('⚠️  Nota: Para usar Gmail, necesitas:');
            console.log('1. Activar "Acceso de aplicaciones menos seguras" o');
            console.log('2. Crear una contraseña de aplicación en tu cuenta de Google');
            console.log('3. Usar las credenciales en las variables de entorno EMAIL_USER y EMAIL_PASS');
        }
    }
    
    async sendWelcomeEmail(to, nombre) {
        const mailOptions = {
            from: `"RivGam Digital Studio" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Bienvenido a RivGam Digital Studio',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0;">¡Bienvenido ${nombre}!</h1>
                        <p style="opacity: 0.9;">Gracias por unirte a nuestra comunidad</p>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p>Hola ${nombre},</p>
                        <p>Te damos la más cordial bienvenida a <strong>RivGam Digital Studio</strong>.</p>
                        <p>Como suscriptor, ahora recibirás:</p>
                        <ul>
                            <li>Consejos de diseño web semanales</li>
                            <li>Ofertas exclusivas en nuestros servicios</li>
                            <li>Primer acceso a nuevos recursos y plantillas</li>
                            <li>Invitationes a webinars especializados</li>
                        </ul>
                        <p>Si tienes alguna pregunta o necesitas asesoría, no dudes en contactarnos.</p>
                        <p style="margin-top: 30px;">Atentamente,<br><strong>El equipo de RivGam Digital Studio</strong></p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                        <p>© 2026 RivGam Digital Studio. Todos los derechos reservados.</p>
                        <p>Si no solicitaste esta suscripción, por favor ignora este correo.</p>
                    </div>
                </div>
            `
        };
        
        return this.sendMail(mailOptions);
    }
    
    async sendNewsletter(to, subject, content) {
        const mailOptions = {
            from: `"RivGam News" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: content
        };
        
        return this.sendMail(mailOptions);
    }
    
    async sendCustomEmail(to, subject, html, text = '') {
        const mailOptions = {
            from: `"RivGam Digital Studio" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html,
            text: text
        };
        
        return this.sendMail(mailOptions);
    }
    
    async sendMail(mailOptions) {
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Correo enviado:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error enviando correo:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Plantilla para respuestas personalizadas
    getResponseTemplate(nombre, respuesta, adminNombre = 'Equipo RivGam') {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h2 style="margin: 0;">Respuesta a tu consulta</h2>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Gracias por contactar con <strong>RivGam Digital Studio</strong>.</p>
                    <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
                        ${respuesta}
                    </div>
                    <p>Si necesitas más información o aclaraciones, puedes responder directamente a este correo.</p>
                    <p style="margin-top: 30px;">Atentamente,<br><strong>${adminNombre}</strong><br>RivGam Digital Studio</p>
                </div>
                <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                    <p>© 2026 RivGam Digital Studio</p>
                </div>
            </div>
        `;
    }
}

module.exports = new Mailer();
