// admin-dashboard.js - Panel de Administración RivGam
class AdminDashboard {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
        this.mensajes = [];
        this.user = null;
        this.chart = null;
        this.filterType = 'all';
        this.currentMessageId = null;
        this.settings = {
            notifyNewMessages: true,
            notifyErrors: true,
            autoRefresh: true
        };
        
        this.init();
    }
    
    async init() {
        console.log('Inicializando dashboard...');
        
        // 1. Verificar autenticación
        if (!await this.checkAuth()) {
            return;
        }
        
        // 2. Cargar configuración guardada
        this.loadSettings();
        
        // 3. Configurar event listeners
        this.setupEventListeners();
        
        // 4. Cargar datos iniciales
        await this.loadData();
        
        // 5. Actualizar UI
        this.updateStats();
        this.updateUserInfo();
        
        // 6. Configurar actualizaciones automáticas
        if (this.settings.autoRefresh) {
            this.setupAutoRefresh();
        }
        
        console.log('Dashboard inicializado correctamente');
        
        // Mostrar notificación de bienvenida
        this.showNotification('Dashboard cargado correctamente', 'success');
    }
    
    async checkAuth() {
        try {
            const userData = localStorage.getItem('adminUser');
            const token = localStorage.getItem('adminToken');
            
            console.log('Verificando autenticación...', { userData, token });
            
            // Si no hay datos, redirigir al login
            if (!userData || !token) {
                console.log('No hay credenciales, redirigiendo al login...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 100);
                return false;
            }
            
            // Parsear datos del usuario
            this.user = JSON.parse(userData);
            
            // Verificar token con el servidor (simulado por ahora)
            // En producción, esto haría una petición al backend
            const isValidToken = await this.verifyToken(token);
            
            if (!isValidToken) {
                console.log('Token inválido, redirigiendo al login...');
                this.showNotification('Sesión expirada. Por favor, inicia sesión nuevamente.', 'error');
                setTimeout(() => {
                    this.logout();
                }, 2000);
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('Error en autenticación:', error);
            this.showNotification('Error de autenticación', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return false;
        }
    }
    
    async verifyToken(token) {
        try {
            // En producción, esto sería una petición real al backend
            // Por ahora, simular una verificación exitosa
            return true;
            
            // Código real para producción:
            /*
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
            */
        } catch (error) {
            console.error('Error verificando token:', error);
            return false;
        }
    }
    
    updateUserInfo() {
        const userNameElements = document.querySelectorAll('#userName, #welcomeName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (this.user) {
            userNameElements.forEach(el => {
                if (el) el.textContent = this.user.usuario || 'Administrador';
            });
            
            if (userAvatar) {
                userAvatar.textContent = (this.user.usuario || 'A').charAt(0).toUpperCase();
            }
        }
    }
    
    async loadData(page = 1) {
        try {
            console.log(`Cargando datos, página ${page}...`);
            
            // En producción, esto cargaría datos reales del servidor
            // Por ahora, usar datos de ejemplo
            
            // Simular carga con timeout
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Datos de ejemplo
            const exampleData = this.generateExampleData();
            this.mensajes = exampleData.mensajes;
            this.totalPages = Math.ceil(this.mensajes.length / this.itemsPerPage);
            this.currentPage = page;
            
            this.renderMensajes();
            this.renderPagination();
            
            return true;
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            this.showNotification('Error al cargar los datos', 'error');
            return false;
        }
    }
    
    generateExampleData() {
        const now = new Date();
        const mensajes = [];
        
        // Generar 45 mensajes de ejemplo
        for (let i = 1; i <= 45; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            date.setHours(Math.floor(Math.random() * 24));
            date.setMinutes(Math.floor(Math.random() * 60));
            
            const names = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Pedro Rodríguez'];
            const emails = ['juan@email.com', 'maria@email.com', 'carlos@email.com', 'ana@email.com', 'pedro@email.com'];
            const subjects = ['Consulta sobre servicios', 'Cotización de proyecto', 'Soporte técnico', 'Información general', 'Feedback'];
            const messages = [
                'Me interesa conocer más sobre sus servicios de diseño web.',
                'Necesito una cotización para un proyecto de e-commerce.',
                'Tengo problemas con mi sitio web actual, necesito ayuda.',
                'Quisiera agendar una consulta para discutir mi proyecto.',
                'Excelente trabajo en el último proyecto, gracias.'
            ];
            
            const nameIndex = Math.floor(Math.random() * names.length);
            
            mensajes.push({
                id: i,
                nombre: names[nameIndex],
                email: emails[nameIndex],
                telefono: Math.random() > 0.5 ? `+52 55 ${Math.floor(10000000 + Math.random() * 90000000)}` : null,
                asunto: subjects[Math.floor(Math.random() * subjects.length)],
                mensaje: messages[Math.floor(Math.random() * messages.length)],
                fecha: date.toISOString(),
                respondido: Math.random() > 0.5,
                respuesta: Math.random() > 0.7 ? 'Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos pronto.' : null
            });
        }
        
        return {
            mensajes: mensajes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
            pagination: {
                total: mensajes.length,
                pages: Math.ceil(mensajes.length / 10),
                page: 1
            }
        };
    }
    
    async updateStats() {
        try {
            // Calcular estadísticas
            const total = this.mensajes.length;
            const hoy = new Date().toISOString().split('T')[0];
            const mensajesHoy = this.mensajes.filter(m => m.fecha && m.fecha.startsWith(hoy)).length;
            const mensajesRespondidos = this.mensajes.filter(m => m.respondido).length;
            const mensajesPendientes = total - mensajesRespondidos;
            
            // Actualizar UI
            document.getElementById('totalMensajes').textContent = total;
            document.getElementById('mensajesHoy').textContent = mensajesHoy;
            document.getElementById('mensajesRespondidos').textContent = mensajesRespondidos;
            document.getElementById('mensajesPendientes').textContent = mensajesPendientes;
            
            // Actualizar badge en sidebar
            const pendingCount = document.getElementById('pendingCount');
            if (pendingCount) {
                pendingCount.textContent = mensajesPendientes;
            }
            
            // Actualizar gráfico
            this.updateChart();
            
            // Actualizar última actualización
            this.updateLastUpdate();
            
        } catch (error) {
            console.error('Error actualizando estadísticas:', error);
        }
    }
    
    updateChart() {
        const ctx = document.getElementById('messagesChart');
        if (!ctx) return;
        
        // Preparar datos para los últimos 7 días
        const last7Days = [];
        const counts = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push(dateStr);
            
            // Contar mensajes de este día
            const count = this.mensajes.filter(m => 
                m.fecha && m.fecha.startsWith(dateStr)
            ).length;
            counts.push(count);
        }
        
        // Formatear etiquetas
        const labels = last7Days.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('es-ES', { weekday: 'short' });
        });
        
        // Destruir gráfico anterior si existe
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Crear nuevo gráfico
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mensajes por día',
                    data: counts,
                    borderColor: '#6786ec',
                    backgroundColor: 'rgba(103, 134, 236, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6786ec',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#6786ec',
                        borderWidth: 1,
                        cornerRadius: 6,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    renderMensajes() {
        const tbody = document.getElementById('messagesBody');
        if (!tbody) return;
        
        // Aplicar filtros
        let mensajesFiltrados = this.mensajes;
        
        if (this.filterType === 'pending') {
            mensajesFiltrados = this.mensajes.filter(m => !m.respondido);
        }
        
        // Paginar
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const mensajesPagina = mensajesFiltrados.slice(startIndex, endIndex);
        
        if (mensajesPagina.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div style="text-align: center; padding: 3rem;">
                            <div style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;">
                                <i class="fas fa-inbox"></i>
                            </div>
                            <h3 style="color: #64748b; margin-bottom: 0.5rem;">No hay mensajes</h3>
                            <p style="color: #94a3b8;">${this.filterType === 'pending' ? 'No hay mensajes pendientes' : 'Todavía no has recibido mensajes de contacto.'}</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        
        mensajesPagina.forEach(mensaje => {
            const fecha = new Date(mensaje.fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                <tr>
                    <td>#${mensaje.id.toString().padStart(4, '0')}</td>
                    <td>
                        <div style="font-weight: 600;">${mensaje.nombre || 'Sin nombre'}</div>
                        <div style="font-size: 0.75rem; color: #64748b;">${mensaje.email || 'Sin email'}</div>
                        ${mensaje.telefono ? `<div style="font-size: 0.75rem; color: #64748b;">📞 ${mensaje.telefono}</div>` : ''}
                    </td>
                    <td>${mensaje.asunto || 'Sin asunto'}</td>
                    <td style="font-size: 0.875rem; color: #64748b;">${fecha}</td>
                    <td>
                        <span class="status-badge ${mensaje.respondido ? 'badge-respondido' : 'badge-pendiente'}">
                            <i class="fas ${mensaje.respondido ? 'fa-check' : 'fa-clock'} badge-icon"></i>
                            ${mensaje.respondido ? 'Respondido' : 'Pendiente'}
                        </span>
                    </td>
                    <td class="actions-cell">
                        <button class="btn-icon btn-view" onclick="dashboard.verDetalle(${mensaje.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="dashboard.replyMessage(${mensaje.id})" title="Responder">
                            <i class="fas fa-reply"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="dashboard.eliminarMensaje(${mensaje.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
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
        pageNumbers.style.display = 'flex';
        pageNumbers.style.gap = '0.25rem';
        
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
    
    changePage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.renderMensajes();
        this.renderPagination();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    async verDetalle(id) {
        const mensaje = this.mensajes.find(m => m.id === id);
        if (!mensaje) {
            this.showNotification('Mensaje no encontrado', 'error');
            return;
        }
        
        const modalBody = document.getElementById('modalBody');
        const modal = document.getElementById('detailModal');
        
        const fecha = new Date(mensaje.fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        modalBody.innerHTML = `
            <div style="display: grid; gap: 1.5rem;">
                <div>
                    <h4 style="color: #64748b; margin-bottom: 0.5rem;">Información del contacto</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="font-size: 0.75rem; color: #94a3b8;">Nombre</label>
                            <p style="font-weight: 600;">${mensaje.nombre}</p>
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: #94a3b8;">Email</label>
                            <p style="font-weight: 600;">${mensaje.email}</p>
                        </div>
                        ${mensaje.telefono ? `
                        <div>
                            <label style="font-size: 0.75rem; color: #94a3b8;">Teléfono</label>
                            <p style="font-weight: 600;">${mensaje.telefono}</p>
                        </div>
                        ` : ''}
                        <div>
                            <label style="font-size: 0.75rem; color: #94a3b8;">Fecha</label>
                            <p style="font-weight: 600;">${fecha}</p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 style="color: #64748b; margin-bottom: 0.5rem;">Asunto</h4>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px;">
                        ${mensaje.asunto}
                    </div>
                </div>
                
                <div>
                    <h4 style="color: #64748b; margin-bottom: 0.5rem;">Mensaje</h4>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; white-space: pre-wrap;">
                        ${mensaje.mensaje}
                    </div>
                </div>
                
                ${mensaje.respondido ? `
                <div>
                    <h4 style="color: #64748b; margin-bottom: 0.5rem;">Respuesta enviada</h4>
                    <div style="background: #d1fae5; padding: 1rem; border-radius: 8px; color: #065f46;">
                        ${mensaje.respuesta || 'Correo automático enviado'}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        // Configurar botón de respuesta
        const replyBtn = document.getElementById('replyBtn');
        replyBtn.onclick = () => this.replyMessage(id);
        
        // Mostrar modal
        modal.classList.add('active');
        this.currentMessageId = id;
    }
    
    replyMessage(id) {
        const mensaje = this.mensajes.find(m => m.id === id);
        if (!mensaje) {
            this.showNotification('Mensaje no encontrado', 'error');
            return;
        }
        
        // Cerrar modal de detalles si está abierto
        document.getElementById('detailModal').classList.remove('active');
        
        // Configurar modal de respuesta
        document.getElementById('replyTo').value = mensaje.email;
        document.getElementById('replySubject').value = `Re: ${mensaje.asunto}`;
        document.getElementById('replyMessage').value = `Hola ${mensaje.nombre},\n\nGracias por contactarnos. `;
        
        // Mostrar modal de respuesta
        document.getElementById('replyModal').classList.add('active');
        this.currentMessageId = id;
    }
    
    async sendReply() {
        const to = document.getElementById('replyTo').value;
        const subject = document.getElementById('replySubject').value;
        const message = document.getElementById('replyMessage').value;
        const markAsAnswered = document.getElementById('markAsAnswered').checked;
        
        if (!to || !subject || !message) {
            this.showNotification('Por favor, completa todos los campos', 'error');
            return;
        }
        
        try {
            // Simular envío de correo
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Marcar como respondido si se solicitó
            if (markAsAnswered && this.currentMessageId) {
                const mensaje = this.mensajes.find(m => m.id === this.currentMessageId);
                if (mensaje) {
                    mensaje.respondido = true;
                    mensaje.respuesta = message;
                }
            }
            
            // Cerrar modal
            this.closeReplyModal();
            
            // Actualizar UI
            this.renderMensajes();
            this.updateStats();
            
            // Mostrar notificación
            this.showNotification('Respuesta enviada correctamente', 'success');
            
        } catch (error) {
            console.error('Error enviando respuesta:', error);
            this.showNotification('Error al enviar la respuesta', 'error');
        }
    }
    
    closeReplyModal() {
        document.getElementById('replyModal').classList.remove('active');
    }
    
    async eliminarMensaje(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            // Simular eliminación
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Eliminar del array
            this.mensajes = this.mensajes.filter(m => m.id !== id);
            
            // Actualizar UI
            this.renderMensajes();
            this.updateStats();
            
            // Mostrar notificación
            this.showNotification('Mensaje eliminado correctamente', 'success');
            
        } catch (error) {
            console.error('Error eliminando mensaje:', error);
            this.showNotification('Error al eliminar el mensaje', 'error');
        }
    }
    
    buscarMensajes(termino) {
        if (!termino.trim()) {
            this.renderMensajes();
            return;
        }
        
        const terminoLower = termino.toLowerCase();
        const mensajesFiltrados = this.mensajes.filter(mensaje =>
            (mensaje.nombre && mensaje.nombre.toLowerCase().includes(terminoLower)) ||
            (mensaje.email && mensaje.email.toLowerCase().includes(terminoLower)) ||
            (mensaje.asunto && mensaje.asunto.toLowerCase().includes(terminoLower)) ||
            (mensaje.mensaje && mensaje.mensaje.toLowerCase().includes(terminoLower))
        );
        
        // Mostrar mensajes filtrados
        const tbody = document.getElementById('messagesBody');
        
        if (mensajesFiltrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div style="text-align: center; padding: 3rem;">
                            <i class="fas fa-search" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                            <h3 style="color: #64748b; margin-bottom: 0.5rem;">No se encontraron resultados</h3>
                            <p style="color: #94a3b8;">No hay mensajes que coincidan con "${termino}"</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Mostrar primeros 10 resultados
        let html = '';
        mensajesFiltrados.slice(0, 10).forEach(mensaje => {
            const fecha = new Date(mensaje.fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                <tr>
                    <td>#${mensaje.id.toString().padStart(4, '0')}</td>
                    <td>
                        <div style="font-weight: 600;">${mensaje.nombre || 'Sin nombre'}</div>
                        <div style="font-size: 0.75rem; color: #64748b;">${mensaje.email || 'Sin email'}</div>
                    </td>
                    <td>${mensaje.asunto || 'Sin asunto'}</td>
                    <td style="font-size: 0.875rem; color: #64748b;">${fecha}</td>
                    <td>
                        <span class="status-badge ${mensaje.respondido ? 'badge-respondido' : 'badge-pendiente'}">
                            <i class="fas ${mensaje.respondido ? 'fa-check' : 'fa-clock'} badge-icon"></i>
                            ${mensaje.respondido ? 'Respondido' : 'Pendiente'}
                        </span>
                    </td>
                    <td class="actions-cell">
                        <button class="btn-icon btn-view" onclick="dashboard.verDetalle(${mensaje.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    }
    
    exportData() {
        if (this.mensajes.length === 0) {
            this.showNotification('No hay datos para exportar', 'warning');
            return;
        }
        
        // Convertir a CSV
        const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Asunto', 'Mensaje', 'Fecha', 'Estado'];
        const csvData = this.mensajes.map(msg => [
            msg.id,
            `"${msg.nombre || ''}"`,
            `"${msg.email || ''}"`,
            `"${msg.telefono || ''}"`,
            `"${msg.asunto || ''}"`,
            `"${(msg.mensaje || '').replace(/"/g, '""')}"`,
            new Date(msg.fecha).toLocaleString('es-ES'),
            msg.respondido ? 'Respondido' : 'Pendiente'
        ]);
        
        const csv = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
        
        // Descargar
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mensajes_rivgam_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Datos exportados correctamente', 'success');
    }
    
    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                if (overlay) overlay.classList.toggle('active');
            });
        }
        
        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
        
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadData(this.currentPage);
                this.updateStats();
                this.showNotification('Datos actualizados', 'success');
            });
        }
        
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.buscarMensajes(e.target.value);
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        // Filter buttons
        const filterAll = document.getElementById('filterAll');
        if (filterAll) {
            filterAll.addEventListener('click', () => {
                this.filterType = 'all';
                this.currentPage = 1;
                this.renderMensajes();
                this.renderPagination();
                filterAll.classList.add('active');
                filterPending.classList.remove('active');
            });
        }
        
        const filterPending = document.getElementById('filterPending');
        if (filterPending) {
            filterPending.addEventListener('click', () => {
                this.filterType = 'pending';
                this.currentPage = 1;
                this.renderMensajes();
                this.renderPagination();
                filterPending.classList.add('active');
                filterAll.classList.remove('active');
            });
        }
        
        // Modal close buttons
        const modalClose = document.getElementById('modalClose');
        const closeModalBtn = document.getElementById('closeModal');
        const modalOverlay = document.getElementById('detailModal');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                modalOverlay.classList.remove('active');
            });
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                modalOverlay.classList.remove('active');
            });
        }
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.classList.remove('active');
                }
            });
        }
        
        // Window resize (para cerrar sidebar en móvil)
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1200) {
                sidebar.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            }
        });
    }
    
    setupAutoRefresh() {
        setInterval(() => {
            this.loadData(this.currentPage);
            this.updateStats();
            console.log('Actualización automática ejecutada');
        }, 30000); // 30 segundos
    }
    
    updateLastUpdate() {
        const now = new Date();
        const hora = now.getHours().toString().padStart(2, '0');
        const minuto = now.getMinutes().toString().padStart(2, '0');
        const segundo = now.getSeconds().toString().padStart(2, '0');
        
        const updateElement = document.getElementById('updateTime');
        if (updateElement) {
            updateElement.textContent = `${hora}:${minuto}:${segundo}`;
        }
    }
    
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                         type === 'error' ? 'fa-exclamation-circle' : 
                         type === 'warning' ? 'fa-exclamation-triangle' : 
                         'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('rivgamDashboardSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }
    }
    
    saveSettings() {
        localStorage.setItem('rivgamDashboardSettings', JSON.stringify(this.settings));
        this.showNotification('Configuración guardada correctamente', 'success');
        this.closeSettingsModal();
    }
    
    showSettings() {
        // Cargar valores actuales
        document.getElementById('notifyNewMessages').checked = this.settings.notifyNewMessages;
        document.getElementById('notifyErrors').checked = this.settings.notifyErrors;
        document.getElementById('autoRefresh').checked = this.settings.autoRefresh;
        
        // Mostrar modal
        document.getElementById('settingsModal').classList.add('active');
    }
    
    closeSettingsModal() {
        document.getElementById('settingsModal').classList.remove('active');
    }
    
    logout() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            // Limpiar localStorage
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('lastLogin');
            
            // Redirigir al login
            window.location.href = 'login.html';
        }
    }
}

// Funciones globales para onclick
function showHelp() {
    alert('Ayuda del Dashboard:\n\n' +
          '1. Dashboard: Resumen general de estadísticas\n' +
          '2. Mensajes: Gestiona todos los mensajes recibidos\n' +
          '3. Proyectos: Administra los proyectos del portafolio\n' +
          '4. Analíticas: Ver estadísticas detalladas\n' +
          '5. Usuarios: Gestiona usuarios del sistema\n' +
          '6. Configuración: Ajustes del panel de control\n\n' +
          'Para más ayuda, contacta al desarrollador.');
}

function composeEmail() {
    alert('Funcionalidad de email masivo - Próximamente\n\n' +
          'En próximas actualizaciones podrás:\n' +
          '- Enviar correos masivos a todos tus contactos\n' +
          '- Crear plantillas de correo personalizadas\n' +
          '- Programar envíos de correos\n' +
          '- Ver historial de envíos');
}

function exportData() {
    if (window.dashboard) {
        window.dashboard.exportData();
    }
}

function showSettings() {
    if (window.dashboard) {
        window.dashboard.showSettings();
    }
}

// Inicializar dashboard globalmente
let dashboard = new AdminDashboard();
window.dashboard = dashboard;