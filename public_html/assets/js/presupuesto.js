document.addEventListener('DOMContentLoaded', function() {
    // Configuración de precios base por m²
    const PRECIOS = {
        interior: 12, // €/m²
        exterior: {
            solo: 15, // €/m²
            reparacion: 22 // €/m²
        },
        maderaBarniz: 25, // €/m²
        maderaPintura: 20 // €/m²
    };

    // Elementos del DOM
    const form = document.getElementById('presupuestoForm');
    const tipoServicio = document.getElementById('tipoServicio');
    const tipoExterior = document.getElementById('tipoExterior');
    const metros = document.getElementById('metros');
    const opcionesExterior = document.getElementById('opcionesExterior');
    const generatePDFBtn = document.getElementById('generatePDF');

    // Variables para el resumen
    const servicioSeleccionado = document.getElementById('servicioSeleccionado');
    const metrosSeleccionados = document.getElementById('metrosSeleccionados');
    const precioMetro = document.getElementById('precioMetro');
    const totalEstimado = document.getElementById('totalEstimado');

    // Event Listeners
    if (form) {
        tipoServicio.addEventListener('change', actualizarOpciones);
        tipoServicio.addEventListener('change', calcularPresupuesto);
        tipoExterior.addEventListener('change', calcularPresupuesto);
        metros.addEventListener('input', calcularPresupuesto);
        generatePDFBtn.addEventListener('click', generarPDF);
    }

    function actualizarOpciones() {
        opcionesExterior.classList.toggle('hidden', tipoServicio.value !== 'exterior');
        calcularPresupuesto();
    }

    function calcularPresupuesto() {
        if (!form.checkValidity()) {
            generatePDFBtn.disabled = true;
            return;
        }

        const tipo = tipoServicio.value;
        const metrosCuadrados = parseFloat(metros.value) || 0;
        let precioBase = 0;
        let descripcionServicio = '';

        switch (tipo) {
            case 'interior':
                precioBase = PRECIOS.interior;
                descripcionServicio = 'Pintura Interior';
                break;
            case 'exterior':
                precioBase = PRECIOS.exterior[tipoExterior.value];
                descripcionServicio = `Pintura Exterior ${tipoExterior.value === 'reparacion' ? 'con reparación' : 'básica'}`;
                break;
            case 'maderaBarniz':
                precioBase = PRECIOS.maderaBarniz;
                descripcionServicio = 'Barnizado de Madera';
                break;
            case 'maderaPintura':
                precioBase = PRECIOS.maderaPintura;
                descripcionServicio = 'Pintura de Madera';
                break;
        }

        const total = metrosCuadrados * precioBase;

        // Actualizar resumen
        servicioSeleccionado.textContent = descripcionServicio;
        metrosSeleccionados.textContent = `${metrosCuadrados} m²`;
        precioMetro.textContent = `${precioBase.toFixed(2)} €/m²`;
        totalEstimado.textContent = `${total.toFixed(2)} €`;

        // Habilitar botón de PDF si hay datos válidos
        generatePDFBtn.disabled = !metrosCuadrados || !tipo;
    }

    function generarPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configuración del documento
        const fecha = new Date().toLocaleDateString();
        const presupuestoNum = generarNumeroPresupuesto();
        
        // Añadir logo si existe
        try {
            const logo = new Image();
            logo.src = 'assets/img/logo.png';
            doc.addImage(logo, 'PNG', 15, 15, 30, 30);
        } catch (error) {
            console.warn('Logo no encontrado', error);
        }

        // Encabezado
        doc.setFontSize(20);
        doc.text('Presupuesto', 105, 30, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`Fecha: ${fecha}`, 15, 50);
        doc.text(`Nº Presupuesto: ${presupuestoNum}`, 15, 57);

        // Datos de la empresa
        doc.setFontSize(12);
        doc.text('Pintura y Restauración La Palma', 15, 70);
        doc.setFontSize(10);
        doc.text('CIF: XXXXXXXXX', 15, 77);
        doc.text('Dirección: XXXXXXXX', 15, 84);
        doc.text('Tel: XXXXXXXXX', 15, 91);
        doc.text('Email: info@tupintura.com', 15, 98);

        // Detalles del presupuesto
        doc.setFontSize(12);
        doc.text('Detalles del Servicio', 15, 115);
        
        const detalles = [
            ['Servicio:', servicioSeleccionado.textContent],
            ['Metros Cuadrados:', metrosSeleccionados.textContent],
            ['Precio por m²:', precioMetro.textContent],
            ['Total Estimado:', totalEstimado.textContent]
        ];

        doc.autoTable({
            startY: 120,
            head: [['Concepto', 'Detalle']],
            body: detalles,
            theme: 'striped',
            margin: { left: 15 }
        });

        // Notas y condiciones
        doc.setFontSize(10);
        const notasY = doc.lastAutoTable.finalY + 20;
        doc.text('Notas:', 15, notasY);
        doc.setFontSize(8);
        const notas = [
            '- Presupuesto válido durante 15 días.',
            '- Los precios no incluyen IVA.',
            '- Se requiere un 30% de anticipo para iniciar los trabajos.',
            '- El precio final puede variar según las condiciones específicas del proyecto.'
        ];

        notas.forEach((nota, index) => {
            doc.text(nota, 15, notasY + 7 + (index * 5));
        });

        // Guardar PDF
        doc.save(`presupuesto_${presupuestoNum}.pdf`);
    }

    function generarNumeroPresupuesto() {
        const fecha = new Date();
        const año = fecha.getFullYear().toString().substr(-2);
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const aleatorio = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `P${año}${mes}-${aleatorio}`;
    }
});