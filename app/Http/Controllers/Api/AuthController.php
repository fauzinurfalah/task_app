<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'nim' => 'nullable|unique:users',
            'role' => 'in:mahasiswa,dosen',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'nim' => $request->nim,
            'role' => $request->role ?? 'mahasiswa',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Register berhasil',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function saveToken(Request $request)
    {
        $request->validate([
            'fcm_token' => 'required|string',
        ]);

        $user = $request->user();
        $user->fcm_token = $request->fcm_token;
        $user->save();

        return response()->json([
            'message' => 'FCM Token saved successfully'
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'nim' => 'nullable|string|max:50',
            'foto_profil' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->has('nim')) {
            $user->nim = $request->nim;
        }
        // Also support 'nip' for dosen
        if ($request->has('nip')) {
            $user->nim = $request->nip;
        }

        if ($request->hasFile('foto_profil')) {
            $file = $request->file('foto_profil');
            
            // Hapus foto lama jika ada
            if ($user->foto_profil && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->foto_profil)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->foto_profil);
            }

            // Kompresi dan simpan
            $filename = uniqid() . '_' . time() . '.jpg';
            $path = 'profiles/' . $filename;
            
            // Buat direktori jika belum ada
            if (!\Illuminate\Support\Facades\Storage::disk('public')->exists('profiles')) {
                \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory('profiles');
            }

            $absolutePath = storage_path('app/public/' . $path);
            
            // Kompresi menggunakan native GD (menjadi format JPEG terkompresi)
            $this->compressImage($file->getRealPath(), $absolutePath, 65);

            $user->foto_profil = $path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    private function compressImage($source, $destination, $quality)
    {
        $info = getimagesize($source);

        if ($info['mime'] == 'image/jpeg') 
            $image = imagecreatefromjpeg($source);
        elseif ($info['mime'] == 'image/gif') 
            $image = imagecreatefromgif($source);
        elseif ($info['mime'] == 'image/png') 
            $image = imagecreatefrompng($source);
        else
            return false;

        // Cek orientasi EXIF untuk memutar gambar jika perlu (berguna jika foto dari HP)
        if (function_exists('exif_read_data')) {
            $exif = @exif_read_data($source);
            if ($exif && isset($exif['Orientation'])) {
                $orientation = $exif['Orientation'];
                if ($orientation == 3) {
                    $image = imagerotate($image, 180, 0);
                } elseif ($orientation == 6) {
                    $image = imagerotate($image, -90, 0);
                } elseif ($orientation == 8) {
                    $image = imagerotate($image, 90, 0);
                }
            }
        }

        // Simpan sebagai jpeg dengan kualitas kompresi
        imagejpeg($image, $destination, $quality);
        imagedestroy($image);

        return true;
    }

    public function getProfileImage($filename)
    {
        $path = storage_path('app/public/profiles/' . $filename);
        if (!file_exists($path)) {
            abort(404);
        }

        $file = file_get_contents($path);
        $type = mime_content_type($path);

        return response($file, 200)->header('Content-Type', $type);
    }
}