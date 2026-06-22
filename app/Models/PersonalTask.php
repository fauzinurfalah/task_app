<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonalTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'course',
        'description',
        'due',
        'dueTime',
        'priority',
        'status',
        'progress',
        'subtasks',
        'notified_keys'
    ];

    protected $casts = [
        'subtasks' => 'array',
        'notified_keys' => 'array',
        'due' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
