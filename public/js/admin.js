// Funciones para login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const usuario = document.getElementById('usuario').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ usuario, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    localStorage.setItem('adminToken', JSON.stringify(data.user));
                    window.location.href = 'dashboard.html';
                } else {
                    showLoginMessage('Credenciales incorrectas', 'error');
                }
            } catch (error) {
                showLoginMessage('Error de conexión', 'error');
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminToken');
            window.location.href = 'login.html';
        });
        
        // Verificar autenticación
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = 'login.html';
        } else {
            cargarMensajes();
            setInterval(cargarMensajes, 30000); // Actualizar cada 30 segundos
        }
    }
});

function showLoginMessage(message, type) {
    const messageDiv = document.getElementById('loginMessage');
    messageDiv.textContent = message;
    messageDiv.style.color = type === 'error' ? 'red' : 'green';
}

// Funciones para el dashboard
async function cargarMensajes() {
    try {
        const response = await fetch('/api/mensajes');
        const mensajes = await response.json();
        
        actualizarEstadisticas(mensajes);
        mostrarMensajes(mensajes);
        actualizarUltimaCarga();
    } catch (error) {
        console.error('Error cargando mensajes:', error);
    }
}

function actualizarEstadisticas(mensajes) {
    const total = mensajes.length;
    const respondidos = mensajes.filter(m => m.respondido).length;
    const hoy = new Date().toISOString().split('T')[0];
    const mensajesHoy = mensajes.filter(m => m.fecha.startsWith(hoy)).length;
    
    document.getElementById('totalMensajes').textContent = total;
    document.getElementById('mensajesRespondidos').textContent = respondidos;
    document.getElementById('mensajesPendientes').textContent = total - respondidos;
    document.getElementById('mensajesHoy').textContent = mensajesHoy;
}

function mostrarMensajes(mensajes) {
    const tbody = document.getElementById('messagesBody');
    tbody.innerHTML = '';
    
    mensajes.forEach(mensaje => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mensaje.id}</td>
            <td>${mensaje.nombre}</td>
            <td>${mensaje.email}</td>
            <td>${mensaje.asunto}</td>
            <td>${new Date(mensaje.fecha).toLocaleDateString()}</td>
            <td class="${mensaje.respondido ? 'respondido' : 'no-respondido'}">
                ${mensaje.respondido ? 'Respondido' : 'Pendiente'}
            </td>
            <td>
                <button onclick="verDetalle(${mensaje.id})" class="btn-primary">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function verDetalle(id) {
    // Implementar vista detallada del mensaje
    alert(`Ver detalles del mensaje ${id}`);
}

function actualizarUltimaCarga() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = 
        `Última actualización: ${now.toLocaleTimeString()}`;
}