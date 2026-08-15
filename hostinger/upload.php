<?php
/**
 * upload.php — Endpoint de subida de imágenes para el editor Wedya.
 *
 * Instalación en Hostinger (ver hostinger/README.md):
 *   1. Crea la carpeta public_html/wedya-uploads/ y sube este archivo ahí.
 *   2. Cambia $UPLOAD_KEY por una clave larga y aleatoria (debe coincidir
 *      con VITE_UPLOAD_KEY en el editor).
 *   3. Si el editor cambia de dominio, agrégalo a $ALLOWED_ORIGINS.
 *
 * Las fotos se guardan en ./uploads/ con nombre aleatorio y se responde:
 *   { "success": true, "url": "https://tudominio.com/wedya-uploads/uploads/..." }
 */

$UPLOAD_KEY = 'CAMBIAME-09876543210987654321';

$ALLOWED_ORIGINS = [
    'https://iliestefa.github.io',
    'https://editor.mywedya.com'
];

$MAX_BYTES = 25 * 1024 * 1024; // 25 MB

$ALLOWED_TYPES = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
    'image/heic' => 'heic',
    'image/heif' => 'heif',
];

// ── CORS ─────────────────────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $ALLOWED_ORIGINS, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

function fail(int $code, string $msg): void
{
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Método no permitido');
}

if (!hash_equals($UPLOAD_KEY, (string) ($_POST['key'] ?? ''))) {
    fail(401, 'Clave inválida');
}

if (empty($_FILES['image']) || ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    fail(400, 'No se recibió ninguna imagen');
}

$file = $_FILES['image'];
if ($file['size'] > $MAX_BYTES) {
    fail(413, 'La imagen supera el máximo de 25 MB');
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($file['tmp_name']);
if (!isset($ALLOWED_TYPES[$mime])) {
    fail(415, 'Formato de imagen no soportado');
}

$uploadDir = __DIR__ . '/uploads';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    fail(500, 'No se pudo crear la carpeta de subidas');
}

// Bloquea la ejecución de scripts dentro de /uploads
$htaccess = $uploadDir . '/.htaccess';
if (!file_exists($htaccess)) {
    file_put_contents(
        $htaccess,
        "RemoveHandler .php .phtml .php3 .php4 .php5 .php7 .phps\n"
        . "RemoveType .php .phtml\n"
        . "<FilesMatch \"\\.(?i:php|phtml|phar)$\">\n"
        . "Require all denied\n"
        . "</FilesMatch>\n"
    );
}

$name = date('Ymd-His') . '-' . bin2hex(random_bytes(6)) . '.' . $ALLOWED_TYPES[$mime];
if (!move_uploaded_file($file['tmp_name'], $uploadDir . '/' . $name)) {
    fail(500, 'No se pudo guardar la imagen');
}

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$base   = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
$url    = $scheme . '://' . $_SERVER['HTTP_HOST'] . $base . '/uploads/' . $name;

echo json_encode(['success' => true, 'url' => $url]);
