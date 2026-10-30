<?php
// Serve flat prerendered pages without triggering directory redirects.
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache');

if ($uri === '/') {
    readfile(__DIR__ . '/index.html');
    exit;
}

// Restrict lookup to a single safe route segment; never read arbitrary paths.
if (is_string($uri) && preg_match('~^/[a-z0-9-]+$~D', $uri)) {
    $page = __DIR__ . $uri . '.html';
    if (is_file($page)) {
        readfile($page);
        exit;
    }
}

// React displays the not-found page; the HTTP status must also be 404.
http_response_code(404);
readfile(__DIR__ . '/index.html');
