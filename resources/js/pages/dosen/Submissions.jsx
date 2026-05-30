import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { ChevronLeft, Download, Search, Filter, CheckCircle2, Clock, FileText } from "lucide-react";

// ─── Sample Submissions ───────────────────────────────────────────────────────
const ALL_SUBMISSIONS = [
    { id: 1, taskId: 1, name: "Andi Saputra",    nim: "2021001", course: "Algoritma", file: "andi_sorting.zip",   status: "submitted", grade: null, submittedAt: "2026-05-29 22:30", late: false },
    { id: 2, taskId: 1, name: "Sari Dewi",        nim: "2021015", course: "Algoritma", file: "sari_sorting.zip",   status: "late",      grade: null, submittedAt: "2026-05-30 01:10", late: true  },
    { id: 3, taskId: 1, name: "Rizky Maulana",    nim: "2021032", course: "Algoritma", file: "rizky_sorting.zip",  status: "submitted", grade: 88,   submittedAt: "2026-05-29 20:15", late: false },
    { id: 4, taskId: 1, name: "Dewi Lestari",     nim: "2021007", course: "Algoritma", file: null,                 status: "pending",   grade: null, submittedAt: "—",                late: false },
    { id: 5, taskId: 1, name: "Budi Santoso",     nim: "2021044", course: "Algoritma", file: "budi_sorting.zip",   status: "submitted", grade: 92,   submittedAt: "2026-05-29 18:00", late: false },
    { id: 6, taskId: 1, name: "Rina Suryani",     nim: "2021020", course: "Algoritma", file: "rina_sorting.zip",   status: "submitted", grade: 75,   submittedAt: "2026-05-29 21:45", late: false },
    { id: 7, taskId: 1, name: "Hendra Wijaya",    nim: "2021055", course: "Algoritma", file: null,                 status: "pending",   grade: null, submittedAt: "—",                late: false },
    { id: 8, taskId: 1, name: "Laila Fitriani",   nim: "2021011", course: "Algoritma", file: "laila_sorting.zip",  status: "late",      grade: null, submittedAt: "2026-05-30 09:00", late: true  },
    { id: 9, taskId: 2, name: "Andi Saputra",     nim: "2021001", course: "Jaringan",  file: "andi_jaringan.pdf",  status: "submitted", grade: null, submittedAt: "2026-06-01 10:30", late: false },
    { id:10, taskId: 2, name: "Sari Dewi",         nim: "2021015", course: "Jaringan",  file: null,                 status: "pending",   grade: null, submittedAt: "—",                late: false },
];

const TASK_NAMES = {
    1: "Implementasi Algoritma Sorting",
    2: "Laporan Praktikum Jaringan",
};

// ─── Submissions Page ─────────────────────────────────────────────────────────
export default function DosenSubmissions() {
    const [params]    = useSearchParams();
    const taskIdParam = params.get("task");
    const [taskFilter, setTaskFilter] = useState(taskIdParam ? parseInt(taskIdParam) : "all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const data = ALL_SUBMISSIONS.filter(s => {
        const matchTask   = taskFilter === "all" || s.taskId === taskFilter;
        const matchStatus = statusFilter === "all" || s.status === statusFilter;
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.nim.includes(search);
        return matchTask && matchStatus && matchSearch;
    });

    const counts = {
        all:       ALL_SUBMISSIONS.length,
        submitted: ALL_SUBMISSIONS.filter(s => s.status === "submitted").length,
        late:      ALL_SUBMISSIONS.filter(s => s.status === "late").length,
        pending:   ALL_SUBMISSIONS.filter(s => s.status === "pending").length,
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
                    <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: 13 }}>
                        <Download size={15} /> Ekspor Semua
                    </button>
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
                        {Object.entries(TASK_NAMES).map(([id, name]) => (
                            <button key={id} className={`filter-tab ${taskFilter === parseInt(id) ? "filter-tab--active" : ""}`} onClick={() => setTaskFilter(parseInt(id))}>
                                {name.split(" ").slice(0, 2).join(" ")}…
                            </button>
                        ))}
                    </div>
                </div>

                {/* TABLE */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Mahasiswa</th>
                                <th>Tugas</th>
                                <th>Waktu Pengumpulan</th>
                                <th>File</th>
                                <th>Status</th>
                                <th>Nilai</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(s => (
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
                                    <td><span style={{ fontSize: 12, color: "#374151" }}>{TASK_NAMES[s.taskId]}</span></td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280" }}>
                                            <Clock size={12} />{s.submittedAt}
                                        </div>
                                    </td>
                                    <td>
                                        {s.file
                                            ? <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#4338ca", cursor: "pointer" }}><FileText size={12} />{s.file}</div>
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
                    {data.length === 0 && (
                        <p style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0" }}>Tidak ada data pengumpulan.</p>
                    )}
                </div>

            </main>
        </div>
    );
}
