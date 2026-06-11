import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../axiosClient";
import Sidebar from "../../components/Sidebar";
import {
    ArrowLeft, AlertTriangle, BookOpen, Users, Clock,
    Calendar, MapPin, Tag, CheckCircle2, Circle, Plus,
    Trash2, Edit3, Flame, Upload, Save, FileText,
    Link2, ChevronRight, BarChart2, Target, X,
    MessageSquare, Paperclip, Check, Download,
} from "lucide-react";

const DEFAULT_TASK = {
    id: 1, title: "Implementasi Algoritma Dijkstra", course: "Algoritma & Struktur Data", courseCode: "IF3120",
    type: "assignment", priority: "high", status: "in_progress", due: "2026-05-30", dueTime: "14:00",
    progress: 65, tags: ["coding", "graph"],
    description: "Implementasikan Algoritma Dijkstra untuk mencari shortest path pada graf berbobot. Gunakan adjacency list dan min-heap untuk efisiensi optimal. Sertakan visualisasi langkah-langkah algoritma dan analisis kompleksitas waktu O((V+E) log V).",
    location: "Online Submit",
};

const TYPE_CFG = {
    exam: { icon: AlertTriangle, bg: "#fee2e2", color: "#dc2626", label: "EXAM" },
    assignment: { icon: BookOpen, bg: "#eef2ff", color: "#4338ca", label: "ASSIGNMENT" },
    meeting: { icon: Users, bg: "#f0fdf4", color: "#16a34a", label: "MEETING" },
};
const PRI_CFG = {
    urgent: { bg: "#fef2f2", color: "#dc2626", label: "Urgent" },
    high: { bg: "#fff7ed", color: "#ea580c", label: "High" },
    medium: { bg: "#fefce8", color: "#ca8a04", label: "Medium" },
    low: { bg: "#f0fdf4", color: "#16a34a", label: "Low" },
};
const STATUS_OPTS = [
    { key: "pending", label: "Belum Mulai", icon: Circle, color: "#6b7280" },
    { key: "in_progress", label: "Dikerjakan", icon: Target, color: "#4338ca" },
    { key: "completed", label: "Selesai", icon: CheckCircle2, color: "#16a34a" },
];

