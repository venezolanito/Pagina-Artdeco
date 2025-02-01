    // <!-- Scripts -->
            // Inicialización de AOS
        AOS.init({
            duration: 800,
            easing: 'ease',
            once: true
        });

        // Control del menú hamburguesa
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Control de la barra de navegación al hacer scroll
        let lastScrollTop = 0;
        const nav = document.querySelector('.main-nav');
        const scrollThreshold = 100;

        window.addEventListener('scroll', () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
                // Scrolling hacia abajo - ocultar nav
                nav.classList.add('nav-hidden');
            } else {
                // Scrolling hacia arriba - mostrar nav
                nav.classList.remove('nav-hidden');
            }
            
            lastScrollTop = scrollTop;
        }, { passive: true });

        // Array de URLs de videos
        const videoUrls = [
            'https://videos.pexels.com/video-files/8293503/8293503-hd_1920_1080_30fps.mp4',
            'https://videos.pexels.com/video-files/6474367/6474367-uhd_2560_1440_25fps.mp4',
            'https://videos.pexels.com/video-files/6474177/6474177-uhd_2560_1440_25fps.mp4',
            'https://videos.pexels.com/video-files/6474174/6474174-uhd_2560_1440_25fps.mp4',
            'https://videos.pexels.com/video-files/6561655/6561655-uhd_2560_1440_30fps.mp4'
        ];

        let currentVideoIndex = 0;
        const heroVideo = document.getElementById('heroVideo');

        // Función para cambiar la fuente del video
        function changeVideoSource() {
            currentVideoIndex = (currentVideoIndex + 1) % videoUrls.length;
            heroVideo.src = videoUrls[currentVideoIndex];
            heroVideo.play().catch(function(error) {
                console.log("Error reproduciendo el video:", error);
            });
        }

        // Evento cuando termina el video
        heroVideo.addEventListener('ended', changeVideoSource);

        // Manejo de errores
        heroVideo.addEventListener('error', function(e) {
            console.log("Error en el video:", e);
            // Intentar con el siguiente video si hay un error
            changeVideoSource();
        });

    // <!-- Script para el botón de volver arriba -->
            function handleBackToTop() {
            const backToTop = document.querySelector('.back-to-top');
            const scrollTrigger = 300;

            window.addEventListener('scroll', () => {
                if (window.scrollY > scrollTrigger) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            });

            backToTop.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            handleBackToTop();
        });
    
        // Mejorar la interacción táctil de los botones
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('touchstart', function() {
                this.classList.add('active');
            }, {passive: true});
            
            button.addEventListener('touchend', function() {
                this.classList.remove('active');
            }, {passive: true});
        });
    
    //<!-- Script para la animación del logo -->
    
        document.addEventListener('DOMContentLoaded', function() {
            // Obtener todos los elementos necesarios
            const logoContainer = document.querySelector('.logo-container');
            const logo = document.getElementById('mainLogo');
            const videoContainer = document.getElementById('logoVideoContainer');
            const video = document.getElementById('logoVideo');
            
            // Verificar que todos los elementos existan
            if (!logoContainer || !logo || !videoContainer || !video) {
                console.error('No se encontraron todos los elementos necesarios');
                return;
            }

            console.log('Elementos inicializados correctamente');
            
            let isVideoPlaying = false;
            let mouseStillOverLogo = false;

            // Función para mostrar el video
            function showVideo() {
                console.log('Mouse enter - Intentando mostrar video');
                if (!isVideoPlaying) {
                    isVideoPlaying = true;
                    mouseStillOverLogo = true;
                    logo.classList.add('hidden');
                    videoContainer.classList.add('active');
                    
                    video.currentTime = 0;
                    
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => console.log('Video comenzó a reproducirse'))
                            .catch(error => {
                                console.error('Error reproduciendo el video:', error);
                                resetToLogo();
                            });
                    }
                }
            }

            // Función para ocultar el video
            function hideVideo() {
                console.log('Mouse leave - Preparando para ocultar video');
                mouseStillOverLogo = false;
                
                if (isVideoPlaying) {
                    setTimeout(() => {
                        if (!mouseStillOverLogo) {
                            resetToLogo();
                        }
                    }, 300);
                }
            }

            // Función para volver al logo original
            function resetToLogo() {
                console.log('Reseteando a logo original');
                logo.classList.remove('hidden');
                videoContainer.classList.remove('active');
                isVideoPlaying = false;
                video.pause();
            }

            // Evento cuando termina el video
            video.addEventListener('ended', () => {
                console.log('Video terminado');
                if (!mouseStillOverLogo) {
                    resetToLogo();
                } else {
                    video.currentTime = 0;
                    video.play().catch(err => console.log('Error reproduciendo video:', err));
                }
            });

            // Eventos del mouse
            logoContainer.addEventListener('mouseenter', showVideo);
            logoContainer.addEventListener('mouseleave', hideVideo);

            // Verificación de carga del video
            video.addEventListener('loadeddata', () => {
                console.log('Video cargado correctamente');
            });

            video.addEventListener('error', (e) => {
                console.error('Error cargando el video:', e);
            });
        });
    
    document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Cierra el menú al hacer clic fuera
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = navMenu.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnHamburger && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});