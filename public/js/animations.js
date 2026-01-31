// animations.js - Animaciones y efectos del sitio web

document.addEventListener('DOMContentLoaded', function() {
    // ===== ANIMACIÓN DE SCROLL REVEAL =====
    const revealElements = document.querySelectorAll('.service-card, .portfolio-card, .about-content, .contact-wrapper');
    
    const revealOnScroll = function() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        revealElements.forEach(element => {
            const revealTop = element.getBoundingClientRect().top;
            
            if (revealTop < windowHeight - revealPoint) {
                element.classList.add('fade-in');
            }
        });
    };
    
    // Ejecutar al cargar y al hacer scroll
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();
    
    // ===== CONTADORES ANIMADOS =====
    const statNumbers = document.querySelectorAll('.stat-number');
    let counted = false;
    
    const animateCounters = function() {
        const statsSection = document.querySelector('.about-stats');
        if (!statsSection) return;
        
        const statsTop = statsSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (statsTop < windowHeight - 100 && !counted) {
            counted = true;
            
            statNumbers.forEach(stat => {
                const target = parseInt(stat.textContent);
                const increment = target / 100;
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        stat.textContent = target + '+';
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(current) + '+';
                    }
                }, 20);
            });
        }
    };
    
    window.addEventListener('scroll', animateCounters);
    
    // ===== EFECTO PARALLAX EN HERO =====
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroImage.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // ===== ANIMACIÓN DE TARJETAS AL HOVER =====
    const cards = document.querySelectorAll('.service-card, .portfolio-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function(e) {
            const cardRect = this.getBoundingClientRect();
            const x = e.clientX - cardRect.left;
            const y = e.clientY - cardRect.top;
            
            this.style.setProperty('--mouse-x', `${x}px`);
            this.style.setProperty('--mouse-y', `${y}px`);
        });
    });
    
    // ===== ANIMACIÓN DE MENÚ HAMBURGUESA =====
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Cerrar menú al hacer clic en un enlace
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
    
    // ===== EFECTO DE NAVEGACIÓN AL SCROLL =====
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', function() {
        // Efecto de navbar al scrollear
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
            navbar.querySelector('.container').style.padding = '1rem 24px';
        } else {
            navbar.classList.remove('scrolled');
            navbar.querySelector('.container').style.padding = '1.5rem 24px';
        }
        
        // Resaltar enlace activo en menú
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // ===== ANIMACIÓN DE FORMULARIOS =====
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Verificar si hay valor al cargar
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
    
    // ===== ANIMACIÓN DE BOTONES =====
    const buttons = document.querySelectorAll('.btn-primary, .btn-admin');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function(e) {
            const x = e.pageX - this.offsetLeft;
            const y = e.pageY - this.offsetTop;
            
            this.style.setProperty('--x', `${x}px`);
            this.style.setProperty('--y', `${y}px`);
        });
    });
    
    // ===== PRELOADER (opcional) =====
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
            }, 500);
        });
    }
    
    // ===== ANIMACIÓN DE TEXTO TIPOWRITER =====
    const typewriterElement = document.querySelector('.typewriter');
    if (typewriterElement) {
        const text = typewriterElement.textContent;
        typewriterElement.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                typewriterElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };
        
        setTimeout(typeWriter, 1000);
    }
    
    // ===== TOOLTIPS PARA ICONOS =====
    const icons = document.querySelectorAll('.service-card i, .contact-detail i');
    icons.forEach(icon => {
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.textContent = icon.getAttribute('title') || icon.parentElement.querySelector('h3')?.textContent || '';
        icon.parentElement.style.position = 'relative';
        icon.parentElement.appendChild(tooltip);
        
        icon.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(-10px)';
        });
        
        icon.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(0)';
        });
    });
});
