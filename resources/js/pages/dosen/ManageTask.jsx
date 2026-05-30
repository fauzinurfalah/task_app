import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import {
    Plus, Search, Filter, Clock3, Users, ChevronRight,
    BookOpen, Code2, Calculator, Layers, MoreHorizontal,
} from "lucide-react";

// ─── Sample Data ──────────────────────────────────────────────────────────────
const TASKS = [
    {
        id: 1, title: "Implementasi Algoritma Sorting", course: "Algoritma & Pemrograman",
        courseVariant: "indigo", deadline: "2026-05-30", time: "23:59",
        submitted: 38, total: 42, status: "active",
        desc: "Implementasikan 3 algoritma sorting (Bubble, Merge, Quick) menggunakan bahasa C++.",
    },
    {
        id: 2, title: "Laporan Praktikum Jaringan", course: "Jaringan Komputer",
        courseVariant: "orange", deadline: "2026-06-02", time: "12:00",
        submitted: 20, total: 35, status: "active",
        desc: "Buat laporan praktikum konfigurasi routing statis dan dinamis (OSPF, RIP).",
    },
    {
        id: 3, title: "Proyek Akhir – Machine Learning", course: "Kecerdasan Buatan",
        courseVariant: "purple", deadline: "2026-06-10", time: "23:59",
        submitted: 5, total: 30, status: "active",
        desc: "Bangun model klasifikasi menggunakan dataset pilihan, minimal akurasi 80%.",
    },
    {
        id: 4, title: "Quiz Pemrograman Web", course: "Web Programming",
        courseVariant: "green", deadline: "2026-05-20", time: "10:00",
        submitted: 28, total: 28, status: "closed",
        desc: "Quiz online HTML, CSS, dan JavaScript dasar.",
    },
    {
        id: 5, title: "Tugas Analisis Kompleksitas", course: "Algoritma & Pemrograman",
        courseVariant: "indigo", deadline: "2026-05-15", time: "23:59",
        submitted: 40, total: 42, status: "graded",
        desc: "Analisis kompleksitas waktu dan ruang dari 5 algoritma yang diberikan.",
    },
];

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
function TaskCard({ task }) {
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

// ─── Manage Task Page ─────────────────────────────────────────────────────────
export default function DosenManageTask() {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const filtered = TASKS.filter(t => {
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

                {/* TASK LIST */}
                <div className="task-full-grid">
                    {filtered.length > 0
                        ? filtered.map(t => <TaskCard key={t.id} task={t} />)
                        : <p style={{ color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>Tidak ada tugas ditemukan.</p>
                    }
                </div>

            </main>
        </div>
    );
}
