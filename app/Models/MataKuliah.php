<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MataKuliah extends Model
{
    protected $table = 'mata_kuliahs';
    protected $primaryKey = 'id_matkul';

    protected $fillable = [
        'nama_matkul',
        'kode_mk',
        'nama_dosen',
    ];

    public function tasks()
    {
        return $this->hasMany(Task::class, 'nama_matkul', 'nama_matkul');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'course_user', 'id_matkul', 'user_id');
    }
}
