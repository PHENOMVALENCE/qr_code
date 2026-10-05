<?php
/**
 * Optional API: Save QR design (no database required).
 * POST JSON: { "data": "...", "options": {...}, "imageBase64": "data:image/png;base64,..." }
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST, OPTIONS');
    respond(405, ['success' => false, 'error' => 'Method not allowed']);
}

$contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 6 * 1024 * 1024) {
    respond(413, ['success' => false, 'error' => 'Request too large']);
}

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 6 * 1024 * 1024) {
    respond(413, ['success' => false, 'error' => 'Request too large']);
}

$body = json_decode($raw, true, 32);
if (!is_array($body)) {
    respond(400, ['success' => false, 'error' => 'Invalid JSON body']);
}

$data = trim((string)($body['data'] ?? ''));
if ($data === '' || strlen($data) > 4000) {
    respond(400, ['success' => false, 'error' => 'QR data must be between 1 and 4000 bytes']);
}

$options = isset($body['options']) && is_array($body['options']) ? $body['options'] : [];
$allowedOptionKeys = [
    'size', 'ec', 'fgColor', 'bgColor', 'transparent', 'useGradient', 'gradientFrom', 'gradientTo',
    'gradientRotation', 'cornerSquare', 'cornerDot', 'dotStyle', 'labelText'
];
$options = array_intersect_key($options, array_flip($allowedOptionKeys));
if (strlen((string)json_encode($options)) > 20000) {
    respond(400, ['success' => false, 'error' => 'Design options are too large']);
}

$dataDir = dirname(__DIR__) . '/data/designs';
if (!is_dir($dataDir) && !@mkdir($dataDir, 0750, true)) {
    respond(500, ['success' => false, 'error' => 'Could not create data directory']);
}
if (!is_writable($dataDir)) {
    respond(500, ['success' => false, 'error' => 'Data directory is not writable']);
}

try {
    $id = bin2hex(random_bytes(12));
} catch (Throwable $e) {
    respond(500, ['success' => false, 'error' => 'Could not generate design ID']);
}

$payload = [
    'id' => $id,
    'data' => $data,
    'options' => $options,
    'created' => gmdate('c'),
];

$json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if ($json === false) {
    respond(500, ['success' => false, 'error' => 'Could not encode design']);
}

$jsonPath = $dataDir . DIRECTORY_SEPARATOR . $id . '.json';
if (file_put_contents($jsonPath, $json, LOCK_EX) === false) {
    respond(500, ['success' => false, 'error' => 'Could not save design']);
}
@chmod($jsonPath, 0640);

$imageBase64 = $body['imageBase64'] ?? null;
if (is_string($imageBase64) && $imageBase64 !== '') {
    if (!preg_match('/^data:image\/png;base64,([A-Za-z0-9+\/=]+)$/', $imageBase64, $match)) {
        @unlink($jsonPath);
        respond(400, ['success' => false, 'error' => 'Only PNG preview images are accepted']);
    }
    $decoded = base64_decode($match[1], true);
    if ($decoded === false || strlen($decoded) > 5 * 1024 * 1024 || substr($decoded, 0, 8) !== "\x89PNG\r\n\x1a\n") {
        @unlink($jsonPath);
        respond(400, ['success' => false, 'error' => 'Invalid PNG preview image']);
    }
    $pngPath = $dataDir . DIRECTORY_SEPARATOR . $id . '.png';
    if (file_put_contents($pngPath, $decoded, LOCK_EX) === false) {
        @unlink($jsonPath);
        respond(500, ['success' => false, 'error' => 'Could not save preview image']);
    }
    @chmod($pngPath, 0640);
}

respond(200, [
    'success' => true,
    'id' => $id,
    'url' => 'api/get-design.php?id=' . $id,
]);
