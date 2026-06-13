import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/NotificationBell";
import { Clock3, Users, BookOpen, CheckCircle2, TrendingUp, ChevronRight, BookMarked } from "lucide-react";
import axiosClient from "../../axiosClient";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const STAT_VARIANTS = {
    indigo: { bg: "#eef2ff", text: "#4338ca", border: "#4f46e5", icon: "#4f46e5" },
    green:  { bg: "#ecfdf5", text: "#059669", border: "#10b981", icon: "#10b981" },
    orange: { bg: "#fff7ed", text: "#c2410c", border: "#f97316", icon: "#ea580c" },
    purple: { bg: "#f5f3ff", text: "#6d28d9", border: "#8b5cf6", icon: "#7c3aed" },
};

function StatCard({ icon, iconVariant, label, value }) {
    const vc = STAT_VARIANTS[iconVariant] || STAT_VARIANTS.indigo;
    return (
        <div style={{
            background: "white", borderRadius: 24, padding: "24px",
            border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex", flexDirection: "column", gap: 16, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative", overflow: "hidden"
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = vc.border + "40"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.03)"; e.currentTarget.style.borderColor = "#f1f5f9"; }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: vc.bg, opacity: 0.5, pointerEvents: "none" }} />
            <div style={{ width: 52, height: 52, borderRadius: 16, background: vc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", zIndex: 1 }}>
                {icon}
            </div>
            <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 36, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", lineHeight: 1, letterSpacing: "-1.5px" }}>{value}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
            </div>
        </div>
    );
}

// ─── Task Management Card (for dosen) ─────────────────────────────────────────
function TaskManageCard({ id, title, course, deadline, submitted, total, onClick }) {
    const pct = total ? Math.round((submitted / total) * 100) : 0;
    return (
        <div onClick={onClick} style={{
            background: "white", borderRadius: 20, padding: "24px", border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)", cursor: "pointer", transition: "all 0.2s ease-out",
            display: "flex", flexDirection: "column", gap: "16px", position: "relative", overflow: "hidden"
        }}
             onMouseEnter={e => { e.currentTarget.style.borderColor = "#ea580c"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(234,88,12,0.12)"; e.currentTarget.style.transform = "scale(1.01)"; }}
             onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; e.currentTarget.style.transform = "scale(1)"; }}>

            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: pct === 100 ? "#10b981" : "#ea580c", borderRadius: "20px 0 0 20px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, paddingRight: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {course && <span style={{ padding: "4px 10px", background: "#fff7ed", color: "#ea580c", borderRadius: "8px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>{course}</span>}
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", background: "#f8fafc", padding: "4px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}><Clock3 size={11} style={{ display: "inline", marginBottom: -2 }}/> {deadline}</span>
                    </div>
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0, lineHeight: 1.3, letterSpacing: "-0.3px" }}>{title}</h3>
                </div>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", flexShrink: 0, border: "1px solid #e2e8f0" }}>
                    <BookMarked size={18} />
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: "700" }}>
                    <span style={{ color: "#64748b" }}>Progress Pengumpulan</span>
                    <span style={{ color: pct === 100 ? "#059669" : "#ea580c" }}>{submitted}/{total} ({pct}%)</span>
                </div>
                <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#10b981" : "linear-gradient(90deg, #f97316, #f59e0b)", transition: "width 0.5s ease", borderRadius: "99px" }} />
                </div>
            </div>
        </div>
    );
}

// ─── Dosen Dashboard ─────────────────────────────────────────────────────────
export default function DosenDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_mahasiswa: 0,
        tugas_aktif: 0,
        sudah_dinilai: 0,
        rata_rata_nilai: 0,
    });
    const [tasks, setTasks] = useState([]);
    const [user, setUser] = useState({});

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(u);

        axiosClient.get('/dosen/dashboard-stats')
            .then(({ data }) => setStats(data))
            .catch(err => console.error(err));

        axiosClient.get('/dosen/tasks')
            .then(({ data }) => {
                setTasks(data.filter(t => t.status === 'active').slice(0, 4));
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="app-wrapper">
            <Sidebar role="dosen" />

            <main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px" }}>
                
                {/* TOPBAR */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <span style={{ padding: "4px 12px", background: "#fff7ed", color: "#ea580c", borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>Dosen Dashboard</span>
                        </div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-1px" }}>
                            Halo, {user.name ? user.name.split(" ")[0] : "Dosen"}! 👋
                        </h1>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <NotificationBell />
                    </div>
                </div>

                {/* STAT CARDS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 36 }}>
                    <StatCard icon={<Users size={24} color={STAT_VARIANTS.indigo.icon} />} iconVariant="indigo" label="Mahasiswa" value={stats.total_mahasiswa} />
                    <StatCard icon={<BookOpen size={24} color={STAT_VARIANTS.orange.icon} />} iconVariant="orange" label="Tugas Aktif" value={stats.tugas_aktif} />
                    <StatCard icon={<CheckCircle2 size={24} color={STAT_VARIANTS.green.icon} />} iconVariant="green" label="Tugas Dinilai" value={stats.sudah_dinilai} />
                    <StatCard icon={<TrendingUp size={24} color={STAT_VARIANTS.purple.icon} />} iconVariant="purple" label="Rata-rata Kelas" value={stats.rata_rata_nilai} />
                </div>

                {/* TUGAS AKTIF GRID */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ea580c" }} />
                            Tugas Aktif
                        </h2>
                        <Link to="/dosen/tasks" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#ea580c", textDecoration: "none", padding: "8px 16px", background: "#fff7ed", borderRadius: 12, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#ffedd5"} onMouseLeave={e => e.currentTarget.style.background = "#fff7ed"}>
                            Kelola Semua <ChevronRight size={16} />
                        </Link>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                        {tasks.map(t => (
                            <TaskManageCard
                                key={t.id_task}
                                id={t.id_task}
                                title={t.nama_tugas}
                                course={t.mata_kuliah?.nama_matkul}
                                deadline={`${t.deadline ? t.deadline.substring(0, 10) : ""} ${t.jam || ""}`}
                                submitted={t.submitted_count || 0}
                                total={stats.total_mahasiswa}
                                onClick={() => navigate('/dosen/tasks/detail', { state: { taskId: t.id_task } })}
                            />
                        ))}
                        {tasks.length === 0 && (
                            <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", background: "white", borderRadius: 24, border: "2px dashed #e2e8f0", textAlign: "center" }}>
                                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                                    <BookOpen size={32} color="#94a3b8" />
                                </div>
                                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>Belum Ada Tugas Aktif</h3>
                                <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Anda belum membuat tugas baru atau semua tugas telah ditutup.</p>
                                <Link to="/dosen/tasks" style={{ display: "inline-block", marginTop: "20px", padding: "12px 24px", background: "#ea580c", color: "white", borderRadius: "12px", fontSize: "14px", fontWeight: "800", textDecoration: "none" }}>Buat Tugas Baru</Link>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
