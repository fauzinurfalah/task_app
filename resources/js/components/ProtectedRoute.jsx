import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Mengecek apakah ada data user di localStorage (tanda sudah login)
    const user = localStorage.getItem('user');
    
    if (!user) {
        // Jika belum login, tendang balik ke halaman login (/)
        return <Navigate to="/" replace />;
    }

    // Jika sudah login, izinkan akses ke komponen tujuan
    return children;
};

export default ProtectedRoute;
