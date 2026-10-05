<?php
/**
 * Optional API: Get saved QR design by ID.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    respond(405, ['error' => 'Method not allowed']);
}

$id = (string)($_GET['id'] ?? '');
if (!preg_match('/^(?:[a-f0-9]{16}|[a-f0-9]{24})$/', $id)) {
    respond(400, ['error' => 'Invalid ID']);
}

$jsonPath = dirname(__DIR__) . '/data/designs/' . $id . '.json';
if (!is_file($jsonPath) || !is_readable($jsonPath)) {
    respond(404, ['error' => 'Design not found']);
}

$raw = file_get_contents($jsonPath);
if ($raw === false || strlen($raw) > 128 * 1024) {
    respond(500, ['error' => 'Invalid design file']);
}

$payload = json_decode($raw, true, 32);
if (!is_array($payload) || ($payload['id'] ?? null) !== $id || !isset($payload['data'])) {
    respond(500, ['error' => 'Invalid design file']);
}

respond(200, $payload);
