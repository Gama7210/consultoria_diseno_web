import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { addMensaje, getMensajes } from '@/lib/store';

// Configurar transporter de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombre, email, telefono, asunto, mensaje } = body;

        // Validacion
        if (!nombre || !email || !asunto || !mensaje) {
            return NextResponse.json(
                { success: false, message: 'Todos los campos requeridos deben ser completados' },
                { status: 400 }
            );
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: 'El correo electronico no es valido' },
                { status: 400 }
            );
        }

        // Guardar mensaje usando el store global
        const nuevoMensaje = addMensaje({
            nombre,
            email,
            telefono: telefono || '',
            asunto,
            mensaje,
        });

        // Verificar si hay credenciales de email configuradas
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                // Enviar correo de confirmacion al usuario
                const mailOptions = {
                    from: `"RivGam Digital Studio" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Confirmacion de Recepcion - RivGam Digital Studio',
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
                                    <h1>Gracias por contactarnos!</h1>
                                    <p>RivGam Digital Studio</p>
                                </div>
                                <div class="content">
                                    <h2>Hola ${nombre},</h2>
                                    <p>Hemos recibido tu mensaje con el asunto: <strong>${asunto}</strong></p>
                                    <p>Nuestro equipo de expertos revisara tu consulta y te respondera en un plazo maximo de 24 horas habiles.</p>
                                    <p><strong>Detalles de tu mensaje:</strong></p>
                                    <blockquote style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0;">
                                        ${mensaje}
                                    </blockquote>
                                    <p><strong>Informacion de contacto registrada:</strong></p>
                                    <ul>
                                        <li>Email: ${email}</li>
                                        ${telefono ? `<li>Telefono: ${telefono}</li>` : ''}
                                    </ul>
                                    <p>Si necesitas hacer alguna modificacion o tienes preguntas adicionales, no dudes en responder a este correo.</p>
                                    <p>Atentamente,<br><strong>Equipo RivGam Digital Studio</strong></p>
                                </div>
                                <div class="footer">
                                    <p>2026 RivGam Digital Studio. Todos los derechos reservados.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `,
                    text: `Hola ${nombre},\n\nHemos recibido tu mensaje con el asunto: ${asunto}\n\nNuestro equipo te respondera en un plazo maximo de 24 horas habiles.\n\nAtentamente,\nEquipo RivGam Digital Studio`
                };

                await transporter.sendMail(mailOptions);
                console.log('[v0] Correo enviado exitosamente a:', email);

                // Enviar notificacion al administrador
                const adminMail = {
                    from: `"Sistema RivGam" <${process.env.EMAIL_USER}>`,
                    to: process.env.EMAIL_USER,
                    subject: `Nuevo mensaje de contacto: ${asunto}`,
                    html: `
                        <h2>Nuevo mensaje de contacto recibido</h2>
                        <p><strong>ID:</strong> ${nuevoMensaje.id}</p>
                        <p><strong>Nombre:</strong> ${nombre}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Telefono:</strong> ${telefono || 'No proporcionado'}</p>
                        <p><strong>Asunto:</strong> ${asunto}</p>
                        <p><strong>Mensaje:</strong></p>
                        <p>${mensaje}</p>
                        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
                    `
                };

                await transporter.sendMail(adminMail);
                console.log('[v0] Notificacion enviada al admin');

            } catch (emailError) {
                console.error('[v0] Error al enviar correo:', emailError);
                // No fallar si el email no se envia, el mensaje ya esta guardado
            }
        } else {
            console.log('[v0] Credenciales de email no configuradas - EMAIL_USER y EMAIL_PASS requeridos');
        }

        return NextResponse.json({
            success: true,
            message: 'Mensaje enviado con exito. Te hemos enviado un correo de confirmacion.',
            id: nuevoMensaje.id
        });

    } catch (error) {
        console.error('[v0] Error en API contacto:', error);
        return NextResponse.json(
            { success: false, message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function GET() {
    const mensajes = getMensajes(); // Declare the mensajes variable
    return NextResponse.json(mensajes);
}
