import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import {
    ChevronLeft, Clock3, Users, BookOpen, CheckCircle2,
    AlertCircle, Download, Edit3, Trash2, Save, X,
} from "lucide-react";

// ─── Sample Task ──────────────────────────────────────────────────────────────
const TASKS_DB = {
    1: {
        id: 1, title: "Implementasi Algoritma Sorting", course: "Algoritma & Pemrograman",
        courseVariant: "indigo", deadline: "2026-05-30", time: "23:59",
        submitted: 38, total: 42, status: "active",
        desc: "Implementasikan 3 algoritma sorting (Bubble, Merge, Quick) menggunakan bahasa C++. Program harus bisa menerima input array dari user dan menampilkan hasil sorting beserta perbandingan waktu eksekusi.",
        points: 100, attachments: ["soal_sorting.pdf", "template_kode.zip"],
        rubric: [
            { item: "Implementasi Bubble Sort",  poin: 25 },
            { item: "Implementasi Merge Sort",   poin: 35 },
            { item: "Implementasi Quick Sort",   poin: 30 },
            { item: "Dokumentasi & Kerapian",    poin: 10 },
        ],
    },
};

const DEFAULT_TASK = TASKS_DB[1];

// ─── Submission preview in detail ─────────────────────────────────────────────
const SUBMISSIONS_PREVIEW = [
    { name: "Andi Saputra",  nim: "2021001", status: "submitted", grade: null,   time: "10 menit lalu",  file: "andi_sorting.zip" },
    { name: "Sari Dewi",     nim: "2021015", status: "late",      grade: null,   time: "2 jam lalu",     file: "sari_sorting.zip" },
    { name: "Rizky Maulana", nim: "2021032", status: "submitted", grade: 88,     time: "3 jam lalu",     file: "rizky_sorting.zip" },
    { name: "Dewi Lestari",  nim: "2021007", status: "pending",   grade: null,   time: "—",              file: null },
    { name: "Budi Santoso",  nim: "2021044", status: "submitted", grade: 92,     time: "5 jam lalu",     file: "budi_sorting.zip" },
];

