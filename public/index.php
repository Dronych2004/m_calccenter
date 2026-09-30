<?php
/**
 * Entry-point для SPA на любом хостинге.
 *
 * Логика:
 * 1. Если запрошен prerendered файл (/mortgage/index.html) — отдаём его.
 * 2. Иначе — SPA fallback (index.html).
 *
 * Trailing slash редиректит .htaccess (/classic/ → /classic, 301).
 * Canonical URL задаётся через <link rel="canonical"> в HTML.
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Пытаемся отдать prerendered HTML для clean URLs
// /mortgage → /mortgage/index.html
if ($uri !== '/') {
    $prerendered = __DIR__ . $uri . '/index.html';
    if (is_file($prerendered)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($prerendered);
        exit;
    }
}

// SPA fallback — отдаём главный index.html
header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/index.html');
