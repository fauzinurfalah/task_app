import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosClient from "../../axiosClient";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/NotificationBell";
import { ChevronLeft, Search, Filter, CheckCircle2, Clock, FileText, CheckCircle, AlertTriangle, HelpCircle, X, Check } from "lucide-react";

export default function DosenSubmissions() {
    const [params]    = useSearchParams();
    const taskIdParam = params.get("task");
    const [taskFilters, setTaskFilters] = useState(taskIdParam ? [parseInt(taskIdParam)] : []);
    const [statusFilters, setStatusFilters] = useState([]);
    const [search, setSearch] = useState("");
    const [showSidebar, setShowSidebar] = useState(false);

    const [submissions, setSubmissions] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get('/dosen/submissions')
            .then(({ data }) => {
                const mapped = data.map(s => ({
                    id: s.id,
                    taskId: s.task_id,
                    taskName: s.task?.nama_tugas || "Unknown",
                    name: s.user?.name || "Unknown",
                    nim: s.user?.nim || "-",
                    file: s.file ? s.file.split('/').pop() : null,
                    filePath: s.file,
                    status: s.status,
                    grade: s.grade,
                    submittedAt: new Date(s.created_at).toLocaleString('id-ID'),
                }));
                setSubmissions(mapped);
                
                // Extract unique tasks
                const uniqueTasks = {};
                data.forEach(s => {
                    if (s.task) {
                        uniqueTasks[s.task.id_task] = {
                            id: s.task.id_task,
                            name: s.task.nama_tugas,
                            deadline: s.task.deadline
                        };
                    }
                });
                
                // Sort tasks by deadline desc (newest first)
                const sortedTasks = Object.values(uniqueTasks).sort((a, b) => {
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(b.deadline) - new Date(a.deadline);
                });
                setTasks(sortedTasks);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const STATUS_OPTS = [
        { key: "submitted", label: "Dikumpulkan" },
        { key: "late", label: "Terlambat" },
        { key: "pending", label: "Belum Mengumpul" },
    ];

    const data = submissions.filter(s => {
        const matchTask = taskFilters.length === 0 || taskFilters.includes(parseInt(s.taskId));
        const sStatus = s.status === "graded" ? "submitted" : s.status;
        const matchStatus = statusFilters.length === 0 || statusFilters.includes(sStatus);
        
        const q = search.toLowerCase();
        const matchSearch = !search || 
            (s.name && s.name.toLowerCase().includes(q)) || 
            (s.nim && s.nim.toLowerCase().includes(q)) ||
            (s.taskName && s.taskName.toLowerCase().includes(q));
            
        return matchTask && matchStatus && matchSearch;
    });

    const counts = {
        all:       submissions.length,
        submitted: submissions.filter(s => s.status === "submitted" || s.status === "graded").length,
        late:      submissions.filter(s => s.status === "late").length,
        pending:   submissions.filter(s => s.status === "pending").length,
    };

    const toggleTaskFilter = (id) => {
        setTaskFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
    };

    const toggleStatusFilter = (status) => {
        setStatusFilters(prev => prev.includes(status) ? prev.filter(f => f !== status) : [...prev, status]);
    };

    return (
        <div className="app-wrapper" style={{ overflowX: "hidden", position: "relative" }}>
            <Sidebar role="dosen" />
            <main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px", minHeight: "100vh", paddingRight: showSidebar ? 320 : 48, transition: "padding-right 0.3s ease" }}>

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
                        const isActive = c.key === "all" ? statusFilters.length === 0 : statusFilters.includes(c.key);
                        return (
                            <button
                                key={c.key}
                                onClick={() => {
                                    if(c.key === "all") setStatusFilters([]);
                                    else toggleStatusFilter(c.key);
                                }}
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
                <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "white", padding: "14px 20px", borderRadius: 16, border: "1px solid #e2e8f0", flex: "1 1 300px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                        <Search size={18} color="#94a3b8" />
                        <input placeholder="Cari nama tugas, mahasiswa, atau NIM..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: "none", outline: "none", fontSize: 14, fontFamily: "inherit", width: "100%", fontWeight: 600, color: "#0f172a", background: "transparent" }} />
                        {search && <button onClick={() => setSearch("")} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", display: "flex", padding: 6, borderRadius: "50%" }}><X size={14} /></button>}
                    </div>
                    
                    <button onClick={() => setShowSidebar(true)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(79,70,229,0.2)" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                        <Filter size={18} /> Filter Pengumpulan
                        {(taskFilters.length > 0 || statusFilters.length > 0) && (
                            <span style={{ background: "white", color: "#4f46e5", padding: "2px 8px", borderRadius: 10, fontSize: 12 }}>{taskFilters.length + statusFilters.length}</span>
                        )}
                    </button>
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
                    tasks.map((task) => {
                        const taskSubs = data.filter(s => s.taskId == task.id);
                        if (taskSubs.length === 0) return null;
                        
                        return (
                            <div key={task.id} style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", marginBottom: 24 }}>
                                <div style={{ padding: "24px 32px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ea580c" }} />
                                        {task.name}
                                    </h3>
                                    <span style={{ padding: "6px 14px", borderRadius: 12, background: "white", border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 800, color: "#475569" }}>
                                        {taskSubs.length} Pengumpulan
                                    </span>
                                </div>
                                
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", tableLayout: "fixed" }}>
                                        <thead>
                                            <tr style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>
                                                <th style={{ width: "25%", padding: "16px 32px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mahasiswa</th>
                                                <th style={{ width: "20%", padding: "16px 20px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Waktu Pengumpulan</th>
                                                <th style={{ width: "20%", padding: "16px 20px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>File</th>
                                                <th style={{ width: "12%", padding: "16px 20px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                                                <th style={{ width: "8%", padding: "16px 20px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Nilai</th>
                                                <th style={{ width: "15%", padding: "16px 32px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Aksi</th>
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
                                                            s.grade !== null ? (
                                                                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#94a3b8", fontSize: 13, fontWeight: 800, cursor: "not-allowed" }}>
                                                                    <CheckCircle2 size={14} color="#94a3b8" /> Dinilai
                                                                </span>
                                                            ) : (
                                                                <Link to={`/dosen/grading?submission=${s.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, background: "white", border: "1.5px solid #e2e8f0", color: "#0f172a", fontSize: 13, fontWeight: 800, textDecoration: "none", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }} onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
                                                                    <CheckCircle2 size={14} color="#4f46e5" /> Nilai
                                                                </Link>
                                                            )
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

            {/* FILTER SIDEBAR */}
            <div style={{ position: "fixed", top: 0, right: showSidebar ? 0 : -320, bottom: 0, width: 320, background: "white", boxShadow: "-4px 0 24px rgba(0,0,0,0.05)", zIndex: 100, transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: 0 }}>Filter Pengumpulan</h3>
                    <button onClick={() => setShowSidebar(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}><X size={20} /></button>
                </div>
                
                <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                    {/* Filter Tugas */}
                    <div style={{ marginBottom: 32 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>Tugas</h4>
                        
                        {/* Semua Tugas toggle */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }} onClick={() => setTaskFilters([])}>
                            <div style={{ width: 20, height: 20, borderRadius: 6, border: "2px solid", borderColor: taskFilters.length === 0 ? "#4f46e5" : "#cbd5e1", background: taskFilters.length === 0 ? "#4f46e5" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                                {taskFilters.length === 0 && <Check size={14} color="white" strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: taskFilters.length === 0 ? 800 : 600, color: taskFilters.length === 0 ? "#0f172a" : "#475569" }}>Semua Tugas</span>
                        </div>

                        {tasks.map(t => {
                            const isChecked = taskFilters.includes(t.id);
                            return (
                                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }} onClick={() => toggleTaskFilter(t.id)}>
                                    <div style={{ width: 20, height: 20, borderRadius: 6, border: "2px solid", borderColor: isChecked ? "#4f46e5" : "#cbd5e1", background: isChecked ? "#4f46e5" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                                        {isChecked && <Check size={14} color="white" strokeWidth={3} />}
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: isChecked ? 800 : 600, color: isChecked ? "#0f172a" : "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Filter Status */}
                    <div>
                        <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>Status Pengumpulan</h4>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }} onClick={() => setStatusFilters([])}>
                            <div style={{ width: 20, height: 20, borderRadius: 6, border: "2px solid", borderColor: statusFilters.length === 0 ? "#4f46e5" : "#cbd5e1", background: statusFilters.length === 0 ? "#4f46e5" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                                {statusFilters.length === 0 && <Check size={14} color="white" strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: statusFilters.length === 0 ? 800 : 600, color: statusFilters.length === 0 ? "#0f172a" : "#475569" }}>Semua Status</span>
                        </div>

                        {STATUS_OPTS.map(o => {
                            const isChecked = statusFilters.includes(o.key);
                            return (
                                <div key={o.key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }} onClick={() => toggleStatusFilter(o.key)}>
                                    <div style={{ width: 20, height: 20, borderRadius: 6, border: "2px solid", borderColor: isChecked ? "#4f46e5" : "#cbd5e1", background: isChecked ? "#4f46e5" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                                        {isChecked && <Check size={14} color="white" strokeWidth={3} />}
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: isChecked ? 800 : 600, color: isChecked ? "#0f172a" : "#475569" }}>{o.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ padding: "24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 12 }}>
                    <button onClick={() => { setTaskFilters([]); setStatusFilters([]); setSearch(""); setShowSidebar(false); }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", color: "#0f172a", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Reset</button>
                    <button onClick={() => setShowSidebar(false)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(79,70,229,0.2)" }}>Terapkan</button>
                </div>
            </div>
            {/* Sidebar Overlay */}
            {showSidebar && (
                <div onClick={() => setShowSidebar(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 90, backdropFilter: "blur(2px)" }} />
            )}
        </div>
    );
}
