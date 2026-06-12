import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import Sidebar from "../../components/Sidebar";
import {
    Search, Plus, SlidersHorizontal, ChevronDown, X,
    AlertTriangle, BookOpen, Users, Clock, CheckCircle2,
    Circle, MoreHorizontal, Flame, Calendar, Tag, QrCode,
    ArrowUpRight, Trash2, Edit3, Target, Zap, TrendingUp, BookMarked
} from "lucide-react";
import axiosClient from "../../axiosClient";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TYPE_CFG = {
    exam: { icon: AlertTriangle, bg: "#fee2e2", color: "#dc2626", label: "EXAM" },
    assignment: { icon: BookOpen, bg: "#eef2ff", color: "#4f46e5", label: "ASSIGNMENT" },
    meeting: { icon: Users, bg: "#f0fdf4", color: "#059669", label: "MEETING" },
    personal: { icon: Target, bg: "#f5f3ff", color: "#7c3aed", label: "MANDIRI" },
};

const PRI_CFG = {
    urgent: { bg: "#fef2f2", color: "#dc2626", dot: "#dc2626", label: "Urgent", rank: 0 },
    high:   { bg: "#fff7ed", color: "#ea580c", dot: "#ea580c", label: "High",   rank: 1 },
    medium: { bg: "#fefce8", color: "#ca8a04", dot: "#ca8a04", label: "Medium", rank: 2 },
    low:    { bg: "#f0fdf4", color: "#059669", dot: "#10b981", label: "Low",    rank: 3 },
};

const LS_KEY = "mahasiswa_personal_tasks";

function daysLeft(due, time) {
    const d = new Date(`${due}T${time}`);
    const now = new Date();
    if (d < now) return -1;
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.round((dueDate - todayDate) / 86400000);
}
function fmtDate(s) {
    return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Personal Task Modal ──────────────────────────────────────────────────────
function PersonalTaskModal({ onClose, onAdd, editTask }) {
    const [f, setF] = useState(editTask || {
        title: "", course: "", type: "personal", priority: "medium",
        due: "", dueTime: "23:59", description: "",
    });
    const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
    const inp = {
        width: "100%", padding: "12px 16px", border: "1.5px solid #e2e8f0",
        borderRadius: 16, fontSize: 14, fontFamily: "inherit", outline: "none",
        boxSizing: "border-box", background: "#f8fafc", transition: "all 0.2s"
    };
    const focus = e => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 4px rgba(124,58,237,.1)"; e.target.style.background = "#fff"; };
    const blur  = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; };

    const priorities = [
        { v: "urgent", l: "🔴 Urgent", desc: "Sangat mendesak" },
        { v: "high",   l: "🟠 High",   desc: "Penting" },
        { v: "medium", l: "🟡 Medium", desc: "Sedang" },
        { v: "low",    l: "🟢 Low",    desc: "Santai" },
    ];

    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 32, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.2)", display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "sticky", top: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", zIndex: 10 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Target size={20} color="#7c3aed" />
                            </div>
                            <h3 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                                {editTask ? "Edit Tugas Mandiri" : "Buat Tugas Mandiri"}
                            </h3>
                        </div>
                        <p style={{ fontSize: 14, color: "#64748b", margin: 0, paddingLeft: 52 }}>Kelola dan jadwalkan tugas pribadimu.</p>
                    </div>
                    <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", padding: 8, borderRadius: 12, transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Nama Tugas */}
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Nama Tugas <span style={{ color: "#ef4444" }}>*</span></label>
                        <input type="text" value={f.title} onChange={s("title")} placeholder="Contoh: Belajar React Hooks" style={inp} onFocus={focus} onBlur={blur} />
                    </div>
                    {/* Mata Kuliah */}
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Kategori / Mata Kuliah</label>
                        <input type="text" value={f.course} onChange={s("course")} placeholder="Contoh: Proyek Pribadi" style={inp} onFocus={focus} onBlur={blur} />
                    </div>
                    {/* Deskripsi */}
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Catatan Tambahan</label>
                        <textarea value={f.description} onChange={s("description")} placeholder="Tuliskan rincian apa saja yang perlu diselesaikan..." rows={3}
                            style={{ ...inp, resize: "vertical" }} onFocus={focus} onBlur={blur} />
                    </div>
                    {/* Deadline */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Tenggat Waktu <span style={{ color: "#ef4444" }}>*</span></label>
                            <input type="date" value={f.due} onChange={s("due")} style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Jam Target</label>
                            <input type="time" value={f.dueTime} onChange={s("dueTime")} style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                    </div>
                    {/* Priority */}
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", display: "block", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Tingkat Prioritas</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {priorities.map(p => (
                                <button key={p.v} onClick={() => setF(prev => ({ ...prev, priority: p.v }))}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                                        borderRadius: 16, border: `1.5px solid ${f.priority === p.v ? PRI_CFG[p.v].dot : "#e2e8f0"}`,
                                        background: f.priority === p.v ? PRI_CFG[p.v].bg : "#f8fafc",
                                        cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .2s",
                                    }}>
                                    <span style={{ fontSize: 16 }}>{p.l.split(" ")[0]}</span>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 800, color: f.priority === p.v ? PRI_CFG[p.v].color : "#0f172a", margin: 0 }}>{p.l.split(" ")[1]}</p>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", margin: 0 }}>{p.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: "24px 32px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 12, position: "sticky", bottom: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "14px 20px", borderRadius: 16, border: "1.5px solid #e2e8f0", background: "white", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", color: "#475569", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                        Batal
                    </button>
                    <button onClick={() => {
                        if (!f.title.trim() || !f.due) return;
                        onAdd({ ...f, id: editTask?.id || `personal_${Date.now()}`, status: "pending", progress: 0, tags: [], isPersonal: true });
                        onClose();
                    }} style={{ flex: 2, padding: "14px 20px", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 20px rgba(124,58,237,.25)", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                        {editTask ? "Simpan Perubahan" : "Buat Tugas Mandiri"}
                    </button>
                </div>
            </div>
        </div>
    );
}


