document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
       
        const formData = {
            nombre: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            asunto: document.getElementById('asunto').value.trim(),
            mensaje: document.getElementById('mensaje').value.trim()
        };
        
       
        const errors = validateForm(formData);
        
        if (errors.length > 0) {
            showMessage(errors.join('<br>'), 'error');
            return;
        }
        
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
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
                showMessage('¡Mensaje enviado con éxito! Te contactaremos pronto.', 'success');
                contactForm.reset();
                
              
                contactForm.querySelectorAll('.form-group').forEach(group => {
                    group.classList.remove('focused');
                });
                
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'contact_form_submit', {
                        'event_category': 'Contacto',
                        'event_label': 'Formulario principal'
                    });
                }
            } else {
                showMessage(data.message || 'Error al enviar el mensaje. Intenta nuevamente.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión. Por favor, intenta nuevamente más tarde.', 'error');
        } finally {
          
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
   
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
    
   
    function validateForm(data) {
        const errors = [];
        
        if (!data.nombre || data.nombre.length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }
        
        if (!data.email || !isValidEmail(data.email)) {
            errors.push('Ingresa un correo electrónico válido');
        }
        
        if (data.telefono && !isValidPhone(data.telefono)) {
            errors.push('Ingresa un número de teléfono válido');
        }
        
        if (!data.asunto || data.asunto.length < 5) {
            errors.push('El asunto debe tener al menos 5 caracteres');
        }
        
        if (!data.mensaje || data.mensaje.length < 10) {
            errors.push('El mensaje debe tener al menos 10 caracteres');
        }
        
        return errors;
    }
    
 
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        switch (field.id) {
            case 'nombre':
                if (!value || value.length < 2) {
                    isValid = false;
                    errorMessage = 'Mínimo 2 caracteres';
                }
                break;
                
            case 'email':
                if (!value || !isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Email inválido';
                }
                break;
                
            case 'telefono':
                if (value && !isValidPhone(value)) {
                    isValid = false;
                    errorMessage = 'Teléfono inválido';
                }
                break;
                
            case 'asunto':
                if (!value || value.length < 5) {
                    isValid = false;
                    errorMessage = 'Mínimo 5 caracteres';
                }
                break;
                
            case 'mensaje':
                if (!value || value.length < 10) {
                    isValid = false;
                    errorMessage = 'Mínimo 10 caracteres';
                }
                break;
        }
        
        if (!isValid) {
            showFieldError(field, errorMessage);
        } else {
            clearFieldError(field);
        }
        
        return isValid;
    }
    

    function showFieldError(field, message) {
        clearFieldError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--danger);
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: slideIn 0.3s ease;
        `;
        
        field.parentElement.appendChild(errorElement);
        field.style.borderColor = 'var(--danger)';
    }
    
 
    function clearFieldError(field) {
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        field.style.borderColor = '';
    }
    
  
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }
    
   
    function showMessage(message, type) {
        formMessage.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        formMessage.className = type === 'success' ? 'message-success' : 'message-error';
        formMessage.style.display = 'block';
        
  
        setTimeout(() => {
            formMessage.style.opacity = '0';
            setTimeout(() => {
                formMessage.style.display = 'none';
                formMessage.style.opacity = '1';
            }, 300);
        }, 5000);
    }
    
   
    contactForm.addEventListener('submit', function(e) {
        const button = this.querySelector('button[type="submit"]');
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 200);
    });
});
