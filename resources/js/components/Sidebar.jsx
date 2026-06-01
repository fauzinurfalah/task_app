import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";

// ─── Navigation links per role ────────────────────────────────────────────────
const NAV_LINKS = {
    mahasiswa: [
        { to: "/mahasiswa",           icon: <LayoutDashboard size={18} />, label: "Dashboard" },
        { to: "/mahasiswa/tasks",     icon: <ClipboardList   size={18} />, label: "Tugas"     },
        { to: "/mahasiswa/calendar",  icon: <CalendarDays    size={18} />, label: "Kalender"  },
        { to: "/profile",             icon: <User            size={18} />, label: "Profil"    },
    ],
    dosen: [
        { to: "/dosen",               icon: <LayoutDashboard size={18} />, label: "Dashboard"    },
        { to: "/dosen/tasks",         icon: <BookOpen        size={18} />, label: "Kelola Tugas" },
        { to: "/dosen/submissions",   icon: <Upload          size={18} />, label: "Pengumpulan"  },
        { to: "/dosen/grading",       icon: <Star            size={18} />, label: "Penilaian"    },
        { to: "/dosen/students",      icon: <Users           size={18} />, label: "Mahasiswa"    },
        { to: "/dosen/calendar",      icon: <CalendarDays    size={18} />, label: "Kalender"     },
        { to: "/dosen/profile",       icon: <User            size={18} />, label: "Profil"       },
    ],
};

// ─── Role badge styling ───────────────────────────────────────────────────────
const ROLE_META = {
    mahasiswa: {
        icon:  <GraduationCap size={14} />,
        label: "Mahasiswa",
        cls:   "role-badge--mahasiswa",
        name:  "Fauzi",
        sub:   "Ilmu Komputer",
        avatar: "F",
    },
    dosen: {
        icon:  <BookOpen size={14} />,
        label: "Dosen",
        cls:   "role-badge--dosen",
        name:  "Dr. Budi",
        sub:   "Teknik Informatika",
        avatar: "B",
    },
};


export default function Sidebar({ role = "mahasiswa" }) {
    const location = useLocation();
    const path     = location.pathname;
    const links    = NAV_LINKS[role] || NAV_LINKS.mahasiswa;
    const meta     = ROLE_META[role]  || ROLE_META.mahasiswa;

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
                    const isActive = path === to || (to !== "/" && path.startsWith(to));
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
                <div className="sidebar__avatar">{meta.avatar}</div>
                <div>
                    <p className="sidebar__profile-name">{meta.name}</p>
                    <p className="sidebar__profile-role">{meta.sub}</p>
                </div>
            </div>

        </div>
    );
}