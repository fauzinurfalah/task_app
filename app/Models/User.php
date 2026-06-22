<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'nim', 'role', 'foto_profil', 'fcm_token', 'quick_access'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    protected $appends = ['foto_profil_url'];

    public function getFotoProfilUrlAttribute()
    {
        return $this->foto_profil ? url('api/' . $this->foto_profil) : null;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'quick_access' => 'array',
        ];
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    public function courses()
    {
        return $this->belongsToMany(MataKuliah::class, 'course_user', 'user_id', 'id_matkul');
    }

    public function fcmTokens()
    {
        return $this->hasMany(FcmToken::class);
    }
}
