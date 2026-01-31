document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Obtener datos del formulario
        const formData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            asunto: document.getElementById('asunto').value,
            mensaje: document.getElementById('mensaje').value
        };

        // Validación básica
        if (!formData.nombre || !formData.email || !formData.asunto || !formData.mensaje) {
            showMessage('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        // Enviar datos al servidor
        try {
            const response = await fetch('/api/contacto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                showMessage('¡Mensaje enviado con éxito! Te hemos enviado un correo de confirmación.', 'success');
                contactForm.reset();
            } else {
                showMessage('Error al enviar el mensaje. Intenta nuevamente.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión. Intenta nuevamente.', 'error');
        }
    });

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `message-${type}`;
        formMessage.style.display = 'block';

        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
});
