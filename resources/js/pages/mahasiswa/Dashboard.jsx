import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import {
    Clock3, CheckCircle2, BookOpen, TrendingUp,
    ChevronRight, ChevronLeft, ArrowRight, Calendar, Target, LayoutGrid, Award, Sparkles, BookMarked
} from "lucide-react";
import axiosClient from "../../axiosClient";

// ─── Circular Progress ────────────────────────────────────────────────────────
function CircleProgress({ percent = 0 }) {
    const radius = 54;
    const stroke = 12;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;
    return (
        <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0, filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))" }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r={normalizedRadius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
                <circle cx="65" cy="65" r={normalizedRadius} fill="none" stroke="#fff" strokeWidth={stroke}
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 65 65)" style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-1px" }}>{percent}%</span>
            </div>
        </div>
    );
}

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

// ─── Mini Calendar Card ───────────────────────────────────────────────────────
function MiniCalendarCard({ tasks }) {
    const [now, setNow] = useState(new Date());
    const [current, setCurrent] = useState({ year: now.getFullYear(), month: now.getMonth() });
    
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // update every minute
        return () => clearInterval(timer);
    }, []);

    const { year, month } = current;
    const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const DAY_NAMES   = ["MIN","SEN","SEL","RAB","KAM","JUM","SAB"];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInPrev = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, currentMonth: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, currentMonth: true });
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) cells.push({ day: d, currentMonth: false });

    const prevMonth = () => setCurrent(c => ({ year: c.month === 0 ? c.year - 1 : c.year, month: c.month === 0 ? 11 : c.month - 1 }));
    const nextMonth = () => setCurrent(c => ({ year: c.month === 11 ? c.year + 1 : c.year, month: c.month === 11 ? 0 : c.month + 1 }));

    const eventMap = {};
    if (tasks) {
        tasks.forEach(t => {
            if (!t.task?.deadline) return;
            const y = parseInt(t.task.deadline.substring(0,4));
            const m = parseInt(t.task.deadline.substring(5,7)) - 1;
            const d = parseInt(t.task.deadline.substring(8,10));
            if (y === year && m === month) {
                if (!eventMap[d]) eventMap[d] = [];
                eventMap[d].push(t);
            }
        });
    }

    return (
        <div style={{ background: "white", borderRadius: 24, padding: "28px", border: "1px solid #f1f5f9", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <button onClick={prevMonth} style={{ width: 36, height: 36, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#8b5cf6"; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "#8b5cf6"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                    <ChevronLeft size={16} />
                </button>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", margin: 0 }}>
                    {MONTH_NAMES[month]} <span style={{ color: "#8b5cf6" }}>{year}</span>
                </h2>
                <button onClick={nextMonth} style={{ width: 36, height: 36, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#8b5cf6"; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "#8b5cf6"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                    <ChevronRight size={16} />
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 12 }}>
                {DAY_NAMES.map(d => (
                    <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>{d}</div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                {cells.map((cell, idx) => {
                    const isToday = cell.currentMonth && cell.day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                    const hasEvent = cell.currentMonth && eventMap[cell.day];
                    const isWeekend = idx % 7 === 0 || idx % 7 === 6;
                    
                    return (
                        <div key={idx} style={{ aspectRatio: "1/1.1", borderRadius: 12, background: isToday ? "#8b5cf6" : cell.currentMonth ? (isWeekend ? "#fafafa" : "white") : "#f8fafc", border: isToday ? "none" : cell.currentMonth ? "1px solid #e2e8f0" : "1px dashed #cbd5e1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", opacity: cell.currentMonth ? 1 : 0.5, boxShadow: isToday ? "0 4px 12px rgba(139,92,246,.3)" : "none", transition: "transform 0.2s", cursor: "default" }} onMouseEnter={e => cell.currentMonth && (e.currentTarget.style.transform = "translateY(-2px)")} onMouseLeave={e => cell.currentMonth && (e.currentTarget.style.transform = "translateY(0)")}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: isToday ? "white" : cell.currentMonth ? (isWeekend ? "#dc2626" : "#0f172a") : "#94a3b8" }}>
                                {cell.day}
                            </span>
                            {hasEvent && <div style={{ width: 4, height: 4, borderRadius: "50%", background: isToday ? "white" : "#8b5cf6", position: "absolute", bottom: 6 }} />}
                        </div>
                    );
                })}
            </div>
        </div>
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

    const percent = stats.total_tugas > 0 ? Math.round((stats.tugas_selesai / stats.total_tugas) * 100) : 0;
    const upcoming = [...tasks].sort((a, b) => new Date(a.task?.deadline) - new Date(b.task?.deadline)).slice(0, 4);
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

                {/* HERO CARD */}
                <div style={{
                    position: "relative", overflow: "hidden", borderRadius: 32, padding: "40px",
                    background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40,
                    boxShadow: "0 20px 40px rgba(79,70,229,0.2)", marginBottom: 36, color: "white"
                }}>
                    {/* Decorative Background Elements */}
                    <div style={{ position: "absolute", top: -50, right: -50, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)" }} />
                    <div style={{ position: "absolute", bottom: -100, left: 100, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)" }} />
                    
                    <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", background: "rgba(255,255,255,0.15)", borderRadius: 20, backdropFilter: "blur(10px)", fontSize: 13, fontWeight: 700, marginBottom: 20, border: "1px solid rgba(255,255,255,0.2)" }}>
                            <Sparkles size={14} /> Progress Kuliah
                        </div>
                        <h2 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 16px", letterSpacing: "-1px", lineHeight: 1.2 }}>
                            {percent >= 100 ? "Luar Biasa! 🎉" : percent >= 80 ? "Sedikit Lagi! 🚀" : percent >= 50 ? "Terus Semangat! 💪" : "Ayo Mulai Kerjakan! 🔥"}
                        </h2>
                        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", margin: "0 0 28px", lineHeight: 1.6, maxWidth: 500, fontWeight: 500 }}>
                            Kamu telah menyelesaikan <strong>{stats.tugas_selesai}</strong> dari <strong>{stats.total_tugas}</strong> tugas sejauh ini. {stats.tugas_aktif > 0 ? `Masih ada ${stats.tugas_aktif} tugas menunggu!` : "Semua tugas beres!"}
                        </p>
                        <Link to="/mahasiswa/tasks" style={{
                            display: "inline-flex", alignItems: "center", gap: 10,
                            background: "white", color: "#4f46e5", borderRadius: 16,
                            padding: "14px 28px", fontSize: 15, fontWeight: 800,
                            textDecoration: "none", transition: "all 0.2s",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
                        }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                            Mulai Kerjakan Tugas <ArrowRight size={18} />
                        </Link>
                    </div>
                    
                    <div style={{ position: "relative", zIndex: 1, background: "rgba(255,255,255,0.1)", padding: 24, borderRadius: "50%", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                        <CircleProgress percent={percent} />
                    </div>
                </div>

                {/* STAT CARDS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 36 }}>
                    <StatCard icon={<Target size={24} color={STAT_VARIANTS.indigo.icon} />} iconVariant="indigo" label="Tugas Aktif"   value={stats.tugas_aktif} />
                    <StatCard icon={<CheckCircle2 size={24} color={STAT_VARIANTS.green.icon} />} iconVariant="green"  label="Tugas Selesai"      value={stats.tugas_selesai} />
                    <StatCard icon={<Award size={24} color={STAT_VARIANTS.orange.icon} />} iconVariant="orange" label="Nilai Rata-rata"   value={stats.rata_nilai || "0"} />
                    <StatCard icon={<LayoutGrid size={24} color={STAT_VARIANTS.purple.icon} />} iconVariant="purple" label="Total Tugas"  value={stats.total_tugas} />
                </div>

                {/* MAIN CONTENT SPLIT */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>

                    {/* LEFT: Task List */}
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
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {recentTasks.length > 0
                                ? recentTasks.map((t, i) => <TaskRow key={t.task?.id_task || i} task={t} />)
                                : (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", background: "white", borderRadius: 24, border: "2px dashed #e2e8f0", textAlign: "center" }}>
                                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                                            <CheckCircle2 size={32} color="#94a3b8" />
                                        </div>
                                        <p style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Bersih! Tidak ada tugas.</p>
                                        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Semua tugas sudah selesai atau belum ada tugas baru yang diberikan.</p>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* RIGHT: Sidebar Panels */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        
                        {/* Mini Calendar Card */}
                        <MiniCalendarCard tasks={tasks} />

                        {/* Deadline Mendatang */}
                        <div style={{ background: "white", borderRadius: 24, padding: 28, border: "1px solid #f1f5f9", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                                    <Clock3 size={18} color="#f59e0b" /> Deadline Terdekat
                                </h3>
                            </div>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {upcoming.length > 0 ? upcoming.map((t, i) => {
                                    const d = new Date(t.task?.deadline);
                                    const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];
                                    return (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px", background: "#f8fafc", borderRadius: 16, border: "1px solid #f1f5f9", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}>
                                            <div style={{ width: 50, height: 50, borderRadius: 14, background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                                                <span style={{ fontSize: 10, fontWeight: 800, color: "#ef4444", textTransform: "uppercase" }}>{monthNames[d.getMonth()]}</span>
                                                <span style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{d.getDate()}</span>
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {t.task?.nama_tugas}
                                                </p>
                                                <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: 0 }}>Jam {t.task?.jam || "23:59"}</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div style={{ padding: "30px 20px", textAlign: "center", background: "#f8fafc", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", margin: 0 }}>Hore! Tidak ada deadline mendesak.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}
