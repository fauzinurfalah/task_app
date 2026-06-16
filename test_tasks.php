<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\NotificationLog;

$logs = NotificationLog::all();
foreach($logs as $log) {
    echo "Task: {$log->task_id} | User: {$log->user_id} | Key: {$log->reminder_key} | At: {$log->sent_at}\n";
}
