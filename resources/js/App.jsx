import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

// ─── Mahasiswa Pages ──────────────────────────────────────────────────────────
import MahasiswaDashboard from "./pages/mahasiswa/Dashboard";
import MahasiswaTasks from "./pages/mahasiswa/Tasks";
import MahasiswaDetailTask from "./pages/mahasiswa/DetailTask";
import MahasiswaCalendar from "./pages/mahasiswa/CalendarPage";
import MahasiswaProfile from "./pages/mahasiswa/Profile";

// ─── Dosen Pages ──────────────────────────────────────────────────────────────
import DosenDashboard from "./pages/dosen/Dashboard";
import DosenManageTask from "./pages/dosen/ManageTask";
import DosenTaskDetail from "./pages/dosen/TaskDetail";
import DosenSubmissions from "./pages/dosen/Submissions";
import DosenGrading from "./pages/dosen/Grading";
import DosenStudents from "./pages/dosen/Students";
import DosenCalendar from "./pages/dosen/CalendarPage";
import DosenProfile from "./pages/dosen/Profile";

function App() {
    return (
        <Routes>
            <Route path="/"         element={<Login />}    />
            <Route path="/register" element={<Register />} />

            {/* ── Mahasiswa Routes ── */}
            <Route path="/mahasiswa"          element={<ProtectedRoute><MahasiswaDashboard /></ProtectedRoute>}  />
            <Route path="/mahasiswa/tasks"    element={<ProtectedRoute><MahasiswaTasks /></ProtectedRoute>}      />
            <Route path="/mahasiswa/detail"   element={<ProtectedRoute><MahasiswaDetailTask /></ProtectedRoute>} />
            <Route path="/mahasiswa/calendar" element={<ProtectedRoute><MahasiswaCalendar /></ProtectedRoute>}   />
            <Route path="/mahasiswa/profile"  element={<ProtectedRoute><MahasiswaProfile /></ProtectedRoute>}   />

            {/* ── Dosen Routes ── */}
            <Route path="/dosen"              element={<ProtectedRoute><DosenDashboard /></ProtectedRoute>}   />
            <Route path="/dosen/tasks"        element={<ProtectedRoute><DosenManageTask /></ProtectedRoute>}  />
            <Route path="/dosen/tasks/detail" element={<ProtectedRoute><DosenTaskDetail /></ProtectedRoute>}  />
            <Route path="/dosen/submissions"  element={<ProtectedRoute><DosenSubmissions /></ProtectedRoute>} />
            <Route path="/dosen/grading"      element={<ProtectedRoute><DosenGrading /></ProtectedRoute>}     />
            <Route path="/dosen/students"     element={<ProtectedRoute><DosenStudents /></ProtectedRoute>}    />
            <Route path="/dosen/calendar"     element={<ProtectedRoute><DosenCalendar /></ProtectedRoute>}    />
            <Route path="/dosen/profile"      element={<ProtectedRoute><DosenProfile /></ProtectedRoute>}     />
        </Routes>
    );
}

export default App;