<?php
/**
 * Optional API: Save QR design (no database required).
 * POST JSON: { "data": "...", "options": {...}, "imageBase64": "data:image/png;base64,..." }
 * Saves to data/designs/{id}.json and data/designs/{id}.png
 * Returns: { "success": true, "id": "...", "url": "api/get-design.php?id=..." }
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body) || empty($body['data'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing or invalid body']);
    exit;
}

$dataDir = dirname(__DIR__) . '/data/designs';
if (!is_dir($dataDir)) {
    if (!@mkdir($dataDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Could not create data directory']);
        exit;
    }
}

$id = bin2hex(random_bytes(8));
$options = isset($body['options']) && is_array($body['options']) ? $body['options'] : [];
$payload = [
    'id'       => $id,
    'data'     => $body['data'],
    'options'  => $options,
    'created'  => date('c'),
];

$jsonPath = $dataDir . '/' . $id . '.json';
if (file_put_contents($jsonPath, json_encode($payload, JSON_PRETTY_PRINT)) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Could not save design']);
    exit;
}

if (!empty($body['imageBase64']) && preg_match('/^data:image\/png;base64,(.+)$/', $body['imageBase64'], $m)) {
    $pngPath = $dataDir . '/' . $id . '.png';
    $decoded = base64_decode($m[1], true);
    if ($decoded !== false) {
        file_put_contents($pngPath, $decoded);
    }
}

echo json_encode([
    'success' => true,
    'id'      => $id,
    'url'     => 'api/get-design.php?id=' . $id,
]);
