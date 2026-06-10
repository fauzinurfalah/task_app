import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
    // Mengecek apakah ada data user di localStorage (tanda sudah login)
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
        // Jika belum login, tendang balik ke halaman login (/)
        return <Navigate to="/" replace />;
    }

    const user = JSON.parse(userStr);

    const userRole = user.role || 'mahasiswa';

    // Mengecek apakah role user sesuai dengan role halaman yang diakses
    if (allowedRole && userRole !== allowedRole) {
        // Jika tidak sesuai, tendang ke dashboard mereka masing-masing
        return <Navigate to={`/${userRole}`} replace />;
    }

    // Jika sudah login dan role sesuai, izinkan akses ke komponen tujuan
    return children;
};

export default ProtectedRoute;
