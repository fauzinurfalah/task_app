import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import DetailTask from "./pages/DetailTask";
import CalendarPage from "./pages/CalendarPage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/detail" element={<DetailTask />} />
            <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
    );
}

export default App;