// ─── Task Detail Page ─────────────────────────────────────────────────────────
export default function DosenTaskDetail() {
    const [params]   = useSearchParams();
    const taskId     = parseInt(params.get("id") || "1");
    const task       = TASKS_DB[taskId] || DEFAULT_TASK;

    const [editing, setEditing]   = useState(false);
    const [title, setTitle]       = useState(task.title);
    const [desc, setDesc]         = useState(task.desc);
    const [deadline, setDeadline] = useState(task.deadline);

    const submitted = SUBMISSIONS_PREVIEW.filter(s => s.status !== "pending").length;
    const graded    = SUBMISSIONS_PREVIEW.filter(s => s.grade !== null).length;

    return (
        <div className="app-wrapper">
            <Sidebar role="dosen" />
            <main className="main-content">

                {/* BREADCRUMB */}
                <div className="breadcrumb">
                    <Link to="/dosen/tasks" className="breadcrumb__link"><ChevronLeft size={14} /> Kelola Tugas</Link>
                    <span className="breadcrumb__sep">/</span>
                    <span className="breadcrumb__current">Detail Tugas</span>
                </div>

                <div className="detail-grid">

                    {/* ── LEFT: Task Info ── */}
                    <div className="detail-main">

                        {/* Header Card */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                <div>
                                    <span className={`task-item__badge badge--${task.courseVariant}`} style={{ fontSize: 12 }}>{task.course}</span>
                                    {editing
                                        ? <input className="edit-input edit-input--title" value={title} onChange={e => setTitle(e.target.value)} />
                                        : <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "8px 0 0 0" }}>{title}</h1>
                                    }
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    {editing ? (
                                        <>
                                            <button className="btn-primary" style={{ padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }} onClick={() => setEditing(false)}>
                                                <Save size={13} /> Simpan
                                            </button>
                                            <button className="btn-outline" style={{ margin: 0, width: "auto", padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }} onClick={() => setEditing(false)}>
                                                <X size={13} /> Batal
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn-outline" style={{ margin: 0, width: "auto", padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }} onClick={() => setEditing(true)}>
                                                <Edit3 size={13} /> Edit
                                            </button>
                                            <button className="btn-outline" style={{ margin: 0, width: "auto", padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 5, color: "#dc2626", borderColor: "#fee2e2" }}>
                                                <Trash2 size={13} /> Hapus
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Meta */}
                            <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
                                <div className="detail-meta-item">
                                    <Clock3 size={14} color="#6b7280" />
                                    {editing
                                        ? <input type="date" className="edit-input" value={deadline} onChange={e => setDeadline(e.target.value)} />
                                        : <span>{task.deadline} • {task.time}</span>
                                    }
                                </div>
                                <div className="detail-meta-item"><Users size={14} color="#6b7280" /><span>{task.total} mahasiswa</span></div>
                                <div className="detail-meta-item"><BookOpen size={14} color="#6b7280" /><span>{task.points} poin</span></div>
                            </div>

                            {/* Description */}
                            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Deskripsi Tugas</label>
                            {editing
                                ? <textarea className="edit-input edit-input--textarea" value={desc} onChange={e => setDesc(e.target.value)} rows={4} />
                                : <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginTop: 8 }}>{desc}</p>
                            }
                        </div>

                        {/* Rubric */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h2 className="card__title">Rubrik Penilaian</h2>
                            <table className="grade-table">
                                <thead>
                                    <tr><th>Kriteria</th><th>Poin</th></tr>
                                </thead>
                                <tbody>
                                    {task.rubric.map((r, i) => (
                                        <tr key={i}>
                                            <td>{r.item}</td>
                                            <td><span className="status-badge status--indigo">{r.poin}</span></td>
                                        </tr>
                                    ))}
                                    <tr style={{ borderTop: "2px solid #e5e7eb" }}>
                                        <td style={{ fontWeight: 800 }}>Total</td>
                                        <td><span className="status-badge status--green">{task.points}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Attachments */}
                        <div className="card">
                            <h2 className="card__title">Lampiran</h2>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                {task.attachments.map((f, i) => (
                                    <div key={i} className="attachment-chip">
                                        <Download size={13} />
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Stats + Submissions Preview ── */}
                    <div className="detail-side">

                        {/* Progress stats */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h2 className="card__title">Statistik</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                {[
                                    { label: "Dikumpulkan", val: submitted, total: task.total, cls: "status--green" },
                                    { label: "Dinilai",     val: graded,    total: task.total, cls: "status--indigo" },
                                    { label: "Belum",       val: task.total - submitted, total: task.total, cls: "status--gray" },
                                    { label: "Terlambat",   val: SUBMISSIONS_PREVIEW.filter(s=>s.status==="late").length, total: task.total, cls: "status--red" },
                                ].map(s => (
                                    <div key={s.label} className="mini-stat">
                                        <p className="mini-stat__val">{s.val}</p>
                                        <p className="mini-stat__label">{s.label}</p>
                                        <div className="progress-bar" style={{ marginTop: 6 }}>
                                            <div className="progress-bar__fill" style={{ width: `${(s.val/s.total)*100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submissions preview */}
                        <div className="card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                <h2 className="card__title" style={{ margin: 0 }}>Pengumpulan Terbaru</h2>
                                <Link to={`/dosen/submissions?task=${task.id}`} className="btn-link">Lihat Semua</Link>
                            </div>
                            {SUBMISSIONS_PREVIEW.slice(0, 4).map((s, i) => (
                                <div key={i} className="submission-item">
                                    <div className="submission-item__avatar">{s.name.charAt(0)}</div>
                                    <div className="submission-item__body">
                                        <p className="submission-item__name">{s.name} <span className="submission-item__nim">({s.nim})</span></p>
                                        <p className="submission-item__task">{s.time}</p>
                                    </div>
                                    <div className="submission-item__right">
                                        <span className={`status-badge ${s.status === "submitted" ? "status--green" : s.status === "late" ? "status--red" : "status--gray"}`}>
                                            {s.status === "submitted" ? "Dikumpulkan" : s.status === "late" ? "Terlambat" : "Belum"}
                                        </span>
                                        {s.grade && <span style={{ fontSize: 11, fontWeight: 700, color: "#4338ca" }}>{s.grade}/100</span>}
                                    </div>
                                </div>
                            ))}
                            <Link to={`/dosen/grading?task=${task.id}`} className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", fontSize: 13, marginTop: 14, textDecoration: "none" }}>
                                <CheckCircle2 size={14} /> Mulai Penilaian
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
