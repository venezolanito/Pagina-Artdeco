document.addEventListener('DOMContentLoaded', function() {
    // Configuración de lightbox
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
            'resizeDuration': 200,
            'wrapAround': true,
            'albumLabel': 'Imagen %1 de %2',
            'fadeDuration': 300,
            'imageFadeDuration': 300
        });
    }

    // Sistema de filtrado
    const filtros = document.querySelectorAll('.filtro-btn');
    const galeriaItems = document.querySelectorAll('.galeria-item');
    let categoriaActual = 'todos';

    // Event listeners para filtros
    filtros.forEach(filtro => {
        filtro.addEventListener('click', function() {
            const categoria = this.dataset.filter;
            
            // Actualizar botones activos
            filtros.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrar elementos
            filtrarGaleria(categoria);
        });
    });

    function filtrarGaleria(categoria) {
        categoriaActual = categoria;

        galeriaItems.forEach(item => {
            const itemCategoria = item.dataset.category;
            
            if (categoria === 'todos' || itemCategoria === categoria) {
                mostrarItem(item);
            } else {
                ocultarItem(item);
            }
        });

        // Reorganizar la cuadrícula después de filtrar
        reorganizarCuadricula();
    }

    function mostrarItem(item) {
        item.style.display = 'block';
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
        }, 50);
    }

    function ocultarItem(item) {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.8)';
        setTimeout(() => {
            item.style.display = 'none';
        }, 300);
    }

    function reorganizarCuadricula() {
        const galeria = document.querySelector('.galeria-grid');
        if (!galeria) return;

        // Aplicar Masonry si está disponible
        if (typeof Masonry !== 'undefined') {
            new Masonry(galeria, {
                itemSelector: '.galeria-item',
                columnWidth: '.galeria-item',
                percentPosition: true,
                transitionDuration: '0.3s'
            });
        }
    }

    // Lazy loading de imágenes
    const imgObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                cargarImagen(img);
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });

    document.querySelectorAll('.galeria-item img.lazy').forEach(img => {
        imgObserver.observe(img);
    });

    function cargarImagen(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Precargar imagen
        const tmpImg = new Image();
        tmpImg.onload = () => {
            img.src = src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
        };
        tmpImg.src = src;
    }

    // Búsqueda y filtrado
    const searchInput = document.getElementById('galeria-search');
    if (searchInput) {
        let timeoutId;

        searchInput.addEventListener('input', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(buscarImagenes, 300);
        });
    }

    function buscarImagenes() {
        const searchTerm = searchInput.value.toLowerCase();
        
        galeriaItems.forEach(item => {
            const titulo = item.querySelector('h3')?.textContent.toLowerCase() || '';
            const descripcion = item.querySelector('p')?.textContent.toLowerCase() || '';
            const coincide = titulo.includes(searchTerm) || descripcion.includes(searchTerm);
            
            if (categoriaActual === 'todos' || item.dataset.category === categoriaActual) {
                if (coincide) {
                    mostrarItem(item);
                } else {
                    ocultarItem(item);
                }
            }
        });

        reorganizarCuadricula();
    }

    // Zoom en hover
    galeriaItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Manejador de errores de carga de imágenes
    document.querySelectorAll('.galeria-item img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'assets/img/placeholder.jpg';
            this.alt = 'Imagen no disponible';
            this.closest('.galeria-item').classList.add('error');
        });
    });

    // Inicialización
    window.addEventListener('resize', reorganizarCuadricula);
    reorganizarCuadricula();
});