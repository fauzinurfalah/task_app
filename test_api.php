<?php
$data = json_encode(['email' => 'alipaasha2005@gmail.com']); // Use a real or fake email
$options = [
    'http' => [
        'method' => 'POST',
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        'content' => $data,
        'ignore_errors' => true
    ]
];
$context = stream_context_create($options);
echo file_get_contents('http://3.104.52.205/api/forgot-password', false, $context);