// ─── Join Task Modal ───────────────────────────────────────────────────────────
function JoinTaskModal({ onClose, onJoin }) {
    const [kode, setKode] = useState("");
    const [error, setError] = useState("");

    const handleJoin = (code) => {
        if (!code) return;
        axiosClient.post('/mahasiswa/tasks/join', { kode_tugas: code })
            .then(res => {
                onJoin(res.data.task);
                onClose();
            })
            .catch(err => {
                setError(err.response?.data?.message || "Gagal bergabung dengan tugas");
            });
    };

    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 32, width: "100%", maxWidth: 420, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,.2)", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <QrCode size={20} color="#4f46e5" />
                        </div>
                        <h3 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>Gabung Tugas</h3>
                    </div>
                    <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", padding: 8, borderRadius: 12, transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}>
                        <X size={20} />
                    </button>
                </div>
                <div style={{ padding: "32px" }}>
                    <div style={{ marginBottom: 24, borderRadius: 24, overflow: 'hidden', border: '2px solid #e2e8f0', background: '#000', boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                        <Scanner onScan={(result) => { if(result && result.length > 0) handleJoin(result[0].rawValue); }} />
                    </div>
                    {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: "12px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><AlertTriangle size={16} /> {error}</div>}
                    
                    <div style={{ position: "relative", marginBottom: 24 }}>
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
                            <div style={{ width: "100%", borderTop: "1.5px dashed #e2e8f0" }}></div>
                        </div>
                        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                            <span style={{ background: "white", padding: "0 12px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Atau Input Manual</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: "column", gap: 12 }}>
                        <input value={kode} onChange={e => setKode(e.target.value.toUpperCase())} placeholder="Masukkan Kode (cth: ABCDEF)" style={{ width: "100%", padding: "16px 20px", border: "2px solid #e2e8f0", borderRadius: 16, fontSize: 15, fontWeight: 700, textTransform: "uppercase", textAlign: "center", outline: "none", transition: "all 0.2s" }} onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 4px rgba(79,70,229,0.1)"; }} onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
                        <button onClick={() => handleJoin(kode)} style={{ padding: "16px", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 8px 20px rgba(79,70,229,0.25)" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>GABUNG SEKARANG</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onToggle, onDelete, onClick, onEdit }) {
    const tc = TYPE_CFG[task.isPersonal ? "personal" : (task.type || "assignment")] || TYPE_CFG.assignment;
    const pc = task.isPersonal ? (PRI_CFG[task.priority] || PRI_CFG.medium) : null;
    const dl = daysLeft(task.due, task.dueTime);
    const done = task.status === "completed";
    const overdue = dl < 0 && !done;
    const urgent = dl === 0 && !done;
    const [menuOpen, setMenu] = useState(false);

    return (
        <div style={{
            background: "white", borderRadius: 24, padding: "20px 24px",
            display: "flex", alignItems: "center", gap: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
            border: `1px solid ${overdue ? "#fecaca" : urgent ? "#fed7aa" : "#e2e8f0"}`,
            cursor: "pointer", transition: "all 0.2s ease-out",
            opacity: done ? 0.7 : 1, position: "relative", overflow: "visible",
            zIndex: menuOpen ? 50 : 1,
        }}
            onClick={() => onClick(task)}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.06)`; e.currentTarget.style.borderColor = overdue ? "#fca5a5" : "#4f46e5"; e.currentTarget.style.zIndex = menuOpen ? 50 : 10; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.02)"; e.currentTarget.style.borderColor = overdue ? "#fecaca" : "#e2e8f0"; e.currentTarget.style.zIndex = menuOpen ? 50 : 1; }}
        >
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: done ? "#10b981" : overdue ? "#ef4444" : urgent ? "#f59e0b" : "#4f46e5", borderRadius: "24px 0 0 24px" }} />

            {/* Checkbox */}
            <div onClick={e => { e.stopPropagation(); onToggle(task.id); }}
                style={{ flexShrink: 0, cursor: "pointer", transition: "transform .2s cubic-bezier(0.4, 0, 0.2, 1)", paddingLeft: 8 }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                onMouseLeave={e => e.currentTarget.style.transform = ""}>
                {done
                    ? <CheckCircle2 size={26} color="#10b981" fill="#ecfdf5" />
                    : <Circle size={26} color="#cbd5e1" strokeWidth={1.5} />}
            </div>

            {/* Body */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Title */}
                <h3 style={{ fontSize: 16, fontWeight: 900, color: done ? "#64748b" : "#0f172a", margin: "0 0 6px", textDecoration: done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.2px" }}>{task.title}</h3>
                
                {/* Meta details */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#64748b", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#cbd5e1" }}></span>
                        {task.course} {task.courseCode !== "-" ? `· ${task.courseCode}` : ""}
                    </p>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 800, background: tc.bg, color: tc.color, letterSpacing: "0.5px" }}>
                            {tc.label}
                        </span>
                        {pc && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 800, background: pc.bg, color: pc.color, letterSpacing: "0.5px" }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: pc.dot }} />{pc.label}
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer details */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Calendar size={14} color="#64748b" />{fmtDate(task.due)}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={14} color="#64748b" />{task.dueTime}</span>
                    </div>
                    
                    <span style={{
                        fontSize: 12, fontWeight: 800, padding: "6px 14px", borderRadius: 12,
                        background: done ? "#ecfdf5" : overdue ? "#fef2f2" : urgent ? "#fff7ed" : "#f8fafc",
                        color: done ? "#059669" : overdue ? "#dc2626" : urgent ? "#ea580c" : "#64748b",
                        border: `1px solid ${done ? "#a7f3d0" : overdue ? "#fecaca" : urgent ? "#fed7aa" : "#e2e8f0"}`
                    }}>
                        {done ? "Selesai Tepat Waktu" : overdue ? "⚠ Terlambat" : urgent ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Flame size={12} /> Hari ini!</span> : `${dl} Hari Lagi`}
                    </span>
                </div>
            </div>

            {/* Actions Menu */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0, position: "relative" }}>
                <button onClick={e => { e.stopPropagation(); setMenu(v => !v); }}
                    style={{ background: "white", border: "1px solid #e2e8f0", cursor: "pointer", color: "#64748b", padding: "8px", borderRadius: 12, transition: "all .2s", display: "flex", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#0f172a"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
                    <MoreHorizontal size={20} />
                </button>

                {menuOpen && (
                    <div onClick={e => e.stopPropagation()} style={{ position: "absolute", right: 0, top: 44, background: "white", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,.15)", border: "1px solid #e2e8f0", zIndex: 100, overflow: "hidden", minWidth: 160 }}>
                        <button onClick={() => { onToggle(task.id); setMenu(false); }}
                            style={{ width: "100%", padding: "12px 16px", border: "none", background: "none", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#334155", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}>
                            <CheckCircle2 size={16} color="#10b981" />
                            {task.status === "completed" ? "Tandai Belum" : "Tandai Selesai"}
                        </button>
                        <button onClick={() => { onClick(task); setMenu(false); }}
                            style={{ width: "100%", padding: "12px 16px", border: "none", background: "none", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#334155", cursor: "pointer", display: task.isPersonal ? "none" : "flex", alignItems: "center", gap: 10, fontFamily: "inherit" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}>
                            <BookOpen size={16} color="#4f46e5" /> Lihat Detail
                        </button>
                        {onEdit && (
                            <button onClick={e => { e.stopPropagation(); onEdit(task); setMenu(false); }}
                                style={{ width: "100%", padding: "12px 16px", border: "none", background: "none", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#7c3aed", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                <Edit3 size={16} color="#7c3aed" /> Edit Mandiri
                            </button>
                        )}
                        <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                        <button onClick={() => { onDelete(task.id); setMenu(false); }}
                            style={{ width: "100%", padding: "12px 16px", border: "none", background: "none", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}>
                            <Trash2 size={16} /> Hapus Permanen
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Tasks() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [personalTasks, setPersonalTasks] = useState(() => {
        try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("all");
    const [showFilter, setShowFilter] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [showPersonal, setShowPersonal] = useState(false);
    const [editPersonal, setEditPersonal] = useState(null);
    const [fType, setFType] = useState("all");
    const [sort, setSort] = useState("due");

    // Sync personal tasks to localStorage
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(personalTasks));
    }, [personalTasks]);

    useEffect(() => {
        axiosClient.get('/mahasiswa/tasks')
            .then(({ data }) => {
                const mapped = data.map(item => ({
                    id: item.task.id_task,
                    submissionId: item.submission?.id || null,
                    title: item.task.nama_tugas || "-",
                    course: item.task.nama_matkul || "Umum",
                    courseCode: item.task.kode_tugas || "-",
                    type: "assignment",
                    isPersonal: false,
                    status: item.status === "submitted" ? "completed" :
                            item.status === "late" ? "completed" :
                            item.status === "in_progress" ? "in_progress" : "pending",
                    due: item.task.deadline ? item.task.deadline.substring(0, 10) : "",
                    dueTime: item.task.jam || "23:59",
                    progress: item.status === "submitted" || item.status === "late" ? 100 : 0,
                    tags: [],
                    description: item.task.deskripsi || "",
                }));
                setTasks(mapped);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Merge API tasks + personal tasks
    const allTasks = useMemo(() => [
        ...tasks,
        ...personalTasks.map(t => ({ ...t, isPersonal: true })),
    ], [tasks, personalTasks]);

    function savePersonalTask(task) {
        setPersonalTasks(prev => {
            const exists = prev.find(t => t.id === task.id);
            if (exists) return prev.map(t => t.id === task.id ? task : t);
            return [task, ...prev];
        });
    }
    function deletePersonalTask(id) {
        setPersonalTasks(prev => prev.filter(t => t.id !== id));
    }
    function togglePersonalTask(id) {
        setPersonalTasks(prev => prev.map(t =>
            t.id === id ? { ...t, status: t.status === "completed" ? "pending" : "completed", progress: t.status === "completed" ? 0 : 100 } : t
        ));
    }


    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task && task.status !== "completed") {
            alert("Harap buka Detail Tugas dan unggah dokumen (Upload Tugas) untuk menyelesaikan tugas ini.");
            return;
        }
    }
    function deleteTask(id) { setTasks(ts => ts.filter(t => t.id !== id)); }

    const filtered = useMemo(() => {
        return allTasks
            .filter(t => {
                const q = search.toLowerCase();
                const mQ = !q || t.title.toLowerCase().includes(q) || t.course.toLowerCase().includes(q);
                const mS = tab === "all" ? true
                         : tab === "mandiri" ? t.isPersonal
                         : !t.isPersonal && t.status === tab;
                const mT = fType === "all" || (t.isPersonal ? t.type === fType : t.type === fType);
                return mQ && mS && mT;
            })
            .sort((a, b) => {
                if (sort === "due") return new Date(a.due) - new Date(b.due);
                return a.title.localeCompare(b.title);
            });
    }, [allTasks, search, tab, fType, sort]);

    const total    = allTasks.length;
    const done     = allTasks.filter(t => t.status === "completed").length;
    const inProg   = allTasks.filter(t => t.status === "in_progress").length;
    const pending  = allTasks.filter(t => t.status === "pending").length;
    const mandiri  = personalTasks.length;
    const activeFilters = [fType].filter(f => f !== "all").length;

    const TABS = [
        { key: "all",        label: "Semua Tugas",      count: total },
        { key: "in_progress",label: "Sedang Dikerjakan",count: inProg },
        { key: "pending",    label: "Belum Mulai",      count: pending },
        { key: "completed",  label: "Selesai",          count: done },
        { key: "mandiri",    label: "Tugas Mandiri",    count: mandiri, color: "#8b5cf6", bg: "#f5f3ff" },
    ];


    return (
        <div className="app-wrapper">
            {showPersonal && <PersonalTaskModal
                onClose={() => { setShowPersonal(false); setEditPersonal(null); }}
                onAdd={savePersonalTask}
                editTask={editPersonal}
            />}
            {showJoin && <JoinTaskModal onClose={() => setShowJoin(false)} onJoin={t => { setTasks(ts => [...ts, { ...t, isPersonal: false }]); }} />}
            <Sidebar />
            <main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px" }}>
                
                {/* ── TOPBAR ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <span style={{ padding: "4px 12px", background: "#eef2ff", color: "#4f46e5", borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>Manajemen Tugas</span>
                        </div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-1px" }}>Daftar Tugas</h1>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                        <button onClick={() => setShowPersonal(true)}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", fontSize: 14, cursor: "pointer", border: "none", borderRadius: 16, background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", color: "white", fontWeight: 800, boxShadow: "0 8px 20px rgba(124,58,237,.25)", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                            <Plus size={18} /> Tugas Mandiri
                        </button>
                        <button onClick={() => setShowJoin(true)}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", fontSize: 14, cursor: "pointer", border: "1.5px solid #e2e8f0", borderRadius: 16, background: "white", color: "#0f172a", fontWeight: 800, boxShadow: "0 4px 12px rgba(0,0,0,.02)", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#cbd5e1"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                            <QrCode size={18} color="#4f46e5" /> Gabung Tugas
                        </button>
                    </div>
                </div>

                {/* ── STATS ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, marginBottom: 36 }}>
                    {[
                        { label: "Total Semua Tugas", val: total, color: "#0f172a", bg: "#f1f5f9", icon: Target, border: "#e2e8f0" },
                        { label: "Sedang Dikerjakan", val: inProg, color: "#4f46e5", bg: "#eef2ff", icon: Zap, border: "#c7d2fe" },
                        { label: "Belum Mulai", val: pending, color: "#ea580c", bg: "#fff7ed", icon: Clock, border: "#fed7aa" },
                        { label: "Tugas Selesai", val: done, color: "#059669", bg: "#ecfdf5", icon: CheckCircle2, border: "#a7f3d0" },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} style={{ background: "white", borderRadius: 24, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20, boxShadow: "0 4px 20px rgba(0,0,0,.03)", border: "1px solid #f1f5f9" }}>
                                <div style={{ width: 56, height: 56, borderRadius: 16, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon size={24} color={s.color} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 32, fontWeight: 900, color: s.color, margin: "0 0 4px", lineHeight: 1, letterSpacing: "-1px" }}>{s.val}</p>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── TOOLBAR ── */}
                <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "center" }}>
                    {/* Search */}
                    <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                        <Search size={18} style={{ position: "absolute", left: 16, color: "#94a3b8", pointerEvents: "none" }} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Cari tugas atau mata kuliah…"
                            style={{ width: "100%", padding: "14px 16px 14px 46px", border: "1px solid #e2e8f0", borderRadius: 16, fontSize: 15, fontFamily: "inherit", outline: "none", transition: "all .2s", background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}
                            onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 4px rgba(79,70,229,.1)"; }}
                            onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "0 2px 10px rgba(0,0,0,0.02)"; }}
                        />
                        {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 16, background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", display: "flex", padding: 6, borderRadius: "50%" }}><X size={14} /></button>}
                    </div>
                    {/* Filter */}
                    <button onClick={() => setShowFilter(v => !v)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: showFilter ? "#4f46e5" : "white", border: `1px solid ${showFilter ? "#4f46e5" : "#e2e8f0"}`, borderRadius: 16, fontSize: 14, fontWeight: 700, color: showFilter ? "white" : "#0f172a", cursor: "pointer", fontFamily: "inherit", transition: "all .2s", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                        <SlidersHorizontal size={18} />
                        Filter
                        {activeFilters > 0 && <span style={{ background: showFilter ? "white" : "#4f46e5", color: showFilter ? "#4f46e5" : "white", borderRadius: "50%", fontSize: 11, fontWeight: 800, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{activeFilters}</span>}
                    </button>
                    {/* Sort */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: "12px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", position: "relative" }}>
                        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 700, whiteSpace: "nowrap" }}>Urutkan:</span>
                        <select value={sort} onChange={e => setSort(e.target.value)}
                            style={{ background: "none", border: "none", fontSize: 14, fontWeight: 800, color: "#0f172a", cursor: "pointer", fontFamily: "inherit", outline: "none", appearance: "none", paddingRight: 24 }}>
                            <option value="due">Tenggat Waktu</option>
                            <option value="title">Nama Tugas</option>
                        </select>
                        <ChevronDown size={16} style={{ position: "absolute", right: 12, color: "#94a3b8", pointerEvents: "none" }} />
                    </div>
                </div>

                {/* ── FILTER PANEL ── */}
                {showFilter && (
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 24, padding: "24px 28px", marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", animation: "fadeSlideDown .2s ease" }}>
                        <style>{`@keyframes fadeSlideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}`}</style>
                        {[
                            { label: "KATEGORI TUGAS", opts: [{ v: "all", l: "Semua Kategori" }, { v: "assignment", l: "Tugas Kuliah" }, { v: "exam", l: "Ujian/Quiz" }, { v: "meeting", l: "Pertemuan" }], val: fType, set: setFType },
                        ].map(group => (
                            <div key={group.label} style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b", letterSpacing: "0.5px", textTransform: "uppercase" }}>{group.label}</span>
                                <div style={{ display: "flex", gap: 8, background: "#f8fafc", padding: 6, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                                    {group.opts.map(o => (
                                        <button key={o.v} onClick={() => group.set(o.v)}
                                            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: group.val === o.v ? "#4f46e5" : "transparent", fontSize: 13, fontWeight: 700, color: group.val === o.v ? "white" : "#475569", cursor: "pointer", fontFamily: "inherit", transition: "all .2s", boxShadow: group.val === o.v ? "0 4px 12px rgba(79,70,229,0.3)" : "none" }}>
                                            {o.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {activeFilters > 0 && (
                            <button onClick={() => { setFType("all"); }}
                                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#fef2f2", border: "none", borderRadius: 12, color: "#dc2626", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginLeft: "auto", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"} onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}>
                                <X size={16} /> Reset
                            </button>
                        )}
                    </div>
                )}

                {/* ── TABS ── */}
                <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "white", borderRadius: 20, padding: 8, width: "fit-content", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "12px 20px",
                            borderRadius: 14, border: "none",
                            background: tab === t.key ? (t.color || "#0f172a") : "transparent",
                            fontSize: 14, fontWeight: 700,
                            color: tab === t.key ? "white" : "#64748b",
                            cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
                        }}>
                        {t.label}
                        <span style={{ background: tab === t.key ? "rgba(255,255,255,.2)" : "#f1f5f9", color: tab === t.key ? "white" : "#475569", borderRadius: 10, fontSize: 12, fontWeight: 800, padding: "2px 8px", minWidth: 26, textAlign: "center" }}>{t.count}</span>
                    </button>
                ))}
                </div>

                {/* ── LIST ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {loading ? (
                        <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b", fontSize: 15, fontWeight: 600 }}>Menyiapkan daftar tugas Anda...</div>
                    ) : filtered.length === 0
                        ? (
                            <div style={{ background: "white", borderRadius: 32, padding: "80px 20px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,.02)", border: "2px dashed #e2e8f0" }}>
                                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                                    <CheckCircle2 size={40} color="#cbd5e1" />
                                </div>
                                <h3 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: "0 0 10px" }}>Semua Bersih!</h3>
                                <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 24px", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>Tidak ada tugas yang sesuai dengan filter atau kata kunci pencarian Anda saat ini.</p>
                                {activeFilters > 0 || search ? (
                                    <button onClick={() => { setSearch(""); setFType("all"); setTab("all"); }} style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "#f1f5f9", color: "#0f172a", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Hapus Filter</button>
                                ) : null}
                            </div>
                        )
                        : filtered.map(task => (
                            <TaskCard key={task.id} task={task}
                                onToggle={task.isPersonal ? togglePersonalTask : toggleTask}
                                onDelete={task.isPersonal ? deletePersonalTask : deleteTask}
                                onEdit={task.isPersonal ? (t => { setEditPersonal(t); setShowPersonal(true); }) : null}
                                onClick={t => t.isPersonal
                                    ? navigate("/mahasiswa/tasks/mandiri", { state: { taskId: t.id } })
                                    : navigate("/mahasiswa/tasks/detail",  { state: { taskId: t.id } })
                                }
                            />
                        ))
                    }
                </div>
            </main>
            {showJoin && (
                <JoinTaskModal 
                    onClose={() => setShowJoin(false)} 
                    onJoin={(task) => {
                        navigate("/mahasiswa/tasks/detail", { state: { taskId: task.id_task } });
                    }} 
                />
            )}
        </div>
    );
}