import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosClient from "../../axiosClient";
import Sidebar from "../../components/Sidebar";
import { ChevronLeft, Download, Search, Filter, CheckCircle2, Clock, FileText } from "lucide-react";

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
            <main className="main-content">

                {/* BREADCRUMB */}
                <div className="breadcrumb">
                    <Link to="/dosen/tasks" className="breadcrumb__link"><ChevronLeft size={14} /> Kelola Tugas</Link>
                    <span className="breadcrumb__sep">/</span>
                    <span className="breadcrumb__current">Pengumpulan</span>
                </div>

                {/* TOPBAR */}
                <div className="topbar" style={{ marginTop: 8 }}>
                    <div>
                        <h1 className="topbar__title">Pengumpulan Mahasiswa</h1>
                        <p className="topbar__subtitle">Pantau dan unduh semua file pengumpulan tugas.</p>
                    </div>
                </div>

                {/* STAT CHIPS */}
                <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                    {[
                        { key: "all",       label: "Semua",       cls: "",              count: counts.all       },
                        { key: "submitted", label: "Dikumpulkan", cls: "status--green", count: counts.submitted },
                        { key: "late",      label: "Terlambat",   cls: "status--red",   count: counts.late      },
                        { key: "pending",   label: "Belum",       cls: "status--gray",  count: counts.pending   },
                    ].map(c => (
                        <button
                            key={c.key}
                            className={`filter-tab ${statusFilter === c.key ? "filter-tab--active" : ""}`}
                            onClick={() => setStatusFilter(c.key)}
                        >
                            {c.label} <span className={`status-badge ${c.cls}`} style={{ marginLeft: 6, fontSize: 10 }}>{c.count}</span>
                        </button>
                    ))}
                </div>

                {/* TOOLBAR */}
                <div className="page-toolbar" style={{ marginBottom: 16 }}>
                    <div className="search-box">
                        <Search size={15} color="#9ca3af" />
                        <input className="search-box__input" placeholder="Cari nama atau NIM..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="filter-tabs">
                        <Filter size={14} color="#6b7280" />
                        <button className={`filter-tab ${taskFilter === "all" ? "filter-tab--active" : ""}`} onClick={() => setTaskFilter("all")}>Semua Tugas</button>
                        {Object.entries(tasks)
                            .filter(([id]) => id == taskIdParam)
                            .map(([id, name]) => (
                            <button key={id} className={`filter-tab ${taskFilter === parseInt(id) ? "filter-tab--active" : ""}`} onClick={() => setTaskFilter(parseInt(id))}>
                                {name.split(" ").slice(0, 2).join(" ")}…
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="card" style={{ padding: "40px", textAlign: "center" }}>Memuat data pengumpulan...</div>
                ) : data.length === 0 ? (
                    <div className="card" style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Tidak ada data pengumpulan.</div>
                ) : (
                    Object.entries(tasks).map(([taskId, taskName]) => {
                        const taskSubs = data.filter(s => s.taskId == taskId);
                        if (taskSubs.length === 0) return null;
                        
                        return (
                            <div key={taskId} className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
                                <div style={{ padding: "16px 20px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>{taskName}</h3>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#e5e7eb", padding: "4px 10px", borderRadius: 20 }}>{taskSubs.length} Pengumpulan</span>
                                </div>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Mahasiswa</th>
                                            <th>Waktu Pengumpulan</th>
                                            <th>File</th>
                                            <th>Status</th>
                                            <th>Nilai</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {taskSubs.map(s => (
                                            <tr key={s.id}>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <div className="submission-item__avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{s.name.charAt(0)}</div>
                                                        <div>
                                                            <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{s.name}</p>
                                                            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{s.nim}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280" }}>
                                                        <Clock size={12} />{s.submittedAt}
                                                    </div>
                                                </td>
                                                <td>
                                                    {s.file
                                                        ? <a href={`http://127.0.0.1:8000/storage/${s.filePath}?download=1`} download={s.file} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#4338ca", cursor: "pointer", textDecoration: "none" }}><FileText size={12} />{s.file}</a>
                                                        : <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>
                                                    }
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${s.status === "submitted" ? "status--green" : s.status === "late" ? "status--red" : "status--gray"}`}>
                                                        {s.status === "submitted" ? "Dikumpulkan" : s.status === "late" ? "Terlambat" : "Belum"}
                                                    </span>
                                                </td>
                                                <td>
                                                    {s.grade !== null
                                                        ? <span style={{ fontWeight: 800, fontSize: 14, color: s.grade >= 80 ? "#16a34a" : s.grade >= 60 ? "#ea580c" : "#dc2626" }}>{s.grade}</span>
                                                        : <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>
                                                    }
                                                </td>
                                                <td>
                                                    {s.status !== "pending" && (
                                                        <Link to={`/dosen/grading?submission=${s.id}`} className="btn-outline" style={{ margin: 0, width: "auto", padding: "6px 12px", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                            <CheckCircle2 size={11} /> Nilai
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })
                )}

            </main>
        </div>
    );
}
