import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/NotificationBell";
import {
    Plus, Search, Clock3, Users, ChevronRight,
    BookOpen, Layers, QrCode, X, CheckCircle2,
    Target, Edit3
} from "lucide-react";
import axiosClient from "../../axiosClient";

const STATUS_MAP = {
    active: { label: "Aktif",    bg: "#ecfdf5", color: "#059669", border: "#10b981", dot: "#10b981" },
    closed: { label: "Ditutup",  bg: "#fef2f2", color: "#dc2626", border: "#ef4444", dot: "#ef4444" },
    graded: { label: "Dinilai",  bg: "#eef2ff", color: "#4f46e5", border: "#6366f1", dot: "#6366f1" },
};

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onShowQR }) {
    const pct = task.total ? Math.round((task.submitted / task.total) * 100) : 0;
    const s   = STATUS_MAP[task.status] || STATUS_MAP.active;
    
    return (
        <div style={{
            background: "white", borderRadius: 24, padding: "24px",
            border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
            display: "flex", flexDirection: "column", gap: 20, transition: "all 0.2s ease-out",
            position: "relative", overflow: "hidden", cursor: "pointer"
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "#4f46e5"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.02)"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
            
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: s.dot, borderRadius: "24px 0 0 24px" }} />

            {/* Top row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Layers size={22} color="#64748b" />
                    </div>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{task.course}</span>
                            {task.kode && <span style={{ fontSize: 11, fontWeight: 800, background: "#f1f5f9", color: "#0f172a", padding: "2px 8px", borderRadius: 6 }}>KODE: {task.kode}</span>}
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.3px", lineHeight: 1.3 }}>{task.title}</h3>
                    </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, padding: "6px 12px", borderRadius: 12, background: s.bg, color: s.color, border: `1px solid ${s.border}40`, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} /> {s.label}
                </span>
            </div>

            {/* Desc */}
            <p style={{ fontSize: 14, color: "#64748b", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.6 }}>
                {task.desc || "Tidak ada deskripsi."}
            </p>

            {/* Meta */}
            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#475569" }}>
                    <Clock3 size={16} color="#94a3b8" />
                    {task.deadline} • {task.time}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#475569" }}>
                    <Users size={16} color="#94a3b8" />
                    {task.submitted} / {task.total} Mahasiswa
                </div>
            </div>

            {/* Progress */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, fontWeight: 800 }}>
                    <span style={{ color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Progress Pengumpulan</span>
                    <span style={{ color: pct === 100 ? "#059669" : "#4f46e5" }}>{pct}%</span>
                </div>
                <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#10b981" : "linear-gradient(90deg, #4f46e5, #3b82f6)", borderRadius: 99, transition: "width 0.5s ease" }} />
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
                {task.kode && (
                    <button onClick={(e) => { e.stopPropagation(); onShowQR(task); }} style={{ padding: "12px", borderRadius: 14, border: "1px solid #e2e8f0", background: "white", color: "#0f172a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                        <QrCode size={18} />
                    </button>
                )}
                <Link to={`/dosen/tasks/detail?id=${task.id}`} onClick={e => e.stopPropagation()} style={{ flex: 1, padding: "12px 16px", borderRadius: 14, border: "1px solid #e2e8f0", background: "white", color: "#0f172a", fontSize: 13, fontWeight: 800, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                    <Edit3 size={16} /> Edit Detail
                </Link>
                <Link to={`/dosen/submissions?task=${task.id}`} onClick={e => e.stopPropagation()} style={{ flex: 1.5, padding: "12px 16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", color: "white", fontSize: 13, fontWeight: 800, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 4px 12px rgba(79,70,229,0.2)" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    Beri Nilai <ChevronRight size={16} />
                </Link>
            </div>
        </div>
    );
}

export default function DosenManageTask() {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qrModal, setQrModal] = useState({ show: false, task: null });

    useEffect(() => {
        axiosClient.get('/dosen/tasks')
            .then(({ data }) => {
                const mappedTasks = data.map(t => ({
                    id: t.id_task,
                    kode: t.kode_tugas,
                    title: t.nama_tugas,
                    course: t.nama_matkul || "Umum",
                    deadline: t.deadline ? t.deadline.substring(0, 10) : "",
                    time: t.jam,
                    submitted: t.submitted_count || 0,
                    graded: t.graded_count || 0,
                    total: t.total_students || 1,
                    status: t.status || "active",
                    fullyGraded: t.fully_graded || false,
                    desc: t.deskripsi
                }));
                setTasks(mappedTasks);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filtered = tasks.filter(t => {
        const matchStatus =
            filter === "all"    ? true :
            filter === "graded" ? t.fullyGraded :
            t.status === filter;
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                            t.course.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const counts = {
        all:    tasks.length,
        active: tasks.filter(t => t.status === "active").length,
        closed: tasks.filter(t => t.status === "closed").length,
        graded: tasks.filter(t => t.fullyGraded).length,
    };

    return (
        <div className="app-wrapper">
            <Sidebar role="dosen" />
            <main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px" }}>

                {/* TOPBAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <span style={{ padding: "4px 12px", background: "#fff7ed", color: "#ea580c", borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>Manajemen</span>
                        </div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-1px" }}>Kelola Tugas</h1>
                    </div>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <NotificationBell />
                        <Link to="/dosen/tasks/detail" style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 24px", fontSize: 14, cursor: "pointer", border: "none", borderRadius: 16, background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", color: "white", fontWeight: 800, textDecoration: "none", boxShadow: "0 8px 20px rgba(234,88,12,0.25)", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                            <Plus size={18} /> Buat Tugas Baru
                        </Link>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div style={{ display: "flex", gap: 16, marginBottom: 32, alignItems: "center" }}>
                    <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                        <Search size={18} style={{ position: "absolute", left: 16, color: "#94a3b8", pointerEvents: "none" }} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Cari tugas berdasarkan judul atau mata kuliah..."
                            style={{ width: "100%", padding: "14px 16px 14px 46px", border: "1px solid #e2e8f0", borderRadius: 16, fontSize: 15, fontFamily: "inherit", outline: "none", transition: "all .2s", background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}
                            onFocus={e => { e.target.style.borderColor = "#ea580c"; e.target.style.boxShadow = "0 0 0 4px rgba(234,88,12,.1)"; }}
                            onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "0 2px 10px rgba(0,0,0,0.02)"; }}
                        />
                        {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 16, background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", display: "flex", padding: 6, borderRadius: "50%" }}><X size={14} /></button>}
                    </div>

                    <div style={{ display: "flex", gap: 8, background: "white", borderRadius: 16, padding: 8, border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                        {[
                            { key: "all",    label: "Semua Tugas" },
                            { key: "active", label: "Aktif"       },
                            { key: "closed", label: "Ditutup"     },
                            { key: "graded", label: "Dinilai"     },
                        ].map(({ key, label }) => (
                            <button key={key} onClick={() => setFilter(key)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
                                    borderRadius: 12, border: "none",
                                    background: filter === key ? "#0f172a" : "transparent",
                                    fontSize: 13, fontWeight: 700,
                                    color: filter === key ? "white" : "#64748b",
                                    cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
                                }}>
                                {label}
                                <span style={{ background: filter === key ? "rgba(255,255,255,.2)" : "#f1f5f9", color: filter === key ? "white" : "#475569", borderRadius: 8, fontSize: 11, fontWeight: 800, padding: "2px 8px", minWidth: 22, textAlign: "center" }}>{counts[key]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* GRID */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
                    {loading ? (
                        <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 0", color: "#64748b", fontSize: 15, fontWeight: 600 }}>Memuat daftar tugas...</div>
                    ) : filtered.length > 0
                        ? filtered.map(t => <TaskCard key={t.id} task={t} onShowQR={(task) => setQrModal({ show: true, task })} />)
                        : (
                            <div style={{ gridColumn: "1/-1", background: "white", borderRadius: 32, padding: "80px 20px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,.02)", border: "2px dashed #e2e8f0" }}>
                                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                                    <Target size={40} color="#cbd5e1" />
                                </div>
                                <h3 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: "0 0 10px" }}>Tidak Ada Tugas</h3>
                                <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 24px", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>Tidak ada tugas yang sesuai dengan filter atau kata pencarian Anda.</p>
                            </div>
                        )
                    }
                </div>
            </main>

            {/* QR Code Modal */}
            {qrModal.show && qrModal.task && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }} onClick={() => setQrModal({ show: false, task: null })}>
                    <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 32, padding: "40px", maxWidth: 460, width: "100%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,.2)", position: "relative" }}>
                        <button onClick={() => setQrModal({ show: false, task: null })} style={{ position: "absolute", top: 24, right: 24, background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", padding: 10, borderRadius: 14, transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}>
                            <X size={20} />
                        </button>
                        
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                            <QrCode size={32} color="#4f46e5" />
                        </div>
                        
                        <h3 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: "0 0 8px" }}>Scan untuk Gabung</h3>
                        <p style={{ color: '#64748b', fontSize: 14, margin: "0 0 32px", lineHeight: 1.6 }}>Mahasiswa dapat menggunakan scanner di aplikasi untuk memindai QR Code ini.</p>
                        
                        <div style={{ padding: 24, background: 'white', borderRadius: 24, display: 'inline-block', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', border: "1px solid #f1f5f9", marginBottom: 32 }}>
                            <QRCodeSVG value={qrModal.task.kode} size={220} />
                        </div>
                        
                        <div style={{ background: "#f8fafc", padding: "16px", borderRadius: 20, border: "1px solid #e2e8f0" }}>
                            <p style={{ fontSize: 12, fontWeight: 800, color: "#64748b", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "1px" }}>Atau gunakan kode</p>
                            <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: 8, color: '#0f172a', margin: 0 }}>
                                {qrModal.task.kode}
                            </h2>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
