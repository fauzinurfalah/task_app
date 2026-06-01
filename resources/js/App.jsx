import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import DetailTask from "./pages/DetailTask";
import CalendarPage from "./pages/CalendarPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
// ─── Mahasiswa Pages ──────────────────────────────────────────────────────────
import MahasiswaDashboard  from "./pages/mahasiswa/Dashboard";
import MahasiswaTasks      from "./pages/mahasiswa/Tasks";
import MahasiswaDetailTask from "./pages/mahasiswa/DetailTask";
import MahasiswaCalendar   from "./pages/mahasiswa/CalendarPage";

// ─── Dosen Pages ──────────────────────────────────────────────────────────────
import DosenDashboard   from "./pages/dosen/Dashboard";
import DosenManageTask  from "./pages/dosen/ManageTask";
import DosenTaskDetail  from "./pages/dosen/TaskDetail";
import DosenSubmissions from "./pages/dosen/Submissions";
import DosenGrading     from "./pages/dosen/Grading";
import DosenStudents    from "./pages/dosen/Students";
import DosenCalendar    from "./pages/dosen/CalendarPage";
import DosenProfile     from "./pages/dosen/Profile";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/tasks" element={
                <ProtectedRoute>
                    <Tasks />
                </ProtectedRoute>
            } />
            <Route path="/detail" element={
                <ProtectedRoute>
                    <DetailTask />
                </ProtectedRoute>
            } />
            <Route path="/calendar" element={
                <ProtectedRoute>
                    <CalendarPage />
                </ProtectedRoute>
            } />
            {/* ── Mahasiswa Routes ── */}
            <Route path="/"                   element={<MahasiswaDashboard />}  />
            <Route path="/mahasiswa/tasks"    element={<MahasiswaTasks />}      />
            <Route path="/mahasiswa/detail"   element={<MahasiswaDetailTask />} />
            <Route path="/mahasiswa/calendar" element={<MahasiswaCalendar />}   />

            {/* ── Dosen Routes ── */}
            <Route path="/dosen"                  element={<DosenDashboard />}   />
            <Route path="/dosen/tasks"            element={<DosenManageTask />}  />
            <Route path="/dosen/tasks/detail"     element={<DosenTaskDetail />}  />
            <Route path="/dosen/submissions"      element={<DosenSubmissions />} />
            <Route path="/dosen/grading"          element={<DosenGrading />}     />
            <Route path="/dosen/students"         element={<DosenStudents />}    />
            <Route path="/dosen/calendar"         element={<DosenCalendar />}    />
            <Route path="/dosen/profile"          element={<DosenProfile />}     />
        </Routes>
    );
}

export default App;