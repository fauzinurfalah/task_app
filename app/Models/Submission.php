<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $fillable = [
        'task_id',
        'user_id',
        'file',
        'status',
        'grade',
        'feedback',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
        ];
    }

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id', 'id_task');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
