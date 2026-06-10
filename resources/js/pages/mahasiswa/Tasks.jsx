import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import Sidebar from "../../components/Sidebar";
import {
    Search, Plus, SlidersHorizontal, ChevronDown, X,
    AlertTriangle, BookOpen, Users, Clock, CheckCircle2,
    Circle, MoreHorizontal, Flame, Calendar, Tag, QrCode,
    ArrowUpRight, Trash2, Edit3, Target, Zap, TrendingUp,
} from "lucide-react";
import axiosClient from "../../axiosClient";

// ─── Data ─────────────────────────────────────────────────────────────────────
const INIT_TASKS = [
    { id: 1, title: "Implementasi Algoritma Dijkstra", course: "Algoritma & Struktur Data", courseCode: "IF3120", type: "assignment", priority: "high", status: "in_progress", due: "2026-05-30", dueTime: "14:00", progress: 65, tags: ["coding", "graph"], description: "Implementasikan Dijkstra untuk shortest path pada graf berbobot." },
    { id: 2, title: "Quiz Kecerdasan Buatan", course: "Kecerdasan Buatan", courseCode: "IF4120", type: "exam", priority: "urgent", status: "pending", due: "2026-05-31", dueTime: "09:00", progress: 0, tags: ["quiz", "AI"], description: "Quiz mencakup machine learning, neural network, dan deep learning." },
    { id: 3, title: "Laporan Praktikum Komputasi Awan", course: "Komputasi Awan", courseCode: "IF4230", type: "assignment", priority: "medium", status: "in_progress", due: "2026-06-03", dueTime: "23:59", progress: 40, tags: ["laporan", "cloud"], description: "Deployment aplikasi ke AWS dengan Docker dan Kubernetes." },
    { id: 4, title: "Presentasi Proyek Akhir Mobile", course: "Mobile Programming Lanjut", courseCode: "IF4310", type: "meeting", priority: "high", status: "pending", due: "2026-06-05", dueTime: "13:00", progress: 80, tags: ["presentasi", "mobile"], description: "Presentasikan proyek mobile yang dikembangkan selama satu semester." },
    { id: 5, title: "UTS Web Programming Lanjut", course: "Web Programming Lanjut", courseCode: "IF4210", type: "exam", priority: "urgent", status: "pending", due: "2026-06-08", dueTime: "10:00", progress: 0, tags: ["ujian", "web"], description: "Ujian Tengah Semester: React, Vue, dan Node.js." },
    { id: 6, title: "Tugas Kelompok Jaringan Komputer", course: "Jaringan Komputer", courseCode: "IF3230", type: "assignment", priority: "low", status: "completed", due: "2026-05-25", dueTime: "23:59", progress: 100, tags: ["kelompok", "network"], description: "Analisis dan simulasi protokol jaringan menggunakan Cisco Packet Tracer." },
    { id: 7, title: "Review Paper – Deep Learning", course: "Kecerdasan Buatan", courseCode: "IF4120", type: "assignment", priority: "low", status: "completed", due: "2026-05-20", dueTime: "23:59", progress: 100, tags: ["review", "AI"], description: "Review paper terbaru tentang deep learning architecture." },
];

const TYPE_CFG = {
    exam: { icon: AlertTriangle, bg: "#fee2e2", color: "#dc2626", label: "EXAM" },
    assignment: { icon: BookOpen, bg: "#eef2ff", color: "#4338ca", label: "ASSIGNMENT" },
    meeting: { icon: Users, bg: "#f0fdf4", color: "#16a34a", label: "MEETING" },
};

const PRI_CFG = {
    urgent: { bg: "#fef2f2", color: "#dc2626", dot: "#dc2626", label: "Urgent", rank: 0 },
    high: { bg: "#fff7ed", color: "#ea580c", dot: "#ea580c", label: "High", rank: 1 },
    medium: { bg: "#fefce8", color: "#ca8a04", dot: "#ca8a04", label: "Medium", rank: 2 },
    low: { bg: "#f0fdf4", color: "#16a34a", dot: "#16a34a", label: "Low", rank: 3 },
};

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

