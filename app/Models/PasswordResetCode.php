<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordResetCode extends Model
{
    use HasFactory;

    protected $table = 'password_reset_codes';

    // Disable updated_at since we only need created_at
    const UPDATED_AT = null;

    protected $fillable = [
        'email',
        'code',
        'created_at',
    ];
}
