import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    ClipboardList,
    CalendarDays,
    User,
    BookOpen,
    Users,
    GraduationCap,
    Star,
    Upload,
    LogOut,
    ChevronUp,
    Settings,
} from "lucide-react";

// ─── Navigation links per role ────────────────────────────────────────────────
const NAV_LINKS = {
    mahasiswa: [
        { to: "/mahasiswa", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
        { to: "/mahasiswa/tasks", icon: <ClipboardList size={18} />, label: "Tugas" },
        { to: "/mahasiswa/calendar", icon: <CalendarDays size={18} />, label: "Kalender" },
    ],
    dosen: [
        { to: "/dosen", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
        { to: "/dosen/tasks", icon: <BookOpen size={18} />, label: "Kelola Tugas" },
        { to: "/dosen/submissions", icon: <Upload size={18} />, label: "Pengumpulan" },
        { to: "/dosen/grading", icon: <Star size={18} />, label: "Penilaian" },
        { to: "/dosen/students", icon: <Users size={18} />, label: "Mahasiswa" },
        { to: "/dosen/calendar", icon: <CalendarDays size={18} />, label: "Kalender" },
    ],
};

// ─── Role badge styling ───────────────────────────────────────────────────────
const ROLE_META = {
    mahasiswa: {
        icon: <GraduationCap size={14} />,
        label: "Mahasiswa",
        cls: "role-badge--mahasiswa",
        name: "Fauzi",
        sub: "Ilmu Komputer",
        avatar: "F",
        profileTo: "/mahasiswa/profile",
    },
    dosen: {
        icon: <BookOpen size={14} />,
        label: "Dosen",
        cls: "role-badge--dosen",
        name: "Dr. Budi",
        sub: "Teknik Informatika",
        avatar: "B",
        profileTo: "/dosen/profile",
    },
};


export default function Sidebar({ role = "mahasiswa" }) {
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname;
    const links = NAV_LINKS[role] || NAV_LINKS.mahasiswa;
    const meta = ROLE_META[role] || ROLE_META.mahasiswa;

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userName = user?.name || meta.name;
    const userEmail = user?.email || meta.sub;
    const userInitial = userName.charAt(0).toUpperCase();
    const [popupOpen, setPopupOpen] = useState(false);
    const popupRef = useRef(null);
    const triggerRef = useRef(null);

    // Close popup when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                popupRef.current &&
                !popupRef.current.contains(e.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target)
            ) {
                setPopupOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        // Clear auth and redirect
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="sidebar">

            {/* LOGO */}
            <h1 className="sidebar__logo">TaskApp</h1>

            {/* ROLE BADGE */}
            <div className={`role-badge ${meta.cls}`}>
                {meta.icon}
                <span>{meta.label}</span>
            </div>

            {/* NAV */}
            <nav className="sidebar__nav">
                {links.map(({ to, icon, label }) => {
                    const isActive = path === to || (to !== "/mahasiswa" && to !== "/dosen" && path.startsWith(to));
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

            {/* PROFILE POPUP */}
            {popupOpen && (
                <div className="sidebar__profile-popup" ref={popupRef}>
                    <div className="sidebar__profile-popup-header">
                        <div className="sidebar__avatar sidebar__avatar--lg">{userInitial}</div>
                        <div>
                            <p className="sidebar__profile-name">{userName}</p>
                            <p className="sidebar__profile-role">{userEmail}</p>
                        </div>
                    </div>
                    <div className="sidebar__profile-popup-divider" />
                    <Link
                        to={meta.profileTo}
                        className="sidebar__profile-popup-item"
                        onClick={() => setPopupOpen(false)}
                    >
                        <User size={15} />
                        Lihat Profil
                    </Link>
                    <button
                        className="sidebar__profile-popup-item sidebar__profile-popup-item--danger"
                        onClick={handleLogout}
                    >
                        <LogOut size={15} />
                        Keluar
                    </button>
                </div>
            )}

            {/* PROFILE TRIGGER BUTTON (bottom of sidebar) */}
            <button
                ref={triggerRef}
                className={`sidebar__profile-btn${popupOpen ? " sidebar__profile-btn--active" : ""}`}
                onClick={() => setPopupOpen((v) => !v)}
                title="Profil"
            >
                <div className="sidebar__avatar">{userInitial}</div>
                <div className="sidebar__profile-btn-info">
                    <p className="sidebar__profile-name">{userName}</p>
                    <p className="sidebar__profile-role">{userEmail}</p>
                </div>
                <ChevronUp
                    size={15}
                    className={`sidebar__profile-chevron${popupOpen ? " sidebar__profile-chevron--up" : ""}`}
                />
            </button>

        </div>
    );
}