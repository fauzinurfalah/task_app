import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Sidebar from "../../components/Sidebar";
import {
    Plus, Search, Filter, Clock3, Users, ChevronRight,
    BookOpen, Code2, Calculator, Layers, MoreHorizontal, QrCode, X
} from "lucide-react";
import axiosClient from "../../axiosClient";

const ICONS = {
    indigo: <BookOpen size={18} color="#4338ca" />,
    orange: <Layers   size={18} color="#ea580c" />,
    purple: <Code2    size={18} color="#7c3aed" />,
    green:  <Calculator size={18} color="#16a34a" />,
};

const STATUS_MAP = {
    active: { label: "Aktif",    cls: "status--green" },
    closed: { label: "Ditutup", cls: "status--gray"  },
    graded: { label: "Dinilai", cls: "status--indigo" },
};

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onShowQR }) {
    const pct = Math.round((task.submitted / task.total) * 100);
    const s   = STATUS_MAP[task.status];
    return (
        <div className="task-full-card">
            <div className="task-full-card__top">
                <div className={`course-card__icon icon-bg--${task.courseVariant}`} style={{ width: 40, height: 40, borderRadius: 10 }}>
                    {ICONS[task.courseVariant]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="task-full-card__course">{task.course}</p>
                    <p className="task-full-card__title">{task.title}</p>
                    {task.kode && (
                        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4, fontWeight: 500 }}>
                            Kode: <span style={{ color: "#111827", background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{task.kode}</span>
                        </p>
                    )}
                </div>
                <span className={`status-badge ${s.cls}`}>{s.label}</span>
            </div>

            <p className="task-full-card__desc">{task.desc}</p>

            <div className="task-full-card__meta">
                <div className="task-full-card__meta-item">
                    <Clock3 size={13} color="#9ca3af" />
                    <span>{task.deadline} • {task.time}</span>
                </div>
                <div className="task-full-card__meta-item">
                    <Users size={13} color="#9ca3af" />
                    <span>{task.submitted}/{task.total} dikumpulkan</span>
                </div>
            </div>

            <div className="task-full-card__progress">
                <div className="progress-bar" style={{ marginTop: 0 }}>
                    <div className="progress-bar__fill" style={{ width: `${pct}%`, background: pct === 100 ? "#16a34a" : "#4338ca" }} />
                </div>
                <span className="task-full-card__pct">{pct}%</span>
            </div>

            <div className="task-full-card__actions">
                {task.kode && (
                    <button onClick={() => onShowQR(task)} className="btn-outline" style={{ margin: 0, padding: "8px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        <QrCode size={13} /> QR
                    </button>
                )}
                <Link to={`/dosen/tasks/detail?id=${task.id}`} className="btn-outline" style={{ margin: 0, width: "auto", padding: "8px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    Lihat Detail <ChevronRight size={13} />
                </Link>
                <Link to={`/dosen/submissions?task=${task.id}`} className="btn-primary" style={{ padding: "8px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
                    Pengumpulan <Users size={13} />
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
                // Map the data to the format TaskCard expects
                const mappedTasks = data.map(t => ({
                    id: t.id_task,
                    kode: t.kode_tugas,
                    title: t.nama_tugas,
                    course: t.nama_matkul || "Umum",
                    courseVariant: "indigo", // could be dynamic
                    deadline: t.deadline,
                    time: t.jam,
                    submitted: t.submitted_count || 0,
                    total: 42, // Would ideally come from course total_students
                    status: t.status || "active",
                    desc: t.deskripsi
                }));
                setTasks(mappedTasks);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filtered = tasks.filter(t => {
        const matchStatus = filter === "all" || t.status === filter;
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                            t.course.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <div className="app-wrapper">
            <Sidebar role="dosen" />
            <main className="main-content">

                {/* TOPBAR */}
                <div className="topbar">
                    <div>
                        <h1 className="topbar__title">Kelola Tugas</h1>
                        <p className="topbar__subtitle">Buat dan pantau semua tugas yang diberikan kepada mahasiswa.</p>
                    </div>
                    <div className="topbar__actions">
                        <Link to="/dosen/tasks/detail" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: 13, textDecoration: "none" }}>
                            <Plus size={15} /> Buat Tugas Baru
                        </Link>
                    </div>
                </div>

                {/* SEARCH & FILTER */}
                <div className="page-toolbar">
                    <div className="search-box">
                        <Search size={15} color="#9ca3af" />
                        <input
                            className="search-box__input"
                            placeholder="Cari tugas atau mata kuliah..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-tabs">
                        <Filter size={14} color="#6b7280" />
                        {["all","active","closed","graded"].map(f => (
                            <button
                                key={f}
                                className={`filter-tab ${filter === f ? "filter-tab--active" : ""}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === "all" ? "Semua" : f === "active" ? "Aktif" : f === "closed" ? "Ditutup" : "Dinilai"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="task-full-grid">
                    {loading ? (
                        <p style={{ color: "#9ca3af", textAlign: "center", padding: "40px 0", gridColumn: "1 / -1" }}>Memuat tugas...</p>
                    ) : filtered.length > 0
                        ? filtered.map(t => <TaskCard key={t.id} task={t} onShowQR={(task) => setQrModal({ show: true, task })} />)
                        : <p style={{ color: "#9ca3af", textAlign: "center", padding: "40px 0", gridColumn: "1 / -1" }}>Tidak ada tugas ditemukan.</p>
                    }
                </div>

            </main>

            {/* QR Code Modal */}
            {qrModal.show && qrModal.task && (
                <div className="modal-backdrop">
                    <div className="modal-content" style={{ maxWidth: 400, textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Kode Tugas</h3>
                            <button onClick={() => setQrModal({ show: false, task: null })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} color="#6b7280" />
                            </button>
                        </div>
                        <p style={{ marginBottom: 10, color: '#4b5563', fontSize: 14 }}>
                            Silakan scan QR Code ini atau gunakan kode di bawah untuk mengambil tugas.
                        </p>
                        <div style={{ padding: 20, background: '#fff', borderRadius: 12, display: 'inline-block', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <QRCodeSVG value={qrModal.task.kode} size={200} />
                        </div>
                        <h2 style={{ marginTop: 20, fontSize: 32, letterSpacing: 4, color: '#111827' }}>
                            {qrModal.task.kode}
                        </h2>
                        <p style={{ fontSize: 16, fontWeight: 600, marginTop: 10 }}>{qrModal.task.title}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