const INIT_SUBTASKS = [];
const INIT_COMMENTS = [];
const ATTACHMENTS = [
    { id: 1, name: "Algoritma_Reference.pdf", size: "2.4 MB", icon: "📄" },
    { id: 2, name: "graph_visualization.png", size: "1.1 MB", icon: "🖼️" },
    { id: 3, name: "starter_code.zip", size: "450 KB", icon: "🗜️" },
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
function ProgressRing({ pct, size = 90, color = "#4338ca" }) {
    const r = (size - 12) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e0e7ff" strokeWidth={10} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={pct === 100 ? "#16a34a" : color}
                    strokeWidth={10} strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: "stroke-dashoffset .6s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>{pct}%</span>
                <span style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: 1 }}>DONE</span>
            </div>
        </div>
    );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ task, onClose, onSave }) {
    const [f, setF] = useState({ ...task, tags: (task.tags || []).join(", ") });
    const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
    const inp = { width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fafafa" };
    const focus = e => { e.target.style.borderColor = "#4338ca"; e.target.style.boxShadow = "0 0 0 3px rgba(67,56,202,.1)"; };
    const blur = e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; };
    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.2)" }}>
                <div style={{ padding: "22px 26px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: 0 }}>Edit Tugas</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
                </div>
                <div style={{ padding: "20px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                        { label: "Nama Tugas", key: "title", ph: "Nama tugas..." },
                        { label: "Mata Kuliah", key: "course", ph: "Nama mata kuliah..." },
                        { label: "Deskripsi", key: "description", ph: "Deskripsi tugas..." },
                        { label: "Tags", key: "tags", ph: "coding, review (pisah koma)" },
                    ].map(fi => (
                        <div key={fi.key}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>{fi.label}</label>
                            <input type="text" value={f[fi.key] || ""} onChange={s(fi.key)} placeholder={fi.ph} style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                    ))}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>Deadline</label>
                            <input type="date" value={f.due} onChange={s("due")} style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>Jam</label>
                            <input type="time" value={f.dueTime} onChange={s("dueTime")} style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>Prioritas</label>
                            <select value={f.priority} onChange={s("priority")} style={{ ...inp, appearance: "none" }}>
                                {["urgent", "high", "medium", "low"].map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>Tipe</label>
                            <select value={f.type} onChange={s("type")} style={{ ...inp, appearance: "none" }}>
                                {["assignment", "exam", "meeting"].map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div style={{ padding: "16px 26px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 10 }}>
                    <button onClick={() => { onSave({ ...f, tags: f.tags ? f.tags.split(",").map(t => t.trim()).filter(Boolean) : [] }); onClose(); }}
                        style={{ flex: 1, padding: 12, borderRadius: 13, border: "none", background: "linear-gradient(135deg,#4338ca,#6366f1)", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <Save size={14} /> Simpan Perubahan
                    </button>
                    <button onClick={onClose} style={{ padding: "12px 20px", borderRadius: 13, border: "1.5px solid #e5e7eb", background: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>Batal</button>
                </div>
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

    const [subtasks, setSubs] = useState(INIT_SUBTASKS);
    const [comments, setComs] = useState(INIT_COMMENTS);
    const [newSub, setNewSub] = useState("");
    const [newCom, setNewCom] = useState("");
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
                course: data.task.mata_kuliah?.nama_matkul || "-",
                courseCode: data.task.mata_kuliah?.kode_mk || "-",
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
            setSub2(true); // Loading state
            await axiosClient.post(`/mahasiswa/tasks/${taskId}/submit`, formData);
            await fetchData(); // Refresh data
        } catch (error) {
            console.error("Upload failed", error);
            alert("Gagal mengunggah file");
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

    if (loading) return <div className="app-wrapper"><main className="main-content"><p>Loading...</p></main></div>;
    if (!task) return <div className="app-wrapper"><main className="main-content"><p>Task not found.</p></main></div>;

    const tc = TYPE_CFG[task.type] || TYPE_CFG.assignment;
    const pc = PRI_CFG[task.priority] || PRI_CFG.medium;
    const TIcon = tc.icon;
    const days = daysLeft(task.due, task.dueTime || "23:59");
    const doneSubs = subtasks.filter(s => s.done).length;
    const subPct = subtasks.length ? Math.round((doneSubs / subtasks.length) * 100) : 0;

    function toggleSub(id) { setSubs(p => p.map(s => s.id === id ? { ...s, done: !s.done } : s)); }
    function deleteSub(id) { setSubs(p => p.filter(s => s.id !== id)); }
    function addSub() { if (!newSub.trim()) return; setSubs(p => [...p, { id: Date.now(), label: newSub.trim(), done: false }]); setNewSub(""); }
    function addCom() { if (!newCom.trim()) return; setComs(p => [...p, { id: Date.now(), author: user.name, initials: user.name.charAt(0).toUpperCase(), time: "Baru saja", text: newCom.trim() }]); setNewCom(""); }

    const TABS = [
        { key: "subtasks", label: "Sub-tugas", count: subtasks.length, icon: CheckCircle2 },
        { key: "comments", label: "Catatan", count: comments.length, icon: MessageSquare },
        { key: "attachments", label: "Lampiran Dosen", count: task.attachment ? 1 : 0, icon: Paperclip },
    ];

    return (
        <div className="app-wrapper">
            <Sidebar />
            <main className="main-content detail-page">
                <style>{`
                    .dt-btn-pri { background:linear-gradient(135deg,#4338ca,#6366f1);color:white;border:none;padding:13px 20px;border-radius:14px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;width:100%;box-shadow:0 4px 14px rgba(67,56,202,.3);transition:all .2s; }
                    .dt-btn-pri:hover { transform:translateY(-1px);box-shadow:0 8px 20px rgba(67,56,202,.4); }
                    .dt-btn-sec { background:white;color:#374151;border:1.5px solid #e5e7eb;padding:12px 20px;border-radius:14px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;width:100%;transition:all .2s; }
                    .dt-btn-sec:hover { background:#f9fafb;border-color:#d1d5db; }
                `}</style>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                    <button onClick={() => navigate("/mahasiswa/tasks")}
                        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", fontSize: 14, fontWeight: 700, color: "#4338ca", cursor: "pointer", fontFamily: "inherit", padding: 0, transition: "gap .15s" }}
                        onMouseEnter={e => e.currentTarget.style.gap = "4px"}
                        onMouseLeave={e => e.currentTarget.style.gap = "8px"}>
                        <ArrowLeft size={16} />Tugas
                    </button>
                    <ChevronRight size={14} color="#9ca3af" />
                    <span style={{ fontSize: 14, color: "#9ca3af" }}>Detail Tugas</span>
                </div>

                <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
                    {/* ── LEFT ── */}
                    <div className="detail-main" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                        {/* Hero */}
                        <div style={{ background: "white", borderRadius: 22, padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,.06)", border: "1px solid #e5e7eb", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: tc.bg, color: tc.color }}>
                                        <TIcon size={12} />{tc.label}
                                    </span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: pc.bg, color: pc.color }}>
                                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: pc.color, flexShrink: 0 }} />{pc.label}
                                    </span>
                                    <span style={{
                                        display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                                        background: status === "completed" ? "#f0fdf4" : status === "in_progress" ? "#eef2ff" : "#f3f4f6",
                                        color: status === "completed" ? "#16a34a" : status === "in_progress" ? "#4338ca" : "#6b7280"
                                    }}>
                                        {status === "completed" ? "✓ Selesai" : status === "in_progress" ? "● Dikerjakan" : "○ Belum Mulai"}
                                    </span>
                                </div>
                                <h1 style={{ fontSize: 24, fontWeight: 900, color: "#111827", margin: "0 0 8px", letterSpacing: "-.3px", lineHeight: 1.2 }}>{task.title}</h1>
                                <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                                    {task.course}
                                    <span style={{ background: "#eef2ff", color: "#4338ca", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>{task.courseCode}</span>
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 14 }}>
                                    {[
                                        { icon: Calendar, val: fmtDate(task.due) },
                                        { icon: Clock, val: task.dueTime || "23:59" },
                                        { icon: MapPin, val: task.location || "Online Submit" },
                                    ].map((m, i) => {
                                        const I = m.icon; return (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280" }}>
                                                <I size={14} /><span>{m.val}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {(task.tags || []).map(t => (
                                        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600, background: "#f3f4f6", color: "#6b7280" }}>
                                            <Tag size={10} />{t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0 }}>
                                <ProgressRing pct={status === "completed" ? 100 : (subtasks.length > 0 ? subPct : (task.progress || 0))} color={pc.color} />
                                <div style={{
                                    display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 10,
                                    background: days < 0 ? "#fee2e2" : days === 0 ? "#fff7ed" : "#eef2ff",
                                    color: days < 0 ? "#dc2626" : days === 0 ? "#ea580c" : "#4338ca"
                                }}>
                                    {days < 0 ? <><Trash2 size={13} />Terlambat!</>
                                        : days === 0 ? <><Flame size={13} />Hari ini!</>
                                            : <><Clock size={13} />{days} hari lagi</>}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ background: "white", borderRadius: 18, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f3f4f6" }}>
                            <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, color: "#111827", margin: "0 0 14px" }}>
                                <FileText size={16} color="#4338ca" />Deskripsi Tugas
                            </h2>
                            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{task.description || "Tidak ada deskripsi."}</p>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: "flex", gap: 4, background: "white", borderRadius: 16, padding: 6, width: "fit-content", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
                            {TABS.map(t => {
                                const I = t.icon; return (
                                    <button key={t.key} onClick={() => setTab(t.key)}
                                        style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 12, border: "none", background: tab === t.key ? "#4338ca" : "none", fontSize: 13, fontWeight: 600, color: tab === t.key ? "white" : "#6b7280", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                                        <I size={13} />{t.label}
                                        <span style={{ background: tab === t.key ? "rgba(255,255,255,.25)" : "rgba(0,0,0,.08)", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "1px 7px" }}>{t.count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab: Subtasks */}
                        {tab === "subtasks" && (
                            <div style={{ background: "white", borderRadius: 18, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f3f4f6" }}>
                                {subtasks.length > 0 && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>
                                        <span>{doneSubs} dari {subtasks.length} selesai</span>
                                        <div style={{ flex: 1, height: 5, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${subPct}%`, background: "#4338ca", borderRadius: 99, transition: "width .4s ease" }} />
                                        </div>
                                        <span style={{ color: "#4338ca", fontWeight: 700 }}>{subPct}%</span>
                                    </div>
                                )}
                                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
                                    {subtasks.length === 0 && <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", margin: "10px 0" }}>Belum ada sub-tugas yang ditambahkan.</p>}
                                    {subtasks.map(sub => (
                                        <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#f9fafb", borderRadius: 14, border: "1px solid #f3f4f6", transition: "background .15s" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
                                            onMouseLeave={e => e.currentTarget.style.background = "#f9fafb"}>
                                            <button onClick={() => toggleSub(sub.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0, padding: 0, transition: "transform .15s" }}
                                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                                                onMouseLeave={e => e.currentTarget.style.transform = ""}>
                                                {sub.done ? <CheckCircle2 size={20} color="#4338ca" fill="#eef2ff" /> : <Circle size={20} color="#d1d5db" />}
                                            </button>
                                            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: sub.done ? "#9ca3af" : "#111827", textDecoration: sub.done ? "line-through" : "none", transition: "all .2s" }}>{sub.label}</span>
                                            <button onClick={() => deleteSub(sub.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", display: "flex", padding: 4, borderRadius: 6, opacity: 0, transition: "all .15s" }}
                                                onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "#fee2e2"; }}
                                                onMouseLeave={e => { e.currentTarget.style.opacity = 0; e.currentTarget.style.color = "#d1d5db"; e.currentTarget.style.background = "none"; }}
                                                className="sub-del">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <input value={newSub} onChange={e => setNewSub(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && addSub()}
                                        placeholder="Tambah sub-tugas baru… (Enter)"
                                        style={{ flex: 1, padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: 13, fontSize: 13, fontFamily: "inherit", outline: "none", transition: "all .2s" }}
                                        onFocus={e => { e.target.style.borderColor = "#4338ca"; e.target.style.boxShadow = "0 0 0 3px rgba(67,56,202,.1)"; }}
                                        onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                                    />
                                    <button onClick={addSub} style={{ width: 44, height: 44, borderRadius: 13, background: "#4338ca", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#3730a3"}
                                        onMouseLeave={e => e.currentTarget.style.background = "#4338ca"}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <style>{`.sub-del:hover{opacity:1!important}`}</style>
                            </div>
                        )}

                        {/* Tab: Comments */}
                        {tab === "comments" && (
                            <div style={{ background: "white", borderRadius: 18, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f3f4f6" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
                                    {comments.length === 0 && <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", margin: "10px 0" }}>Belum ada catatan.</p>}
                                    {comments.map(c => (
                                        <div key={c.id} style={{ display: "flex", gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#4338ca)", color: "white", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{c.initials}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{c.author}</span>
                                                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{c.time}</span>
                                                </div>
                                                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: 0, background: "#f9fafb", padding: "10px 14px", borderRadius: "0 12px 12px 12px" }}>{c.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#4338ca)", color: "white", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{user.name.charAt(0).toUpperCase()}</div>
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                                        <textarea value={newCom} onChange={e => setNewCom(e.target.value)} rows={2}
                                            placeholder="Tambah catatan atau komentar..."
                                            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 13, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "none", transition: "all .2s", boxSizing: "border-box" }}
                                            onFocus={e => { e.target.style.borderColor = "#4338ca"; e.target.style.boxShadow = "0 0 0 3px rgba(67,56,202,.1)"; }}
                                            onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                                        />
                                        <button onClick={addCom} style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 6, background: "#4338ca", color: "white", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "background .15s" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#3730a3"}
                                            onMouseLeave={e => e.currentTarget.style.background = "#4338ca"}>
                                            <Save size={14} />Simpan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Attachments */}
                        {tab === "attachments" && (
                            <div style={{ background: "white", borderRadius: 18, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f3f4f6" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                                    {task.attachment ? (
                                        <>
                                            {(typeof task.attachment === 'string' && task.attachment.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                                                <div style={{ marginBottom: 12, borderRadius: 12, overflow: "hidden", border: "1px solid #f3f4f6" }}>
                                                    <img src={`http://127.0.0.1:8000/storage/${task.attachment}`} alt="Lampiran Dosen" style={{ width: "100%", height: "auto", display: "block" }} />
                                                </div>
                                            ) : null}
                                            <a href={`http://127.0.0.1:8000/storage/${task.attachment}?download=1`} download target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#f9fafb", borderRadius: 13, textDecoration: "none", color: "inherit", transition: "background .15s" }}
                                                onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
                                                onMouseLeave={e => e.currentTarget.style.background = "#f9fafb"}>
                                                <span style={{ fontSize: 22, flexShrink: 0 }}>📄</span>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{typeof task.attachment === 'string' ? task.attachment.split(/[/\\]/).pop() : "Lampiran"}</p>
                                                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>Lampiran Dosen</p>
                                                </div>
                                                <div style={{ background: "none", border: "none", cursor: "pointer", color: "#4338ca", display: "flex", padding: 8, borderRadius: 8, transition: "background .15s" }}
                                                    onMouseEnter={e => e.currentTarget.style.background = "#eef2ff"}
                                                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                                    <Download size={14} />
                                                </div>
                                            </a>
                                        </>
                                    ) : (
                                        <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>Tidak ada lampiran dari dosen.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT SIDEBAR ── */}
                    <div className="detail-sidebar" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                        {/* Status */}
                        <div style={{ background: "white", borderRadius: 18, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f3f4f6" }}>
                            <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#111827", margin: "0 0 14px" }}>
                                <BarChart2 size={15} color="#4338ca" />Status Pengerjaan
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {STATUS_OPTS.map(s => {
                                    const SI = s.icon; const active = status === s.key; return (
                                        <button key={s.key} onClick={() => handleStatusChange(s.key)}
                                            disabled={submission && (submission.status === "late" || submission.status === "submitted")}
                                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 13, fontSize: 13, fontWeight: 600, cursor: (s.key === "completed" && (!submission || !submission.file)) ? "not-allowed" : "pointer", fontFamily: "inherit", border: `1.5px solid ${active ? s.color + "40" : "#f3f4f6"}`, background: active ? `${s.color}0f` : "#f9fafb", color: active ? s.color : "#6b7280", transition: "all .15s", opacity: (submission && (submission.status === "late" || submission.status === "submitted")) ? 0.6 : 1 }}>
                                            <SI size={16} color={active ? s.color : "#d1d5db"} />
                                            {s.label}
                                            {(s.key === "completed" && (!submission || !submission.file)) && <span style={{ fontSize: 10, marginLeft: "auto", color: "#ef4444" }}>Upload dulu</span>}
                                            {active && <Check size={14} color={s.color} style={{ marginLeft: "auto" }} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Info */}
                        <div style={{ background: "white", borderRadius: 18, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f3f4f6" }}>
                            <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#111827", margin: "0 0 14px" }}>
                                <Tag size={15} color="#4338ca" />Informasi
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {[
                                    { k: "Mata Kuliah", v: task.courseCode },
                                    { k: "Tipe", v: tc.label, vc: tc.color },
                                    { k: "Prioritas", v: pc.label, vc: pc.color },
                                    { k: "Deadline", v: `${task.due} · ${task.dueTime}` },
                                    { k: "Lokasi", v: task.location || "Online Submit" },
                                    { k: "Progress", v: `${task.progress}%` },
                                ].map(r => (
                                    <div key={r.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "8px 0", borderBottom: "1px solid #f9fafb" }}>
                                        <span style={{ color: "#9ca3af", fontWeight: 600 }}>{r.k}</span>
                                        <span style={{ color: r.vc || "#374151", fontWeight: 700, textAlign: "right", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: "none" }} 
                                onChange={handleFileChange}
                            />
                            <button 
                                className="dt-btn-pri" 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={submitted || status === "completed" || status === "late"}
                                style={{ opacity: (status === "completed" || status === "late") ? 0.7 : 1 }}
                            >
                                {submitted ? <><span className="spinner"></span>Mengunggah...</> : 
                                 (status === "completed" || status === "late") ? <><Check size={15} />Tugas Terkirim</> : 
                                 <><Upload size={15} />Submit Tugas</>}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}