// ─── Add Task Modal ────────────────────────────────────────────────────────────
function AddModal({ onClose, onAdd }) {
    const [f, setF] = useState({ title: "", course: "", courseCode: "", type: "assignment", priority: "medium", due: "", dueTime: "23:59", tags: "", description: "" });
    const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
    const inp = { width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fafafa", transition: "all 0.2s" };
    const focus = e => { e.target.style.borderColor = "#4338ca"; e.target.style.boxShadow = "0 0 0 3px rgba(67,56,202,.1)"; e.target.style.background = "#fff"; };
    const blur = e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; e.target.style.background = "#fafafa"; };
    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.2)" }}>
                <div style={{ padding: "22px 26px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "white", zIndex: 1 }}>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: 0 }}>Tambah Tugas Baru</h3>
                        <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>Isi detail tugas yang ingin ditambahkan</p>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, borderRadius: 8 }}><X size={18} /></button>
                </div>
                <div style={{ padding: "20px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                        { label: "Nama Tugas *", key: "title", type: "text", ph: "Contoh: Review Paper Deep Learning" },
                        { label: "Mata Kuliah *", key: "course", type: "text", ph: "Contoh: Kecerdasan Buatan" },
                        { label: "Kode MK", key: "courseCode", type: "text", ph: "IF4120" },
                        { label: "Deskripsi", key: "description", type: "text", ph: "Deskripsi singkat tugas..." },
                        { label: "Tags", key: "tags", type: "text", ph: "coding, review, ai (pisah koma)" },
                    ].map(fi => (
                        <div key={fi.key}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>{fi.label}</label>
                            <input type={fi.type} value={f[fi.key]} onChange={s(fi.key)} placeholder={fi.ph} style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                    ))}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>Deadline *</label>
                            <input type="date" value={f.due} onChange={s("due")} style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>Jam</label>
                            <input type="time" value={f.dueTime} onChange={s("dueTime")} style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>Tipe</label>
                            <select value={f.type} onChange={s("type")} style={{ ...inp, appearance: "none" }}>
                                <option value="assignment">Assignment</option>
                                <option value="exam">Exam</option>
                                <option value="meeting">Meeting</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>Prioritas</label>
                            <select value={f.priority} onChange={s("priority")} style={{ ...inp, appearance: "none" }}>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div style={{ padding: "16px 26px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 10, position: "sticky", bottom: 0, background: "white" }}>
                    <button onClick={() => {
                        if (!f.title.trim() || !f.course.trim() || !f.due) return;
                        onAdd({ ...f, id: Date.now(), status: "pending", progress: 0, tags: f.tags ? f.tags.split(",").map(t => t.trim()).filter(Boolean) : [] });
                        onClose();
                    }} style={{ flex: 1, padding: 13, borderRadius: 13, border: "none", background: "linear-gradient(135deg,#4338ca,#6366f1)", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(67,56,202,.3)" }}>
                        + Tambah Tugas
                    </button>
                    <button onClick={onClose} style={{ padding: "13px 20px", borderRadius: 13, border: "1.5px solid #e5e7eb", background: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>Batal</button>
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
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 400, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,.2)" }}>
                <div style={{ padding: "20px 26px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: 0 }}>Gabung Tugas</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}><X size={18} /></button>
                </div>
                <div style={{ padding: "20px 26px" }}>
                    <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#000' }}>
                        <Scanner onScan={(result) => { if(result && result.length > 0) handleJoin(result[0].rawValue); }} />
                    </div>
                    {error && <p style={{ color: "#dc2626", fontSize: 12, marginBottom: 10 }}>{error}</p>}
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Atau Masukkan Kode Tugas</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input value={kode} onChange={e => setKode(e.target.value.toUpperCase())} placeholder="KODE (cth: ABCDEF)" style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 13, textTransform: "uppercase" }} />
                        <button onClick={() => handleJoin(kode)} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: "#4338ca", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Gabung</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onToggle, onDelete, onClick }) {
    const tc = TYPE_CFG[task.type] || TYPE_CFG.assignment;
    const pc = PRI_CFG[task.priority] || PRI_CFG.medium;
    const dl = daysLeft(task.due, task.dueTime);
    const done = task.status === "completed";
    const overdue = dl < 0 && !done;
    const urgent = dl === 0 && !done;
    const TIcon = tc.icon;
    const [menuOpen, setMenu] = useState(false);

    return (
        <div style={{
            background: "white", borderRadius: 20,
            padding: "18px 18px 18px 22px",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 1px 4px rgba(0,0,0,.06)",
            border: `1.5px solid ${overdue ? "#fecaca" : urgent ? "#fed7aa" : "#f3f4f6"}`,
            cursor: "pointer", transition: "all 0.18s",
            opacity: done ? 0.7 : 1,
            position: "relative", overflow: "visible",
        }}
            onClick={() => onClick(task)}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 28px rgba(0,0,0,.1)`; e.currentTarget.style.borderColor = done ? "#d1fae5" : overdue ? "#fca5a5" : urgent ? "#fdba74" : `${pc.dot}40`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.06)"; e.currentTarget.style.borderColor = overdue ? "#fecaca" : urgent ? "#fed7aa" : "#f3f4f6"; }}
        >
            {/* Priority accent bar */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, borderRadius: "20px 0 0 20px", background: done ? "#16a34a" : pc.dot }} />

            {/* Checkbox */}
            <div onClick={e => { e.stopPropagation(); onToggle(task.id); }}
                style={{ flexShrink: 0, cursor: "pointer", transition: "transform .15s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                onMouseLeave={e => e.currentTarget.style.transform = ""}>
                {done
                    ? <CheckCircle2 size={22} color="#16a34a" fill="#f0fdf4" />
                    : <Circle size={22} color="#d1d5db" />}
            </div>

            {/* Body */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Badges row */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 7, alignItems: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 7, fontSize: 10, fontWeight: 700, background: tc.bg, color: tc.color }}>
                        <TIcon size={10} />{tc.label}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 7, fontSize: 10, fontWeight: 700, background: pc.bg, color: pc.color }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: pc.dot, flexShrink: 0 }} />
                        {pc.label}
                    </span>
                    {task.tags.slice(0, 2).map(t => (
                        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 7, fontSize: 10, fontWeight: 600, background: "#f3f4f6", color: "#6b7280" }}>
                            <Tag size={9} />{t}
                        </span>
                    ))}
                </div>

                {/* Title */}
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#111827", margin: "0 0 3px", textDecoration: done ? "line-through" : "none", color: done ? "#9ca3af" : "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</h3>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 10px" }}>{task.course} · {task.courseCode}</p>

                {/* Progress */}
                {task.progress > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ flex: 1, height: 5, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${task.progress}%`, background: done ? "#16a34a" : pc.dot, borderRadius: 99, transition: "width .5s ease" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: done ? "#16a34a" : pc.color, minWidth: 30 }}>{task.progress}%</span>
                    </div>
                )}

                {/* Footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#9ca3af" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{fmtDate(task.due)}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} />{task.dueTime}</span>
                    </div>
                    <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
                        background: done ? "#f0fdf4" : overdue ? "#fee2e2" : urgent ? "#fff7ed" : "#f3f4f6",
                        color: done ? "#16a34a" : overdue ? "#dc2626" : urgent ? "#ea580c" : "#6b7280",
                    }}>
                        {done ? "✓ Selesai" : overdue ? "Terlambat!" : urgent ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Flame size={10} />Hari ini!</span> : `${dl} hari lagi`}
                    </span>
                </div>
            </div>

            {/* Menu + Arrow */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0, position: "relative" }}>
                <button onClick={e => { e.stopPropagation(); setMenu(v => !v); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: "4px", borderRadius: 8, transition: "all .15s", display: "flex" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#374151"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#d1d5db"; }}>
                    <MoreHorizontal size={16} />
                </button>
                <ArrowUpRight size={15} color="#d1d5db" />

                {menuOpen && (
                    <div onClick={e => e.stopPropagation()} style={{ position: "absolute", right: 0, top: 28, background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,.15)", border: "1px solid #e5e7eb", zIndex: 100, overflow: "hidden", minWidth: 140 }}>
                        <button onClick={() => { onToggle(task.id); setMenu(false); }}
                            style={{ width: "100%", padding: "10px 14px", border: "none", background: "none", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}>
                            <CheckCircle2 size={13} color="#16a34a" />
                            {task.status === "completed" ? "Tandai Aktif" : "Tandai Selesai"}
                        </button>
                        <button onClick={() => { onClick(task); setMenu(false); }}
                            style={{ width: "100%", padding: "10px 14px", border: "none", background: "none", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}>
                            <Edit3 size={13} color="#4338ca" />Detail Tugas
                        </button>
                        <div style={{ height: 1, background: "#f3f4f6", margin: "4px 0" }} />
                        <button onClick={() => { onDelete(task.id); setMenu(false); }}
                            style={{ width: "100%", padding: "10px 14px", border: "none", background: "none", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}>
                            <Trash2 size={13} />Hapus
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
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("all");
    const [showFilter, setShowFilter] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [fType, setFType] = useState("all");
    const [fPri, setFPri] = useState("all");
    const [sort, setSort] = useState("due");

    useEffect(() => {
        axiosClient.get('/mahasiswa/tasks')
            .then(({ data }) => {
                const mapped = data.map(item => ({
                    id: item.task.id_task,
                    submissionId: item.submission?.id || null,
                    title: item.task.nama_tugas || "-",
                    course: item.task.nama_matkul || "Umum",
                    courseCode: item.task.mata_kuliah?.kode_mk || "-",
                    type: "assignment",
                    priority: item.task.prioritas || "medium",
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

    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task && task.status !== "completed") {
            alert("Harap buka Detail Tugas dan unggah dokumen (Upload Tugas) untuk menyelesaikan tugas ini.");
            return;
        }
    }
    function deleteTask(id) { setTasks(ts => ts.filter(t => t.id !== id)); }
    function addTask(task) { setTasks(ts => [{ ...task }, ...ts]); }

    const filtered = useMemo(() => {
        return tasks
            .filter(t => {
                const q = search.toLowerCase();
                const mQ = !q || t.title.toLowerCase().includes(q) || t.course.toLowerCase().includes(q);
                const mS = tab === "all" || t.status === tab;
                const mT = fType === "all" || t.type === fType;
                const mP = fPri === "all" || t.priority === fPri;
                return mQ && mS && mT && mP;
            })
            .sort((a, b) => {
                if (sort === "due") return new Date(a.due) - new Date(b.due);
                if (sort === "priority") return (PRI_CFG[a.priority]?.rank ?? 9) - (PRI_CFG[b.priority]?.rank ?? 9);
                return a.title.localeCompare(b.title);
            });
    }, [tasks, search, tab, fType, fPri, sort]);

    const total = tasks.length;
    const done = tasks.filter(t => t.status === "completed").length;
    const inProg = tasks.filter(t => t.status === "in_progress").length;
    const pending = tasks.filter(t => t.status === "pending").length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const activeFilters = [fType, fPri].filter(f => f !== "all").length;

    const TABS = [
        { key: "all", label: "Semua", count: total },
        { key: "in_progress", label: "Dikerjakan", count: inProg },
        { key: "pending", label: "Belum Mulai", count: pending },
        { key: "completed", label: "Selesai", count: done },
    ];

    return (
        <div className="app-wrapper">
            {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={addTask} />}
            <Sidebar />
            <main className="main-content">
                <style>{`
                    .tk-stat:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(0,0,0,.08) !important; }
                `}</style>

                {/* ── TOPBAR ── */}
                <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="topbar__title">Tugas</h1>
                        <p className="topbar__subtitle">Daftar semua tugas yang harus kamu selesaikan.</p>
                    </div>
                    <div className="topbar__actions">
                        <button onClick={() => setShowJoin(true)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: 13, textDecoration: "none", cursor: "pointer", border: "none", borderRadius: 12, background: "#4338ca", color: "white", fontWeight: 600 }}>
                            <QrCode size={15} /> Gabung Tugas
                        </button>
                    </div>
                </div>

                {/* ── STATS ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
                    {[
                        { label: "Total Tugas", val: total, color: "#111827", bg: "#f9fafb", icon: Target },
                        { label: "Dikerjakan", val: inProg, color: "#4338ca", bg: "#eef2ff", icon: Zap },
                        { label: "Belum Mulai", val: pending, color: "#ea580c", bg: "#fff7ed", icon: Clock },
                        { label: "Selesai", val: done, color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="tk-stat" style={{ background: "white", borderRadius: 18, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,.06)", transition: "all .2s", border: "1.5px solid #f3f4f6", cursor: "pointer" }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon size={20} color={s.color} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 24, fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>{s.val}</p>
                                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "3px 0 0" }}>{s.label}</p>
                                </div>
                            </div>
                        );
                    })}
                    {/* Progress strip */}
                    <div style={{ gridColumn: "1/-1", height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden", display: "flex" }}>
                        <div style={{ width: `${(done / total) * 100}%`, background: "#16a34a", transition: "width .5s ease" }} />
                        <div style={{ width: `${(inProg / total) * 100}%`, background: "#4338ca", transition: "width .5s ease" }} />
                        <div style={{ width: `${(pending / total) * 100}%`, background: "#f97316", transition: "width .5s ease" }} />
                    </div>
                </div>

                {/* ── TOOLBAR ── */}
                <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                    {/* Search */}
                    <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                        <Search size={15} style={{ position: "absolute", left: 14, color: "#9ca3af", pointerEvents: "none" }} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Cari tugas atau mata kuliah…"
                            style={{ width: "100%", padding: "11px 14px 11px 40px", border: "1.5px solid #e5e7eb", borderRadius: 14, fontSize: 13, fontFamily: "inherit", outline: "none", transition: "all .2s", background: "white", boxSizing: "border-box" }}
                            onFocus={e => { e.target.style.borderColor = "#4338ca"; e.target.style.boxShadow = "0 0 0 3px rgba(67,56,202,.1)"; }}
                            onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                        />
                        {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex" }}><X size={13} /></button>}
                    </div>
                    {/* Filter */}
                    <button onClick={() => setShowFilter(v => !v)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", background: showFilter ? "#eef2ff" : "white", border: `1.5px solid ${showFilter ? "#4338ca" : "#e5e7eb"}`, borderRadius: 14, fontSize: 13, fontWeight: 600, color: showFilter ? "#4338ca" : "#374151", cursor: "pointer", fontFamily: "inherit", transition: "all .2s", position: "relative" }}>
                        <SlidersHorizontal size={15} />
                        Filter
                        {activeFilters > 0 && <span style={{ background: "#4338ca", color: "white", borderRadius: "50%", fontSize: 10, fontWeight: 700, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>{activeFilters}</span>}
                    </button>
                    {/* Sort */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "10px 14px", position: "relative" }}>
                        <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, whiteSpace: "nowrap" }}>Urutkan:</span>
                        <select value={sort} onChange={e => setSort(e.target.value)}
                            style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", fontFamily: "inherit", outline: "none", appearance: "none", paddingRight: 18 }}>
                            <option value="due">Deadline</option>
                            <option value="priority">Prioritas</option>
                            <option value="title">Nama</option>
                        </select>
                        <ChevronDown size={13} style={{ position: "absolute", right: 10, color: "#9ca3af", pointerEvents: "none" }} />
                    </div>
                </div>

                {/* ── FILTER PANEL ── */}
                {showFilter && (
                    <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 18, padding: "18px 22px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start", animation: "fadeSlideDown .2s ease" }}>
                        <style>{`@keyframes fadeSlideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
                        {[
                            { label: "TIPE", opts: [{ v: "all", l: "Semua" }, { v: "assignment", l: "Assignment" }, { v: "exam", l: "Exam" }, { v: "meeting", l: "Meeting" }], val: fType, set: setFType },
                            { label: "PRIORITAS", opts: [{ v: "all", l: "Semua" }, { v: "urgent", l: "Urgent" }, { v: "high", l: "High" }, { v: "medium", l: "Medium" }, { v: "low", l: "Low" }], val: fPri, set: setFPri },
                        ].map(group => (
                            <div key={group.label} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", width: 60, flexShrink: 0 }}>{group.label}</span>
                                {group.opts.map(o => (
                                    <button key={o.v} onClick={() => group.set(o.v)}
                                        style={{ padding: "5px 13px", borderRadius: 8, border: `1.5px solid ${group.val === o.v ? "#4338ca" : "#e5e7eb"}`, background: group.val === o.v ? "#4338ca" : "white", fontSize: 12, fontWeight: 600, color: group.val === o.v ? "white" : "#374151", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                                        {o.l}
                                    </button>
                                ))}
                            </div>
                        ))}
                        {activeFilters > 0 && (
                            <button onClick={() => { setFType("all"); setFPri("all"); }}
                                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#fee2e2", border: "none", borderRadius: 8, color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginLeft: "auto" }}>
                                <X size={12} />Reset Filter
                            </button>
                        )}
                    </div>
                )}

                {/* ── TABS ── */}
                <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "white", borderRadius: 16, padding: 6, width: "fit-content", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
                    {TABS.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 12, border: "none", background: tab === t.key ? "#4338ca" : "none", fontSize: 13, fontWeight: 600, color: tab === t.key ? "white" : "#6b7280", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                            {t.label}
                            <span style={{ background: tab === t.key ? "rgba(255,255,255,.25)" : "rgba(0,0,0,.08)", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "1px 7px", minWidth: 22, textAlign: "center" }}>{t.count}</span>
                        </button>
                    ))}
                </div>

                {/* ── LIST ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {loading ? (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>Memuat tugas...</div>
                    ) : filtered.length === 0
                        ? (
                            <div style={{ background: "white", borderRadius: 20, padding: "60px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
                                <p style={{ fontSize: 42, marginBottom: 12 }}>📭</p>
                                <p style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>Tidak ada tugas ditemukan</p>
                                <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Coba ubah filter atau kata kunci pencarian.</p>
                            </div>
                        )
                        : filtered.map(task => (
                            <TaskCard key={task.id} task={task}
                                onToggle={toggleTask}
                                onDelete={deleteTask}

                                onClick={t => navigate("/mahasiswa/tasks/detail", { state: { taskId: t.id } })}

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