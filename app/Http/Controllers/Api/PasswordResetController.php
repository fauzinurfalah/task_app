<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\PasswordResetCode;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordMail;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    // 1. Mengirim OTP ke email
    public function sendResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ], [
            'email.exists' => 'Email tidak terdaftar.'
        ]);

        $email = $request->email;
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        // Hapus kode lama jika ada
        PasswordResetCode::where('email', $email)->delete();

        // Simpan kode baru
        PasswordResetCode::create([
            'email' => $email,
            'code' => $code,
            'created_at' => Carbon::now()
        ]);

        // Kirim email
        try {
            Mail::to($email)->send(new ResetPasswordMail($code));
            return response()->json([
                'message' => 'Kode verifikasi telah dikirim ke email Anda.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengirim email: ' . $e->getMessage()
            ], 500);
        }
    }

    // 2. Memverifikasi OTP
    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6'
        ]);

        $resetData = PasswordResetCode::where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (!$resetData) {
            return response()->json(['message' => 'Kode verifikasi salah atau tidak valid.'], 400);
        }

        // Cek apakah kode sudah expired (15 menit)
        $createdAt = Carbon::parse($resetData->created_at);
        if ($createdAt->diffInMinutes(Carbon::now()) > 15) {
            $resetData->delete();
            return response()->json(['message' => 'Kode verifikasi telah kadaluarsa. Silakan minta ulang.'], 400);
        }

        return response()->json([
            'message' => 'Kode verifikasi valid.'
        ]);
    }

    // 3. Mereset password dengan OTP
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|min:6|confirmed' // Pastikan frontend kirim 'password_confirmation'
        ]);

        $resetData = PasswordResetCode::where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (!$resetData) {
            return response()->json(['message' => 'Kode verifikasi salah atau tidak valid.'], 400);
        }

        $createdAt = Carbon::parse($resetData->created_at);
        if ($createdAt->diffInMinutes(Carbon::now()) > 15) {
            $resetData->delete();
            return response()->json(['message' => 'Kode verifikasi telah kadaluarsa.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Hapus kode setelah digunakan
        $resetData->delete();

        return response()->json([
            'message' => 'Password berhasil diubah. Silakan login dengan password baru.'
        ]);
    }

    // 4. Mengganti password saat sudah login (Dari Menu Profile)
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed' // Frontend harus mengirim new_password_confirmation
        ]);

        $user = $request->user();

        // Cek password lama
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Password saat ini salah.'], 400);
        }

        // Ganti dengan password baru
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password berhasil diganti.'
        ]);
    }
}
