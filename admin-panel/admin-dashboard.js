// admin-panel/admin-dashboard.js
class AdminDashboard {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
        this.mensajes = [];
        this.user = null;
        
        this.init();
    }
    
    async init() {
        await this.checkAuth();
        await this.loadData();
        this.setupEventListeners();
        this.updateStats();
        setInterval(() => this.updateStats(), 30000); // Actualizar cada 30 segundos
    }
    
    async checkAuth() {
        const userData = localStorage.getItem('adminUser');
        const token = localStorage.getItem('adminToken');
        
        if (!userData || !token) {
            window.location.href = 'login.html';
            return;
        }
        
        this.user = JSON.parse(userData);
        
        // Verificar token con el servidor
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Token inválido');
            }
            
            this.updateUserInfo();
        } catch (error) {
            console.error('Error de autenticación:', error);
            this.logout();
        }
    }
    
    updateUserInfo() {
        const userNameElement = document.getElementById('userName');
        const userAvatarElement = document.getElementById('userAvatar');
        
        if (userNameElement) {
            userNameElement.textContent = this.user.usuario;
        }
        
        if (userAvatarElement) {
            userAvatarElement.textContent = this.user.usuario.charAt(0).toUpperCase();
        }
    }
    
    async loadData(page = 1) {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/mensajes?page=${page}&limit=${this.itemsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al cargar mensajes');
            }
            
            const data = await response.json();
            this.mensajes = data.mensajes;
            this.totalPages = data.pagination.totalPages;
            this.currentPage = data.pagination.page;
            
            this.renderMensajes();
            this.renderPagination();
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Error al cargar los mensajes', 'error');
        }
    }
    
    async updateStats() {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/estadisticas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al cargar estadísticas');
            }
            
            const data = await response.json();
            
            document.getElementById('totalMensajes').textContent = data.total;
            document.getElementById('mensajesHoy').textContent = data.hoy;
            document.getElementById('mensajesRespondidos').textContent = data.respondidos;
            document.getElementById('mensajesPendientes').textContent = data.total - data.respondidos;
            
            this.updateChart(data.ultimos7dias);
        } catch (error) {
            console.error('Error actualizando estadísticas:', error);
        }
    }
    
    updateChart(data) {
        const ctx = document.getElementById('mensajesChart');
        if (!ctx) return;
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        const labels = data.map(item => 
            new Date(item.fecha).toLocaleDateString('es-ES', { weekday: 'short' })
        ).reverse();
        
        const valores = data.map(item => item.cantidad).reverse();
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mensajes por día',
                    data: valores,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    renderMensajes() {
        const tbody = document.getElementById('messagesBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.mensajes.forEach(mensaje => {
            const row = document.createElement('tr');
            const fecha = new Date(mensaje.fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            row.innerHTML = `
                <td>${mensaje.id}</td>
                <td>
                    <div class="font-semibold">${mensaje.nombre}</div>
                    <div class="text-sm text-gray-500">${mensaje.email}</div>
                    ${mensaje.telefono ? `<div class="text-sm text-gray-500">${mensaje.telefono}</div>` : ''}
                </td>
                <td>${mensaje.asunto}</td>
                <td>${fecha}</td>
                <td>
                    <span class="status-badge status-${mensaje.respondido ? 'respondido' : 'pendiente'}">
                        ${mensaje.respondido ? 'Respondido' : 'Pendiente'}
                    </span>
                </td>
                <td class="actions-cell">
                    <button onclick="dashboard.verDetalle(${mensaje.id})" class="btn btn-secondary btn-sm" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="dashboard.marcarComoRespondido(${mensaje.id})" class="btn btn-success btn-sm" title="Marcar como respondido">
                        <i class="fas fa-check"></i>
                    </button>
                    <button onclick="dashboard.eliminarMensaje(${mensaje.id})" class="btn btn-danger btn-sm" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    renderPagination() {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;
        
        paginationContainer.innerHTML = '';
        
        // Botón anterior
        const prevButton = document.createElement('button');
        prevButton.className = 'page-btn';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.disabled = this.currentPage === 1;
        prevButton.onclick = () => this.changePage(this.currentPage - 1);
        
        // Números de página
        const pageNumbers = document.createElement('div');
        pageNumbers.className = 'page-numbers';
        
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, startPage + 4);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.onclick = () => this.changePage(i);
            pageNumbers.appendChild(pageButton);
        }
        
        // Botón siguiente
        const nextButton = document.createElement('button');
        nextButton.className = 'page-btn';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.disabled = this.currentPage === this.totalPages;
        nextButton.onclick = () => this.changePage(this.currentPage + 1);
        
        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(pageNumbers);
        paginationContainer.appendChild(nextButton);
    }
    
    async verDetalle(id) {
        const mensaje = this.mensajes.find(m => m.id === id);
        if (!mensaje) return;
        
        const modal = document.getElementById('detailModal');
        const modalContent = modal.querySelector('.modal-body');
        
        const fecha = new Date(mensaje.fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        modalContent.innerHTML = `
            <div class="space-y-4">
                <div>
                    <h3 class="text-lg font-semibold mb-2">Información del contacto</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm text-gray-500">Nombre</label>
                            <p class="font-medium">${mensaje.nombre}</p>
                        </div>
                        <div>
                            <label class="text-sm text-gray-500">Email</label>
                            <p class="font-medium">${mensaje.email}</p>
                        </div>
                        ${mensaje.telefono ? `
                        <div>
                            <label class="text-sm text-gray-500">Teléfono</label>
                            <p class="font-medium">${mensaje.telefono}</p>
                        </div>
                        ` : ''}
                        <div>
                            <label class="text-sm text-gray-500">Fecha</label>
                            <p class="font-medium">${fecha}</p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold mb-2">Asunto</h3>
                    <p class="p-3 bg-gray-50 rounded-lg">${mensaje.asunto}</p>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold mb-2">Mensaje</h3>
                    <div class="p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">${mensaje.mensaje}</div>
                </div>
                
                ${mensaje.respondido ? `
                <div>
                    <h3 class="text-lg font-semibold mb-2">Respuesta enviada</h3>
                    <div class="p-3 bg-green-50 rounded-lg">${mensaje.respuesta || 'Correo automático enviado'}</div>
                </div>
                ` : ''}
            </div>
        `;
        
        modal.classList.add('active');
    }
    
    async marcarComoRespondido(id) {
        if (!confirm('¿Marcar este mensaje como respondido?')) return;
        
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/mensajes/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    respondido: true,
                    respuesta: 'Marcado como respondido manualmente'
                })
            });
            
            if (!response.ok) {
                throw new Error('Error al actualizar el mensaje');
            }
            
            this.showAlert('Mensaje marcado como respondido', 'success');
            this.loadData(this.currentPage);
            this.updateStats();
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Error al actualizar el mensaje', 'error');
        }
    }
    
    async eliminarMensaje(id) {
        if (!confirm('¿Estás seguro de eliminar este mensaje? Esta acción no se puede deshacer.')) return;
        
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/mensajes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al eliminar el mensaje');
            }
            
            this.showAlert('Mensaje eliminado correctamente', 'success');
            this.loadData(this.currentPage);
            this.updateStats();
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Error al eliminar el mensaje', 'error');
        }
    }
    
    changePage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.loadData(page);
    }
    
    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // Modal close
        const modal = document.getElementById('detailModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('modal-close')) {
                    modal.classList.remove('active');
                }
            });
        }
        
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.buscarMensajes(e.target.value);
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportarDatos());
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadData(this.currentPage);
                this.updateStats();
                this.showAlert('Datos actualizados', 'success');
            });
        }
    }
    
    buscarMensajes(termino) {
        if (!termino.trim()) {
            this.renderMensajes();
            return;
        }
        
        const terminoLower = termino.toLowerCase();
        const mensajesFiltrados = this.mensajes.filter(mensaje =>
            mensaje.nombre.toLowerCase().includes(terminoLower) ||
            mensaje.email.toLowerCase().includes(terminoLower) ||
            mensaje.asunto.toLowerCase().includes(terminoLower) ||
            mensaje.mensaje.toLowerCase().includes(terminoLower)
        );
        
        this.renderMensajesFiltrados(mensajesFiltrados);
    }
    
    renderMensajesFiltrados(mensajes) {
        const tbody = document.getElementById('messagesBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        mensajes.forEach(mensaje => {
            const row = document.createElement('tr');
            const fecha = new Date(mensaje.fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            row.innerHTML = `
                <td>${mensaje.id}</td>
                <td>
                    <div class="font-semibold">${mensaje.nombre}</div>
                    <div class="text-sm text-gray-500">${mensaje.email}</div>
                </td>
                <td>${mensaje.asunto}</td>
                <td>${fecha}</td>
                <td>
                    <span class="status-badge status-${mensaje.respondido ? 'respondido' : 'pendiente'}">
                        ${mensaje.respondido ? 'Respondido' : 'Pendiente'}
                    </span>
                </td>
                <td class="actions-cell">
                    <button onclick="dashboard.verDetalle(${mensaje.id})" class="btn btn-secondary btn-sm">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    exportarDatos() {
        const data = this.mensajes.map(m => ({
            ID: m.id,
            Nombre: m.nombre,
            Email: m.email,
            Teléfono: m.telefono || '',
            Asunto: m.asunto,
            Mensaje: m.mensaje,
            Fecha: new Date(m.fecha).toLocaleString('es-ES'),
            Estado: m.respondido ? 'Respondido' : 'Pendiente',
            Respuesta: m.respuesta || ''
        }));
        
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', `mensajes_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showAlert('Datos exportados correctamente', 'success');
    }
    
    convertToCSV(data) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => 
            Object.values(obj).map(value => 
                typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            ).join(',')
        );
        
        return [headers, ...rows].join('\n');
    }
    
    showAlert(message, type) {
        // Eliminar alerta existente
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="ml-auto bg-transparent border-none text-current cursor-pointer">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const header = document.querySelector('.dashboard-header');
        if (header) {
            header.parentNode.insertBefore(alert, header.nextSibling);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
    
    logout() {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    }
}

// Inicializar dashboard
const dashboard = new AdminDashboard();

// Exponer al global scope para los onclick
window.dashboard = dashboard;