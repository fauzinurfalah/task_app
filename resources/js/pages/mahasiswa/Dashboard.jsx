import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import {
    Clock3, CheckCircle2, BookOpen, TrendingUp,
    ChevronRight, ChevronLeft, Calendar, Target, LayoutGrid, Award, BookMarked
} from "lucide-react";
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

// ─── Task Row ─────────────────────────────────────────────────────────────────
function TaskRow({ task }) {
    const deadline = task.task?.deadline ? new Date(task.task.deadline) : null;
    const now = new Date();
    const daysLeft = deadline ? Math.ceil((deadline - now) / 86400000) : null;
    const isUrgent = daysLeft !== null && daysLeft <= 2 && daysLeft >= 0;
    const isPast   = daysLeft !== null && daysLeft < 0;

    return (
        <Link to="/mahasiswa/tasks/detail" state={{ taskId: task.task?.id_task }} style={{ textDecoration: "none" }}>
            <div style={{
                display: "flex", alignItems: "center", gap: 16, padding: "18px 20px",
                background: "white", borderRadius: 20, border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)", transition: "all 0.2s ease-out", cursor: "pointer",
                position: "relative", overflow: "hidden"
            }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(79,70,229,0.12)"; e.currentTarget.style.transform = "scale(1.01)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; e.currentTarget.style.transform = "scale(1)"; }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: isPast ? "#ef4444" : isUrgent ? "#f59e0b" : "#4f46e5", borderRadius: "20px 0 0 20px" }} />
                
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #e2e8f0" }}>
                    <BookMarked size={20} color="#64748b" />
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.2px" }}>
                        {task.task?.nama_tugas}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#cbd5e1" }}></span>
                        {task.task?.nama_matkul || "Umum"}
                    </p>
                </div>
                
                <div style={{ flexShrink: 0, textAlign: "right", display: "flex", alignItems: "center", gap: 12 }}>
                    {isPast ? (
                        <span style={{ fontSize: 11, fontWeight: 800, background: "#fef2f2", color: "#dc2626", padding: "6px 12px", borderRadius: 12, border: "1px solid #fecaca" }}>Terlambat</span>
                    ) : isUrgent ? (
                        <span style={{ fontSize: 11, fontWeight: 800, background: "#fff7ed", color: "#ea580c", padding: "6px 12px", borderRadius: 12, border: "1px solid #fed7aa" }}>⚡ {daysLeft} Hari</span>
                    ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, background: "#f8fafc", color: "#64748b", padding: "6px 12px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                            {daysLeft !== null ? `${daysLeft} Hari` : "-"}
                        </span>
                    )}
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                        <ChevronRight size={16} />
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function MahasiswaDashboard() {
    const [user, setUser]   = useState({});
    const [stats, setStats] = useState({ tugas_selesai: 0, tugas_aktif: 0, total_tugas: 0, rata_nilai: 0 });
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(u);
        axiosClient.get("/mahasiswa/dashboard-stats").then(({ data }) => setStats(data)).catch(console.error);
        axiosClient.get("/mahasiswa/tasks").then(({ data }) => setTasks(Array.isArray(data) ? data : [])).catch(console.error);
    }, []);

    const recentTasks = tasks.slice(0, 5);

    return (
        <div className="app-wrapper">
            <Sidebar role="mahasiswa" />
            <main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px" }}>

                {/* TOPBAR */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <span style={{ padding: "4px 12px", background: "#eef2ff", color: "#4f46e5", borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>Mahasiswa Dashboard</span>
                        </div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-1px" }}>
                            Halo, {user.name ? user.name.split(" ")[0] : "Mahasiswa"}! 👋
                        </h1>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <Link to="/mahasiswa/calendar" style={{ width: 44, height: 44, borderRadius: 14, background: "white", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.color = "#4f46e5"; e.currentTarget.style.borderColor = "#4f46e5"; }} onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                            <Calendar size={20} />
                        </Link>
                    </div>
                </div>

                {/* STAT CARDS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 36 }}>
                    <StatCard icon={<Target size={24} color={STAT_VARIANTS.indigo.icon} />} iconVariant="indigo" label="Tugas Aktif"   value={stats.tugas_aktif} />
                    <StatCard icon={<CheckCircle2 size={24} color={STAT_VARIANTS.green.icon} />} iconVariant="green"  label="Tugas Selesai"      value={stats.tugas_selesai} />
                    <StatCard icon={<Award size={24} color={STAT_VARIANTS.orange.icon} />} iconVariant="orange" label="Nilai Rata-rata"   value={stats.rata_nilai || "0"} />
                    <StatCard icon={<LayoutGrid size={24} color={STAT_VARIANTS.purple.icon} />} iconVariant="purple" label="Total Tugas"  value={stats.total_tugas} />
                </div>

                {/* MAIN CONTENT: Task List */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#4f46e5" }} />
                            Tugas Terbaru
                        </h2>
                        <Link to="/mahasiswa/tasks" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#4f46e5", textDecoration: "none", padding: "8px 16px", background: "#eef2ff", borderRadius: 12, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#e0e7ff"} onMouseLeave={e => e.currentTarget.style.background = "#eef2ff"}>
                            Lihat Semua <ChevronRight size={16} />
                        </Link>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
                        {recentTasks.length > 0
                            ? recentTasks.map((t, i) => <TaskRow key={t.task?.id_task || i} task={t} />)
                            : (
                                <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", background: "white", borderRadius: 24, border: "2px dashed #e2e8f0", textAlign: "center" }}>
                                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                                        <CheckCircle2 size={32} color="#94a3b8" />
                                    </div>
                                    <p style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Bersih! Tidak ada tugas.</p>
                                    <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Semua tugas sudah selesai atau belum ada tugas baru yang diberikan.</p>
                                </div>
                            )}
                    </div>
                </div>

            </main>
        </div>
    );
}
