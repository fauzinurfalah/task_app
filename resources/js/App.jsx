import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error(error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: 40, color: 'red'}}><h1>Sistem Error</h1><pre>{this.state.error?.toString()}</pre></div>;
    }
    return this.props.children; 
  }
}

// ─── Mahasiswa Pages ──────────────────────────────────────────────────────────
import MahasiswaDashboard from "./pages/mahasiswa/Dashboard";
import MahasiswaTasks from "./pages/mahasiswa/Tasks";
import MahasiswaDetailTask from "./pages/mahasiswa/DetailTask";
import MahasiswaPersonalDetail from "./pages/mahasiswa/PersonalTaskDetail";
import MahasiswaCalendar from "./pages/mahasiswa/CalendarPage";
import MahasiswaProfile from "./pages/mahasiswa/Profile";
import MahasiswaSettings from "./pages/mahasiswa/Settings";

// ─── Dosen Pages ──────────────────────────────────────────────────────────────
import DosenDashboard from "./pages/dosen/Dashboard";
import DosenManageTask from "./pages/dosen/ManageTask";
import DosenTaskDetail from "./pages/dosen/TaskDetail";
import DosenSubmissions from "./pages/dosen/Submissions";
import DosenGrading from "./pages/dosen/Grading";
import DosenStudents from "./pages/dosen/Students";
import DosenCalendar from "./pages/dosen/CalendarPage";
import DosenProfile from "./pages/dosen/Profile";

import { requestForToken, setupForegroundListener } from "./firebase";
import axiosClient from "./axiosClient";

function App() {
    React.useEffect(() => {
        // Request token only if user is logged in
        const token = localStorage.getItem("token");
        if (token) {
            requestForToken().then((fcmToken) => {
                if (fcmToken) {
                    console.log("FCM Token:", fcmToken);
                    // Send token to backend
                    axiosClient.post("/fcm-token", { fcm_token: fcmToken })
                        .catch(err => console.error("Gagal mengirim FCM token ke backend:", err));
                }
            });

            // Listen for foreground messages
            setupForegroundListener(payload => {
                console.log("Foreground notification received:", payload);
                // Kembalikan ke alert sesuai permintaan (bisa dikustomisasi jadi Toast/Modal nanti)
                alert(`Notifikasi Baru: ${payload.notification?.title}\n${payload.notification?.body}`);
            });
        }
    }, []);

    return (
        <Routes>
            <Route path="/"         element={<Login />}    />
            <Route path="/login"    element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ── Mahasiswa Routes ── */}
            <Route path="/mahasiswa" element={<ProtectedRoute allowedRole="mahasiswa"><MahasiswaDashboard /></ProtectedRoute>} />
            <Route path="/mahasiswa/tasks" element={<ProtectedRoute allowedRole="mahasiswa"><MahasiswaTasks /></ProtectedRoute>} />
            <Route path="/mahasiswa/tasks/detail" element={<ProtectedRoute allowedRole="mahasiswa"><MahasiswaDetailTask /></ProtectedRoute>} />
            <Route path="/mahasiswa/tasks/mandiri" element={<ProtectedRoute allowedRole="mahasiswa"><MahasiswaPersonalDetail /></ProtectedRoute>} />
            <Route path="/mahasiswa/calendar" element={<ProtectedRoute allowedRole="mahasiswa"><MahasiswaCalendar /></ProtectedRoute>} />
            <Route path="/mahasiswa/profile" element={<ProtectedRoute allowedRole="mahasiswa"><MahasiswaProfile /></ProtectedRoute>} />
            <Route path="/mahasiswa/settings" element={<ProtectedRoute allowedRole="mahasiswa"><MahasiswaSettings /></ProtectedRoute>} />

            {/* ── Dosen Routes ── */}
            <Route path="/dosen" element={<ProtectedRoute allowedRole="dosen"><DosenDashboard /></ProtectedRoute>} />
            <Route path="/dosen/tasks" element={<ProtectedRoute allowedRole="dosen"><DosenManageTask /></ProtectedRoute>} />
            <Route path="/dosen/tasks/detail" element={<ProtectedRoute allowedRole="dosen"><ErrorBoundary><DosenTaskDetail /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/dosen/submissions" element={<ProtectedRoute allowedRole="dosen"><DosenSubmissions /></ProtectedRoute>} />
            <Route path="/dosen/grading" element={<ProtectedRoute allowedRole="dosen"><DosenGrading /></ProtectedRoute>} />
            <Route path="/dosen/students" element={<ProtectedRoute allowedRole="dosen"><DosenStudents /></ProtectedRoute>} />
            <Route path="/dosen/calendar" element={<ProtectedRoute allowedRole="dosen"><DosenCalendar /></ProtectedRoute>} />
            <Route path="/dosen/profile" element={<ProtectedRoute allowedRole="dosen"><DosenProfile /></ProtectedRoute>} />
        </Routes>
    );
}

export default App;