document.addEventListener('DOMContentLoaded', function() {
    // Configuración del mapa
    const mapConfig = {
        center: [28.6867, -17.7645], // Coordenadas de La Palma
        zoom: 11
    };

    // Inicializar el mapa si existe el contenedor
    const mapContainer = document.getElementById('mapa');
    if (mapContainer) {
        const map = L.map('mapa').setView(mapConfig.center, mapConfig.zoom);

        // Añadir capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Añadir marcador
        const marker = L.marker(mapConfig.center).addTo(map);
        marker.bindPopup("<strong>Pintura y Restauración La Palma</strong><br>Visítenos en nuestra oficina").openPopup();
    }

    // Validación y envío del formulario de contacto
    const contactForm = document.getElementById('formulario-contacto');
    if (contactForm) {
        contactForm.addEventListener('submit', handleSubmit);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {
            const formData = new FormData(contactForm);
            const response = await sendFormData(formData);

            if (response.success) {
                showMessage('¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.', 'success');
                contactForm.reset();
            } else {
                throw new Error(response.message || 'Error al enviar el mensaje');
            }
        } catch (error) {
            showMessage('Error al enviar el mensaje. Por favor, inténtelo de nuevo.', 'error');
            console.error('Error:', error);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }

    function validateForm() {
        const requiredFields = contactForm.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            removeErrorMessage(field);

            if (!field.value.trim()) {
                showFieldError(field, 'Este campo es obligatorio');
                isValid = false;
                return;
            }

            // Validación específica para email
            if (field.type === 'email' && !validateEmail(field.value)) {
                showFieldError(field, 'Por favor, introduce un email válido');
                isValid = false;
                return;
            }

            // Validación para teléfono (opcional)
            const phone = contactForm.querySelector('#telefono');
            if (phone && phone.value && !validatePhone(phone.value)) {
                showFieldError(phone, 'Por favor, introduce un teléfono válido');
                isValid = false;
            }
        });

        return isValid;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        return re.test(phone);
    }

    function showFieldError(field, message) {
        field.classList.add('invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    function removeErrorMessage(field) {
        field.classList.remove('invalid');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    async function sendFormData(formData) {
        const response = await fetch('procesar-contacto.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type}`;
        messageDiv.textContent = message;

        const form = document.querySelector('.contacto-form');
        form.insertBefore(messageDiv, form.firstChild);

        // Remover el mensaje después de 5 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Autocompletar código postal y ciudad
    const codigoPostalInput = document.getElementById('codigo_postal');
    if (codigoPostalInput) {
        codigoPostalInput.addEventListener('blur', async function() {
            if (this.value.length === 5) {
                try {
                    const response = await fetch(`https://api.zippopotam.us/es/${this.value}`);
                    const data = await response.json();
                    
                    const ciudadInput = document.getElementById('ciudad');
                    if (ciudadInput && data.places?.[0]) {
                        ciudadInput.value = data.places[0]['place name'];
                    }
                } catch (error) {
                    console.error('Error al obtener datos del código postal:', error);
                }
            }
        });
    }
});