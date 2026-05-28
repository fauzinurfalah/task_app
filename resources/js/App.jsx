import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import DetailTask from "./pages/DetailTask";
import CalendarPage from "./pages/CalendarPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

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
        </Routes>
    );
}

export default App;