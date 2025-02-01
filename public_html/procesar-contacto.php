<?php
// Configuración inicial
ini_set('display_errors', 0);
error_reporting(E_ALL);
date_default_timezone_set('Atlantic/Canary'); // Zona horaria de Canarias

// Configuración de correo
define('EMAIL_DESTINO', 'info@tupintura.com');
define('EMAIL_REMITENTE', 'noreply@tupintura.com');
define('ASUNTO_PREFIX', 'Nuevo contacto web: ');

// Configuración de seguridad
define('MAX_INTENTOS', 5);
define('TIEMPO_BLOQUEO', 3600); // 1 hora en segundos
define('ARCHIVO_LOG', 'logs/contacto.log');
define('SESSION_NAMESPACE', 'contacto_form_');

// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Función para respuesta JSON
function responderJSON($success, $message) {
    header('Content-Type: application/json');
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJSON(false, 'Método no permitido');
}

// Verificar token CSRF
if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION[SESSION_NAMESPACE . 'csrf_token']) {
    registrarIntento('error_csrf', $_SERVER['REMOTE_ADDR']);
    responderJSON(false, 'Error de validación');
}

// Verificar límite de intentos
if (verificarIntentosSuperados($_SERVER['REMOTE_ADDR'])) {
    responderJSON(false, 'Demasiados intentos. Por favor, inténtelo más tarde');
}

// Validar campos requeridos
$campos_requeridos = ['nombre', 'email', 'mensaje'];
foreach ($campos_requeridos as $campo) {
    if (!isset($_POST[$campo]) || empty(trim($_POST[$campo]))) {
        responderJSON(false, 'Todos los campos marcados con * son obligatorios');
    }
}

// Sanitizar y validar datos
$nombre = filter_var(trim($_POST['nombre']), FILTER_SANITIZE_STRING);
$email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
$telefono = isset($_POST['telefono']) ? filter_var(trim($_POST['telefono']), FILTER_SANITIZE_STRING) : '';
$servicio = isset($_POST['servicio']) ? filter_var(trim($_POST['servicio']), FILTER_SANITIZE_STRING) : '';
$mensaje = filter_var(trim($_POST['mensaje']), FILTER_SANITIZE_STRING);

// Validación adicional de email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responderJSON(false, 'Por favor, introduce un email válido');
}

// Validación de teléfono (si se proporcionó)
if (!empty($telefono) && !preg_match('/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/', $telefono)) {
    responderJSON(false, 'Por favor, introduce un teléfono válido');
}

// Preparar correo
$asunto = ASUNTO_PREFIX . $nombre;

$cuerpo = "Nuevo mensaje de contacto:\n\n";
$cuerpo .= "Nombre: " . $nombre . "\n";
$cuerpo .= "Email: " . $email . "\n";
if (!empty($telefono)) {
    $cuerpo .= "Teléfono: " . $telefono . "\n";
}
if (!empty($servicio)) {
    $cuerpo .= "Servicio de interés: " . $servicio . "\n";
}
$cuerpo .= "\nMensaje:\n" . $mensaje . "\n";
$cuerpo .= "\n--\nEnviado desde el formulario de contacto web";

// Cabeceras del correo
$cabeceras = [
    'From' => EMAIL_REMITENTE,
    'Reply-To' => $email,
    'X-Mailer' => 'PHP/' . phpversion(),
    'Content-Type' => 'text/plain; charset=UTF-8'
];

try {
    // Enviar correo
    if (!mail(EMAIL_DESTINO, $asunto, $cuerpo, $cabeceras)) {
        throw new Exception('Error al enviar el correo');
    }

    // Registrar éxito
    registrarIntento('exito', $_SERVER['REMOTE_ADDR']);
    
    // Enviar confirmación al cliente
    enviarConfirmacion($email, $nombre);

    // Limpiar sesión
    unset($_SESSION[SESSION_NAMESPACE . 'csrf_token']);
    
    responderJSON(true, 'Mensaje enviado correctamente');

} catch (Exception $e) {
    registrarIntento('error', $_SERVER['REMOTE_ADDR']);
    error_log("Error en formulario de contacto: " . $e->getMessage());
    responderJSON(false, 'Error al procesar la solicitud. Por favor, inténtelo más tarde');
}

// Funciones auxiliares
function verificarIntentosSuperados($ip) {
    $intentos = isset($_SESSION[SESSION_NAMESPACE . 'intentos_' . $ip]) 
        ? $_SESSION[SESSION_NAMESPACE . 'intentos_' . $ip] 
        : 0;
    
    $ultimo_intento = isset($_SESSION[SESSION_NAMESPACE . 'ultimo_intento_' . $ip])
        ? $_SESSION[SESSION_NAMESPACE . 'ultimo_intento_' . $ip]
        : 0;

    // Resetear intentos si ha pasado el tiempo de bloqueo
    if (time() - $ultimo_intento > TIEMPO_BLOQUEO) {
        $_SESSION[SESSION_NAMESPACE . 'intentos_' . $ip] = 0;
        return false;
    }

    return $intentos >= MAX_INTENTOS;
}

function registrarIntento($tipo, $ip) {
    // Incrementar contador de intentos
    $_SESSION[SESSION_NAMESPACE . 'intentos_' . $ip] = 
        (isset($_SESSION[SESSION_NAMESPACE . 'intentos_' . $ip]) 
            ? $_SESSION[SESSION_NAMESPACE . 'intentos_' . $ip] 
            : 0) + 1;
    
    $_SESSION[SESSION_NAMESPACE . 'ultimo_intento_' . $ip] = time();

    // Registrar en archivo de log
    $log = date('Y-m-d H:i:s') . " | IP: " . $ip . " | Tipo: " . $tipo . "\n";
    error_log($log, 3, ARCHIVO_LOG);
}

function enviarConfirmacion($email, $nombre) {
    $asunto = "Hemos recibido tu mensaje - Pintura y Restauración La Palma";
    
    $cuerpo = "Hola " . $nombre . ",\n\n";
    $cuerpo .= "Hemos recibido tu mensaje correctamente. ";
    $cuerpo .= "Nos pondremos en contacto contigo lo antes posible.\n\n";
    $cuerpo .= "Gracias por contactar con nosotros.\n\n";
    $cuerpo .= "Saludos,\nEquipo de Pintura y Restauración La Palma";

    $cabeceras = [
        'From' => EMAIL_REMITENTE,
        'Content-Type' => 'text/plain; charset=UTF-8'
    ];

    mail($email, $asunto, $cuerpo, $cabeceras);
}
?>