import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    ClipboardList,
    CalendarDays,
    User,
} from "lucide-react";

export default function Sidebar() {
    const location = useLocation();
    const path = location.pathname;

    const links = [
        { to: "/",         icon: <LayoutDashboard size={18} />, label: "Dashboard" },
        { to: "/tasks",    icon: <ClipboardList   size={18} />, label: "Tasks"     },
        { to: "/calendar", icon: <CalendarDays    size={18} />, label: "Calendar"  },
        { to: "/profile",  icon: <User            size={18} />, label: "Profile"   },
    ];

    return (
        <div className="sidebar">

            {/* LOGO */}
            <h1 className="sidebar__logo">TaskApp</h1>

            {/* NAV */}
            <nav className="sidebar__nav">
                {links.map(({ to, icon, label }) => {
                    const isActive = to === "/" ? path === "/" : path.startsWith(to);
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`sidebar__link${isActive ? " sidebar__link--active" : ""}`}
                        >
                            {icon}
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* USER PROFILE */}
            <div className="sidebar__profile">
                <div className="sidebar__avatar">F</div>
                <div>
                    <p className="sidebar__profile-name">Fauzi</p>
                    <p className="sidebar__profile-role">Computer Science</p>
                </div>
            </div>

        </div>
    );
}