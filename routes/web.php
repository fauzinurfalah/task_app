<?php

use Illuminate\Support\Facades\Route;

Route::get('/storage/{path}', function (\Illuminate\Http\Request $request, $path) {
    $fullPath = storage_path('app/public/' . $path);
    if (!file_exists($fullPath)) {
        abort(404);
    }
    $mimeType = mime_content_type($fullPath);
    $headers = ['Content-Type' => $mimeType];
    
    if ($request->has('download')) {
        $headers['Content-Disposition'] = 'attachment; filename="' . basename($fullPath) . '"';
    }
    
    return response(file_get_contents($fullPath))->withHeaders($headers);
})->where('path', '.*');

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
