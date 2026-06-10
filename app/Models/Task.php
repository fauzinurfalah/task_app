<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $table = 'tasks';
    protected $primaryKey = 'id_task';

    protected $fillable = [
        'kode_tugas',
        'nama_tugas',
        'nama_matkul',
        'deskripsi',
        'tags',
        'deadline',
        'jam',
        'tipe',
        'prioritas',
        'status',
        'points',
        'rubric',
        'attachment',
        'attachments',
    ];

    protected function casts(): array
    {
        return [
            'rubric' => 'array',
            'attachments' => 'array',
            'deadline' => 'date',
        ];
    }


    public function submissions()
    {
        return $this->hasMany(Submission::class, 'task_id', 'id_task');
    }
}
