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

const ROLE_META = {
    mahasiswa: { name: "Mahasiswa", sub: "Mahasiswa", profileTo: "/mahasiswa/profile" },
    dosen: { name: "Dosen", sub: "Dosen", profileTo: "/dosen/profile" },
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
    const [quickAccess, setQuickAccess] = useState([]);

    // Load Quick Access tasks
    useEffect(() => {
        const loadQuickAccess = () => {
            const stored = localStorage.getItem('quickAccessTasks');
            if (stored) setQuickAccess(JSON.parse(stored));
            
            import('../axiosClient').then(({ default: axiosClient }) => {
                axiosClient.get('/me').then(res => {
                    const qa = res.data.user?.quick_access || [];
                    setQuickAccess(qa);
                    localStorage.setItem('quickAccessTasks', JSON.stringify(qa));
                }).catch(() => {});
            });
        };
        loadQuickAccess();
        window.addEventListener('quickAccessUpdated', () => {
            const stored = localStorage.getItem('quickAccessTasks');
            if (stored) setQuickAccess(JSON.parse(stored));
        });
        return () => window.removeEventListener('quickAccessUpdated', () => {});
    }, []);

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

    const handleLogout = async () => {
        try {
            // 1. Hapus FCM token device ini dari backend agar tidak dikirim notif setelah logout
            const { getToken } = await import('firebase/messaging');
            const { messaging } = await import('../firebase');
            if (messaging) {
                const fcmToken = await getToken(messaging, {
                    vapidKey: "BAENz_P3Gjqpv9Pt7ADVwdJeeak6PpdkLuzN9UUepeK8grmXgXoQtoKI9VdjNI3eauzqcZboW4ZJqhppux3zKoM"
                }).catch(() => null);
                if (fcmToken) {
                    await import('../axiosClient').then(({ default: axiosClient }) =>
                        axiosClient.delete('/fcm-token', { data: { fcm_token: fcmToken } })
                    ).catch(() => {});
                }
            }
        } catch (_) {}

        // 2. Clear auth state
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="sidebar" style={{ display: "flex", flexDirection: "column" }}>

            {/* LOGO */}
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#4f46e5", letterSpacing: "-0.8px", margin: "0 0 16px 4px", padding: 0 }}>
                TaskApp
            </h1>

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

            {/* QUICK ACCESS (Mahasiswa Only) */}
            {role === "mahasiswa" && quickAccess.length > 0 && (
                <div style={{ marginTop: 12, padding: "0 12px" }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 12px" }}>Akses Cepat</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {quickAccess.map(t => {
                            const isPersonalTask = t.isPersonal !== undefined ? t.isPersonal : String(t.id).startsWith("personal_");
                            return (
                                <Link key={t.id} to={isPersonalTask ? "/mahasiswa/tasks/mandiri" : "/mahasiswa/tasks/detail"} state={{ taskId: t.id }} style={{ textDecoration: "none", color: "#475569", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {/* FILLER */}
            <div style={{ flex: 1 }} />

            {/* SETTINGS (Mahasiswa Only) */}
            {role === "mahasiswa" && (
                <div style={{ padding: "0 12px", marginBottom: 12 }}>
                    <Link to="/mahasiswa/settings" className={`sidebar__link${path.startsWith("/mahasiswa/settings") ? " sidebar__link--active" : ""}`} style={{ marginBottom: 0 }}>
                        <Settings size={18} />
                        Pengaturan
                    </Link>
                </div>
            )}

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
            <div style={{ marginTop: "auto" }}>
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

        </div>
    );
}