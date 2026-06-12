import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../axiosClient";
import Sidebar from "../../components/Sidebar";
import {
    ArrowLeft, AlertTriangle, BookOpen, Users, Clock,
    Calendar, MapPin, Tag, CheckCircle2, Circle, Plus,
    Trash2, Flame, Upload, FileText,
    ChevronRight, BarChart2, Target,
    Paperclip, Check, Download, Layers
} from "lucide-react";

const TYPE_CFG = {
    exam: { icon: AlertTriangle, bg: "#fef2f2", color: "#dc2626", label: "EXAM", border: "#fecaca" },
    assignment: { icon: BookOpen, bg: "#eef2ff", color: "#4f46e5", label: "ASSIGNMENT", border: "#c7d2fe" },
    meeting: { icon: Users, bg: "#ecfdf5", color: "#059669", label: "MEETING", border: "#a7f3d0" },
};

const STATUS_OPTS = [
    { key: "pending", label: "Belum Mulai", icon: Circle, color: "#64748b" },
    { key: "in_progress", label: "Dikerjakan", icon: Target, color: "#4f46e5" },
    { key: "completed", label: "Selesai", icon: CheckCircle2, color: "#10b981" },
];

function daysLeft(due, time) {
    const d = new Date(`${due}T${time}`);
    const now = new Date();
    if (d < now) return -1;
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.round((dueDate - todayDate) / 86400000);
}
function fmtDate(s) {
    return new Date(s).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 110, color = "#4f46e5" }) {
    const r = (size - 16) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={12} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={pct === 100 ? "#10b981" : color}
                    strokeWidth={12} strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: "stroke-dashoffset .8s cubic-bezier(0.4, 0, 0.2, 1)" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" }}>{pct}%</span>
                <span style={{ fontSize: 10, color: "#64748b", fontWeight: 800, letterSpacing: "1px" }}>SELESAI</span>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DetailTask() {
    const navigate = useNavigate();
    const location = useLocation();
    const taskId = location.state?.taskId;
    const user = JSON.parse(localStorage.getItem('user')) || { name: "Mahasiswa" };

    const [task, setTask] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);

    const [subtasks, setSubs] = useState([]);
    const [newSub, setNewSub] = useState("");
    const [tab, setTab] = useState("subtasks");
    const [status, setStatus] = useState("pending");
    const [submitted, setSub2] = useState(false);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!taskId) {
            navigate("/mahasiswa/tasks");
            return;
        }
        fetchData();
    }, [taskId]);

    const fetchData = async () => {
        try {
            const { data } = await axiosClient.get(`/mahasiswa/tasks/${taskId}`);
            setTask({
                id: data.task.id_task,
                title: data.task.nama_tugas,
                course: data.task.nama_matkul || "-",
                courseCode: data.task.kode_tugas || "-",
                description: data.task.deskripsi || "Tidak ada deskripsi",
                attachment: data.task.attachment || null,
                due: data.task.deadline ? data.task.deadline.substring(0, 10) : "2026-12-31",
                dueTime: data.task.jam || "23:59",
                type: "assignment",
                priority: data.task.prioritas || "medium",
                progress: (data.submission && (data.submission.status === 'submitted' || data.submission.status === 'late')) ? 100 : 0,
            });
            setSubmission(data.submission);
            setStatus(data.submission ? (data.submission.status === "submitted" ? "completed" : data.submission.status) : "pending");
        } catch (error) {
            console.error("Error fetching task details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setSub2(true);
            await axiosClient.post(`/mahasiswa/tasks/${taskId}/submit`, formData);
            await fetchData();
        } catch (error) {
            console.error("Upload failed", error);
            if (error.response && error.response.status === 403) {
                alert(error.response.data.message);
            } else {
                alert("Gagal mengunggah file");
            }
        } finally {
            setSub2(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (newStatus === "completed" && (!submission || !submission.file)) {
            alert("Anda harus mengunggah dokumen (Upload Tugas) terlebih dahulu untuk menyelesaikan tugas ini.");
            return;
        }
        setStatus(newStatus);
        try {
            await axiosClient.put(`/mahasiswa/tasks/${taskId}/status`, { status: newStatus });
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    if (loading) return <div className="app-wrapper"><Sidebar /><main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>Memuat detail tugas...</main></div>;
    if (!task) return <div className="app-wrapper"><Sidebar /><main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>Tugas tidak ditemukan.</main></div>;

    const tc = TYPE_CFG[task.type] || TYPE_CFG.assignment;
    const TIcon = tc.icon;
    const days = daysLeft(task.due, task.dueTime || "23:59");
    const doneSubs = subtasks.filter(s => s.done).length;
    const subPct = subtasks.length ? Math.round((doneSubs / subtasks.length) * 100) : 0;

    function toggleSub(id) { setSubs(p => p.map(s => s.id === id ? { ...s, done: !s.done } : s)); }
    function deleteSub(id) { setSubs(p => p.filter(s => s.id !== id)); }
    function addSub() { if (!newSub.trim()) return; setSubs(p => [...p, { id: Date.now(), label: newSub.trim(), done: false }]); setNewSub(""); }

    const TABS = [
        { key: "subtasks", label: "Sub-tugas", count: subtasks.length, icon: CheckCircle2 },
        { key: "attachments", label: "Lampiran Dosen", count: task.attachment ? 1 : 0, icon: Paperclip },
    ];

    return (
        <div className="app-wrapper">
            <Sidebar />
            <main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px", minHeight: "100vh" }}>
                <style>{`
                    .sub-del { opacity: 0; transition: all 0.2s; }
                    .sub-row:hover .sub-del { opacity: 1; }
                `}</style>

                {/* BREADCRUMB */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
                    <button onClick={() => navigate("/mahasiswa/tasks")}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit", padding: 0, transition: "color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#0f172a"}
                        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
                        <ArrowLeft size={16} /> Kembali ke Daftar Tugas
                    </button>
                    <ChevronRight size={14} color="#cbd5e1" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", background: "#fff7ed", padding: "4px 10px", borderRadius: 8 }}>Detail Tugas</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
                    {/* ── LEFT ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                        {/* Hero */}
                        <div style={{ background: "white", borderRadius: 24, padding: "32px", boxShadow: "0 4px 16px rgba(0,0,0,.02)", border: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 10, fontSize: 11, fontWeight: 800, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}40`, letterSpacing: "0.5px" }}>
                                        <TIcon size={14} />{tc.label}
                                    </span>

                                    <span style={{
                                        display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 10, fontSize: 11, fontWeight: 800, letterSpacing: "0.5px",
                                        background: status === "completed" ? "#ecfdf5" : status === "late" ? "#fef2f2" : status === "in_progress" ? "#eef2ff" : "#f1f5f9",
                                        color: status === "completed" ? "#059669" : status === "late" ? "#dc2626" : status === "in_progress" ? "#4f46e5" : "#64748b",
                                        border: `1px solid ${status === "completed" ? "#a7f3d040" : status === "late" ? "#fecaca40" : status === "in_progress" ? "#c7d2fe40" : "#e2e8f0"}`
                                    }}>
                                        {status === "completed" ? "✓ SELESAI TEPAT WAKTU" : status === "late" ? "⚠ SELESAI TERLAMBAT" : status === "in_progress" ? "● DIKERJAKAN" : "○ BELUM MULAI"}
                                    </span>
                                </div>
                                <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>{task.title}</h1>
                                <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
                                    {task.course}
                                    <span style={{ background: "#eef2ff", color: "#4f46e5", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 8 }}>{task.courseCode}</span>
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 16 }}>
                                    {[
                                        { icon: Calendar, val: fmtDate(task.due) },
                                        { icon: Clock, val: task.dueTime || "23:59" },
                                        { icon: MapPin, val: task.location || "Online Submit" },
                                    ].map((m, i) => {
                                        const I = m.icon; return (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#475569", fontWeight: 700 }}>
                                                <I size={16} color="#94a3b8" /><span>{m.val}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, flexShrink: 0, padding: "10px" }}>
                                <ProgressRing pct={status === "completed" ? 100 : (subtasks.length > 0 ? subPct : (task.progress || 0))} color={tc.color} />
                                <div style={{
                                    display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, padding: "8px 16px", borderRadius: 12,
                                    background: days < 0 ? "#fef2f2" : days === 0 ? "#fff7ed" : "#eef2ff",
                                    color: days < 0 ? "#dc2626" : days === 0 ? "#ea580c" : "#4f46e5",
                                    border: `1px solid ${days < 0 ? "#fecaca" : days === 0 ? "#fed7aa" : "#c7d2fe"}`
                                }}>
                                    {days < 0 ? <><Trash2 size={16} />Terlambat!</>
                                        : days === 0 ? <><Flame size={16} />Hari ini!</>
                                            : <><Clock size={16} />{days} hari lagi</>}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ background: "white", borderRadius: 24, padding: "24px 32px", boxShadow: "0 4px 16px rgba(0,0,0,.02)", border: "1px solid #e2e8f0" }}>
                            <h2 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 900, color: "#0f172a", margin: "0 0 16px" }}>
                                <Layers size={20} color="#4f46e5" />Deskripsi Tugas
                            </h2>
                            <div style={{ fontSize: 15, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "#fafafa", padding: "20px 24px", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                                {task.description || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Tidak ada deskripsi.</span>}
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div style={{ display: "flex", gap: 8, background: "white", borderRadius: 20, padding: 8, width: "fit-content", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                            {TABS.map(t => {
                                const I = t.icon; return (
                                    <button key={t.key} onClick={() => setTab(t.key)}
                                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderRadius: 14, border: "none", background: tab === t.key ? "#0f172a" : "transparent", fontSize: 14, fontWeight: 700, color: tab === t.key ? "white" : "#64748b", cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>
                                        <I size={16} />{t.label}
                                        <span style={{ background: tab === t.key ? "rgba(255,255,255,.2)" : "#f1f5f9", color: tab === t.key ? "white" : "#475569", borderRadius: 10, fontSize: 12, fontWeight: 800, padding: "2px 8px", minWidth: 26, textAlign: "center" }}>{t.count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content: Subtasks */}
                        {tab === "subtasks" && (
                            <div style={{ background: "white", borderRadius: 24, padding: "24px 32px", boxShadow: "0 4px 16px rgba(0,0,0,.02)", border: "1px solid #e2e8f0" }}>
                                {subtasks.length > 0 && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, fontSize: 14, color: "#64748b", fontWeight: 700 }}>
                                        <span>{doneSubs} dari {subtasks.length} selesai</span>
                                        <div style={{ flex: 1, height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${subPct}%`, background: "linear-gradient(90deg, #4f46e5, #3b82f6)", borderRadius: 99, transition: "width .4s ease" }} />
                                        </div>
                                        <span style={{ color: "#4f46e5", fontWeight: 900 }}>{subPct}%</span>
                                    </div>
                                )}
                                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                                    {subtasks.length === 0 && <div style={{ padding: "30px", textAlign: "center", background: "#f8fafc", borderRadius: 16, border: "1px dashed #cbd5e1" }}><p style={{ fontSize: 14, color: "#64748b", fontWeight: 600, margin: 0 }}>Belum ada sub-tugas yang ditambahkan.</p></div>}
                                    {subtasks.map(sub => (
                                        <div key={sub.id} className="sub-row" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0", transition: "all .2s" }}
                                            onMouseEnter={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
                                            <button onClick={() => toggleSub(sub.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0, padding: 0, transition: "transform .2s" }}
                                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                                                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                                                {sub.done ? <CheckCircle2 size={24} color="#10b981" /> : <Circle size={24} color="#cbd5e1" />}
                                            </button>
                                            <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: sub.done ? "#94a3b8" : "#0f172a", textDecoration: sub.done ? "line-through" : "none", transition: "all .2s" }}>{sub.label}</span>
                                            <button onClick={() => deleteSub(sub.id)} className="sub-del" style={{ background: "#fef2f2", border: "none", cursor: "pointer", color: "#dc2626", display: "flex", padding: 8, borderRadius: 10 }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <input value={newSub} onChange={e => setNewSub(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && addSub()}
                                        placeholder="Ketik sub-tugas baru... (tekan Enter)"
                                        style={{ flex: 1, padding: "14px 20px", border: "1px solid #e2e8f0", borderRadius: 16, fontSize: 14, fontFamily: "inherit", outline: "none", transition: "all .2s", background: "white" }}
                                        onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 4px rgba(79,70,229,.1)"; }}
                                        onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                                    />
                                    <button onClick={addSub} style={{ width: 48, height: 48, borderRadius: 16, background: "#0f172a", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
                                        onMouseLeave={e => e.currentTarget.style.background = "#0f172a"}>
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Attachments */}
                        {tab === "attachments" && (
                            <div style={{ background: "white", borderRadius: 24, padding: "24px 32px", boxShadow: "0 4px 16px rgba(0,0,0,.02)", border: "1px solid #e2e8f0" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    {task.attachment ? (
                                        <>
                                            {(typeof task.attachment === 'string' && task.attachment.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                                                <div style={{ marginBottom: 16, borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                                                    <img src={`http://127.0.0.1:8000/storage/${task.attachment}`} alt="Lampiran Dosen" style={{ maxWidth: "100%", height: "auto", display: "block", maxHeight: 400, objectFit: "cover" }} />
                                                </div>
                                            ) : null}
                                            <a href={`http://127.0.0.1:8000/storage/${task.attachment}?download=1`} download target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#f8fafc", borderRadius: 16, textDecoration: "none", color: "inherit", transition: "all .2s", border: "1px solid #e2e8f0" }}
                                                onMouseEnter={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
                                                <div style={{ width: 44, height: 44, background: "#eef2ff", color: "#4f46e5", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <FileText size={24} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{typeof task.attachment === 'string' ? task.attachment.split(/[/\\]/).pop() : "File Lampiran"}</p>
                                                    <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: 0 }}>Diberikan oleh Dosen</p>
                                                </div>
                                                <div style={{ background: "white", border: "1px solid #e2e8f0", color: "#0f172a", display: "flex", padding: 12, borderRadius: 12 }}>
                                                    <Download size={18} />
                                                </div>
                                            </a>
                                        </>
                                    ) : (
                                        <div style={{ padding: "40px 20px", textAlign: "center", background: "#f8fafc", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
                                            <div style={{ width: 48, height: 48, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", border: "1px solid #e2e8f0" }}>
                                                <Paperclip size={24} color="#94a3b8" />
                                            </div>
                                            <p style={{ fontSize: 14, color: "#64748b", fontWeight: 600, margin: 0 }}>Tidak ada lampiran dari dosen untuk tugas ini.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT SIDEBAR ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                        {/* Status Panel */}
                        <div style={{ background: "white", borderRadius: 24, padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,.02)", border: "1px solid #e2e8f0" }}>
                            <h3 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 900, color: "#0f172a", margin: "0 0 20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                <BarChart2 size={20} color="#ea580c" /> Status Pengerjaan
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {STATUS_OPTS.map(s => {
                                    const SI = s.icon; 
                                    const isLate = status === "late" && s.key === "completed";
                                    const active = status === s.key || isLate; 
                                    const activeColor = isLate ? "#dc2626" : s.color;
                                    
                                    return (
                                        <button key={s.key} onClick={() => handleStatusChange(s.key)}
                                            disabled={submission && (submission.status === "late" || submission.status === "submitted")}
                                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, fontSize: 14, fontWeight: 700, cursor: (s.key === "completed" && (!submission || !submission.file)) ? "not-allowed" : "pointer", fontFamily: "inherit", border: `2px solid ${active ? activeColor : "#f1f5f9"}`, background: active ? "white" : "#f8fafc", color: active ? activeColor : "#64748b", transition: "all .2s", opacity: (submission && (submission.status === "late" || submission.status === "submitted")) ? 0.7 : 1 }}>
                                            <SI size={20} color={active ? activeColor : "#cbd5e1"} />
                                            {isLate ? "Selesai Terlambat" : s.label}
                                            {(s.key === "completed" && (!submission || !submission.file)) && <span style={{ fontSize: 11, marginLeft: "auto", color: "#ef4444", background: "#fef2f2", padding: "4px 8px", borderRadius: 6 }}>Upload file dulu</span>}
                                            {active && <Check size={18} color={activeColor} style={{ marginLeft: "auto" }} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Info Panel */}
                        <div style={{ background: "white", borderRadius: 24, padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,.02)", border: "1px solid #e2e8f0" }}>
                            <h3 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 900, color: "#0f172a", margin: "0 0 20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                <Tag size={20} color="#4f46e5" /> Informasi
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {[
                                    { k: "Kode Tugas", v: task.courseCode },
                                    { k: "Tipe", v: tc.label, vc: tc.color },
                                    { k: "Deadline", v: `${task.due} · ${task.dueTime}` },
                                    { k: "Lokasi", v: task.location || "Online Submit" },
                                    { k: "Progress", v: `${status === "completed" ? 100 : (task.progress || 0)}%`, vc: status === "completed" ? "#10b981" : "#0f172a" },
                                ].map((r, i, arr) => (
                                    <div key={r.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, paddingBottom: i !== arr.length - 1 ? 16 : 0, borderBottom: i !== arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                                        <span style={{ color: "#64748b", fontWeight: 700 }}>{r.k}</span>
                                        <span style={{ color: r.vc || "#0f172a", fontWeight: 800, textAlign: "right", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: "none" }} 
                                onChange={handleFileChange}
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={submitted || status === "completed" || status === "late" || days < 0}
                                style={{ 
                                    opacity: (status === "completed" || status === "late" || days < 0) ? 0.8 : 1, 
                                    cursor: (days < 0 && status !== 'completed' && status !== 'late') ? "not-allowed" : "pointer", 
                                    background: (days < 0 && status !== 'completed' && status !== 'late') ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                                    color: "white", padding: "18px 24px", borderRadius: 16, border: "none", fontSize: 15, fontWeight: 900,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s",
                                    boxShadow: (days < 0 && status !== 'completed' && status !== 'late') ? "0 8px 20px rgba(239,68,68,0.25)" : "0 8px 20px rgba(79,70,229,0.25)"
                                }}
                                onMouseEnter={e => { if(!(status === "completed" || status === "late" || days < 0)) e.currentTarget.style.transform = "translateY(-2px)" }}
                                onMouseLeave={e => { if(!(status === "completed" || status === "late" || days < 0)) e.currentTarget.style.transform = "translateY(0)" }}
                            >
                                {submitted ? <><span className="spinner" style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span>Mengunggah...</> : 
                                 (status === "completed" || status === "late") ? <><Check size={20} />Tugas Terkirim</> : 
                                 days < 0 ? <><AlertTriangle size={20} />Deadline Terlewat</> :
                                 <><Upload size={20} />Kumpulkan Tugas</>}
                            </button>
                            {submission?.file && (
                                <p style={{ fontSize: 12, fontWeight: 600, color: "#10b981", textAlign: "center", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                    <CheckCircle2 size={14} /> File berhasil diunggah
                                </p>
                            )}
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}