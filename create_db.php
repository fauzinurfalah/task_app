<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '');
    $pdo->exec('CREATE DATABASE IF NOT EXISTS task_app');
    echo "SUCCESS\n";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
