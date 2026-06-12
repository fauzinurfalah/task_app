import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosClient from "../../axiosClient";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/NotificationBell";
import { ChevronLeft, Download, Search, Filter, CheckCircle2, Clock, FileText, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";

// ─── Submissions Page ─────────────────────────────────────────────────────────
export default function DosenSubmissions() {
    const [params]    = useSearchParams();
    const taskIdParam = params.get("task");
    const [taskFilter, setTaskFilter] = useState(taskIdParam ? parseInt(taskIdParam) : "all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const [submissions, setSubmissions] = useState([]);
    const [tasks, setTasks] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get('/dosen/submissions')
            .then(({ data }) => {
                const mapped = data.map(s => ({
                    id: s.id,
                    taskId: s.task_id,
                    name: s.user?.name || "Unknown",
                    nim: s.user?.nim || "-",
                    file: s.file ? s.file.split('/').pop() : null,
                    filePath: s.file,
                    status: s.status,
                    grade: s.points,
                    submittedAt: new Date(s.created_at).toLocaleString('id-ID'),
                }));
                setSubmissions(mapped);
                
                // Extract unique tasks for filter
                const uniqueTasks = {};
                data.forEach(s => {
                    if (s.task) uniqueTasks[s.task.id_task] = s.task.nama_tugas;
                });
                setTasks(uniqueTasks);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const data = submissions.filter(s => {
        const matchTask   = taskFilter === "all" || s.taskId == taskFilter;
        const matchStatus = statusFilter === "all" || s.status === statusFilter;
        const matchSearch = (s.name && s.name.toLowerCase().includes(search.toLowerCase())) || (s.nim && s.nim.includes(search));
        return matchTask && matchStatus && matchSearch;
    });

    const counts = {
        all:       submissions.length,
        submitted: submissions.filter(s => s.status === "submitted" || s.status === "graded").length,
        late:      submissions.filter(s => s.status === "late").length,
        pending:   submissions.filter(s => s.status === "pending").length,
    };

    return (
        <div className="app-wrapper">
            <Sidebar role="dosen" />
            <main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px", minHeight: "100vh" }}>

                {/* BREADCRUMB */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 700, marginBottom: 28 }}>
                    <Link to="/dosen/tasks" style={{ color: "#64748b", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#0f172a"} onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
                        <ChevronLeft size={16} /> Kelola Tugas
                    </Link>
                    <span style={{ color: "#cbd5e1" }}>/</span>
                    <span style={{ color: "#ea580c", background: "#fff7ed", padding: "4px 10px", borderRadius: 8 }}>Pengumpulan</span>
                </div>

                {/* TOPBAR */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.5px" }}>Pengumpulan Mahasiswa</h1>
                        <p style={{ fontSize: 15, color: "#64748b", margin: 0, fontWeight: 600 }}>Pantau dan unduh semua file pengumpulan tugas.</p>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                        <NotificationBell />
                    </div>
                </div>

                {/* STAT CHIPS */}
                <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
                    {[
                        { key: "all",       label: "Semua Pengumpulan", icon: FileText,      count: counts.all,       bg: "#f1f5f9", activeBg: "#0f172a", activeColor: "white", activeBadgeBg: "rgba(255,255,255,0.2)" },
                        { key: "submitted", label: "Dikumpulkan",       icon: CheckCircle,   count: counts.submitted, bg: "#ecfdf5", activeBg: "#10b981", activeColor: "white", activeBadgeBg: "rgba(255,255,255,0.3)" },
                        { key: "late",      label: "Terlambat",         icon: AlertTriangle, count: counts.late,      bg: "#fef2f2", activeBg: "#ef4444", activeColor: "white", activeBadgeBg: "rgba(255,255,255,0.3)" },
                        { key: "pending",   label: "Belum Mengumpul",   icon: HelpCircle,    count: counts.pending,   bg: "#f8fafc", activeBg: "#64748b", activeColor: "white", activeBadgeBg: "rgba(255,255,255,0.3)", border: "1px solid #e2e8f0" },
                    ].map(c => {
                        const Icon = c.icon;
                        const isActive = statusFilter === c.key;
                        return (
                            <button
                                key={c.key}
                                onClick={() => setStatusFilter(c.key)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderRadius: 16, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                                    border: isActive ? "1px solid transparent" : (c.border || "1px solid transparent"),
                                    background: isActive ? c.activeBg : c.bg,
                                    color: isActive ? c.activeColor : "#475569",
                                    fontSize: 14, fontWeight: 700,
                                    boxShadow: isActive ? `0 4px 12px ${c.activeBg}40` : "none"
                                }}
                            >
                                <Icon size={18} />
                                {c.label}
                                <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 800, padding: "2px 8px", borderRadius: 10, background: isActive ? c.activeBadgeBg : "rgba(0,0,0,0.06)", color: isActive ? "white" : "#0f172a" }}>{c.count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* TOOLBAR */}
                <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "white", padding: "12px 20px", borderRadius: 16, border: "1px solid #e2e8f0", flex: "1 1 300px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                        <Search size={18} color="#94a3b8" />
                        <input placeholder="Cari nama atau NIM..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: "none", outline: "none", fontSize: 14, fontFamily: "inherit", width: "100%", fontWeight: 600, color: "#0f172a", background: "transparent" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", padding: "8px", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px", color: "#64748b", fontWeight: 700, fontSize: 13 }}><Filter size={16} /> Filter Tugas:</div>
                        <button style={{ padding: "8px 16px", borderRadius: 12, border: "none", background: taskFilter === "all" ? "#ea580c" : "transparent", color: taskFilter === "all" ? "white" : "#64748b", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }} onClick={() => setTaskFilter("all")}>Semua Tugas</button>
                        {Object.entries(tasks)
                            .filter(([id]) => taskIdParam ? id == taskIdParam : true)
                            .map(([id, name]) => (
                            <button key={id} style={{ padding: "8px 16px", borderRadius: 12, border: "none", background: taskFilter === parseInt(id) ? "#ea580c" : "transparent", color: taskFilter === parseInt(id) ? "white" : "#64748b", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }} onClick={() => setTaskFilter(parseInt(id))}>
                                {name.split(" ").slice(0, 3).join(" ")}{name.split(" ").length > 3 ? "..." : ""}
                            </button>
                        ))}
                    </div>
                </div>

                {/* DATA DISPLAY */}
                {loading ? (
                    <div style={{ background: "white", borderRadius: 24, padding: "60px", textAlign: "center", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "#64748b" }}>Memuat data pengumpulan...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div style={{ background: "white", borderRadius: 24, padding: "80px 20px", textAlign: "center", border: "2px dashed #e2e8f0" }}>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><FileText size={32} color="#cbd5e1" /></div>
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Tidak Ada Data</h3>
                        <p style={{ fontSize: 15, color: "#64748b", margin: 0 }}>Belum ada pengumpulan yang sesuai dengan filter Anda.</p>
                    </div>
                ) : (
                    Object.entries(tasks).map(([taskId, taskName]) => {
                        const taskSubs = data.filter(s => s.taskId == taskId);
                        if (taskSubs.length === 0) return null;
                        
                        return (
                            <div key={taskId} style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", marginBottom: 24 }}>
                                <div style={{ padding: "24px 32px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ea580c" }} />
                                        {taskName}
                                    </h3>
                                    <span style={{ padding: "6px 14px", borderRadius: 12, background: "white", border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 800, color: "#475569" }}>
                                        {taskSubs.length} Pengumpulan
                                    </span>
                                </div>
                                
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                        <thead>
                                            <tr style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>
                                                <th style={{ padding: "16px 32px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mahasiswa</th>
                                                <th style={{ padding: "16px 20px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Waktu Pengumpulan</th>
                                                <th style={{ padding: "16px 20px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>File</th>
                                                <th style={{ padding: "16px 20px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                                                <th style={{ padding: "16px 20px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Nilai</th>
                                                <th style={{ padding: "16px 32px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {taskSubs.map((s, i) => (
                                                <tr key={s.id} style={{ borderBottom: i === taskSubs.length - 1 ? "none" : "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                    <td style={{ padding: "20px 32px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                                                                {s.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", margin: "0 0 4px" }}>{s.name}</p>
                                                                <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: 0 }}>{s.nim}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "20px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#475569" }}>
                                                            <Clock size={14} color="#94a3b8" />{s.submittedAt}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "20px" }}>
                                                        {s.file
                                                            ? <a href={`http://127.0.0.1:8000/storage/${s.filePath}?download=1`} download={s.file} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "6px 12px", borderRadius: 10, textDecoration: "none", transition: "all 0.2s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }} onMouseEnter={e => e.currentTarget.style.background = "#e0e7ff"} onMouseLeave={e => e.currentTarget.style.background = "#eef2ff"}><FileText size={14} />{s.file}</a>
                                                            : <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>—</span>
                                                        }
                                                    </td>
                                                    <td style={{ padding: "20px" }}>
                                                        <span style={{
                                                            display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 800,
                                                            background: s.status === "submitted" || s.status === "graded" ? "#ecfdf5" : s.status === "late" ? "#fef2f2" : "#f1f5f9",
                                                            color: s.status === "submitted" || s.status === "graded" ? "#059669" : s.status === "late" ? "#dc2626" : "#64748b",
                                                            border: `1px solid ${s.status === "submitted" || s.status === "graded" ? "#a7f3d0" : s.status === "late" ? "#fecaca" : "#e2e8f0"}`
                                                        }}>
                                                            {s.status === "submitted" || s.status === "graded" ? "Dikumpulkan" : s.status === "late" ? "Terlambat" : "Belum"}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "20px" }}>
                                                        {s.grade !== null
                                                            ? <span style={{ display: "inline-block", background: s.grade >= 80 ? "#ecfdf5" : s.grade >= 60 ? "#fff7ed" : "#fef2f2", color: s.grade >= 80 ? "#10b981" : s.grade >= 60 ? "#ea580c" : "#dc2626", padding: "6px 12px", borderRadius: 10, fontWeight: 900, fontSize: 14 }}>{s.grade}</span>
                                                            : <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>—</span>
                                                        }
                                                    </td>
                                                    <td style={{ padding: "20px 32px" }}>
                                                        {s.status !== "pending" && (
                                                            <Link to={`/dosen/grading?submission=${s.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, background: "white", border: "1.5px solid #e2e8f0", color: "#0f172a", fontSize: 13, fontWeight: 800, textDecoration: "none", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }} onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
                                                                <CheckCircle2 size={14} color="#4f46e5" /> Nilai
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })
                )}

            </main>
        </div>
    );
}
