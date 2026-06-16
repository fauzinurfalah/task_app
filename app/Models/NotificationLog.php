<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $fillable = [
        'task_id',
        'user_id',
        'reminder_key',
        'sent_at',
    ];
}
