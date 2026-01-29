<?php
/**
 * Optional API: Get saved QR design by ID.
 * GET ?id=xxx returns JSON design or 404.
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$id = isset($_GET['id']) ? preg_replace('/[^a-f0-9]/', '', $_GET['id']) : '';
if (strlen($id) !== 16) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid ID']);
    exit;
}

$jsonPath = dirname(__DIR__) . '/data/designs/' . $id . '.json';
if (!is_file($jsonPath)) {
    http_response_code(404);
    echo json_encode(['error' => 'Design not found']);
    exit;
}

$payload = json_decode(file_get_contents($jsonPath), true);
if (!$payload) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid design file']);
    exit;
}

echo json_encode($payload);
