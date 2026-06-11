import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import {
    ChevronLeft, Clock3, Users, BookOpen, CheckCircle2,
    AlertCircle, Download, Edit3, Trash2, Save, X,
} from "lucide-react";
import axiosClient from "../../axiosClient";
import { useNavigate } from "react-router-dom";

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

// Removed hardcoded SUBMISSIONS_PREVIEW

// ─── Task Detail Page ─────────────────────────────────────────────────────────
export default function DosenTaskDetail() {
    const [params]   = useSearchParams();
    const taskId     = params.get("id");
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing]   = useState(false);
    const [title, setTitle]       = useState("");
    const [desc, setDesc]         = useState("");
    const [deadline, setDeadline] = useState("");
    const [namaMatkul, setNamaMatkul] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [points, setPoints]     = useState(100);

    const navigate = useNavigate();

    useEffect(() => {
        if (!taskId) {
            setTask({ rubric: [], attachments: [], total: 0, points: 100 });
            setEditing(true);
            setLoading(false);
            return;
        }
        axiosClient.get(`/dosen/tasks/${taskId}`)
            .then(({ data }) => {
                setTask(data);
                setTitle(data.nama_tugas);
                setDesc(data.deskripsi || "");
                setDeadline(data.deadline || "");
                setNamaMatkul(data.nama_matkul || "");
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [taskId]);

    const handleDelete = async () => {
        if (confirm("Apakah anda yakin ingin menghapus tugas ini?")) {
            try {
                await axiosClient.delete(`/dosen/tasks/${taskId}`);
                navigate("/dosen/tasks");
            } catch (err) {
                console.error(err);
                alert("Gagal menghapus tugas.");
            }
        }
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append("nama_tugas", title);
            formData.append("nama_matkul", namaMatkul || "Umum");
            formData.append("deskripsi", desc);
            formData.append("deadline", deadline || "2026-12-31");
            if (attachment) {
                formData.append("attachment", attachment);
            }
            // For Laravel PUT requests via FormData, we need to spoof the method
            if (taskId) {
                formData.append("_method", "PUT");
                await axiosClient.post(`/dosen/tasks/${taskId}`, formData);
            } else {
                await axiosClient.post(`/dosen/tasks`, formData);
            }
            navigate("/dosen/tasks");
        } catch (err) {
            console.error(err);
            alert("Gagal menyimpan tugas.");
        }
    };

    if (loading) return <div className="app-wrapper"><main className="main-content"><p>Loading task detail...</p></main></div>;
    if (!task) return <div className="app-wrapper"><main className="main-content"><p>Task not found.</p></main></div>;

    const submissionsList = task?.submissions || [];
    const submitted = task?.submitted_count || 0;
    const graded    = task?.graded_count || 0;
    const totalSubs = task?.submissions_count || 0;
    const lateSubs  = submissionsList.filter(s => s.status === 'late').length;

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
                                    {editing
                                        ? <input className="edit-input" placeholder="Mata Kuliah" value={namaMatkul} onChange={e => setNamaMatkul(e.target.value)} style={{marginBottom: 8}} />
                                        : <span className={`task-item__badge badge--indigo`} style={{ fontSize: 12 }}>{task.nama_matkul || "Umum"}</span>
                                    }
                                    {editing
                                        ? <input className="edit-input edit-input--title" placeholder="Judul Tugas" value={title} onChange={e => setTitle(e.target.value)} />
                                        : <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "8px 0 0 0" }}>{title}</h1>
                                    }
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    {editing ? (
                                        <>
                                            <button className="btn-primary" style={{ padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }} onClick={handleSave}>
                                                <Save size={13} /> Simpan
                                            </button>
                                            <button className="btn-outline" style={{ margin: 0, width: "auto", padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }} onClick={() => { if(!taskId) navigate("/dosen/tasks"); else setEditing(false); }}>
                                                <X size={13} /> Batal
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn-outline" style={{ margin: 0, width: "auto", padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }} onClick={() => setEditing(true)}>
                                                <Edit3 size={13} /> Edit
                                            </button>
                                            <button className="btn-outline" style={{ margin: 0, width: "auto", padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 5, color: "#dc2626", borderColor: "#fee2e2" }} onClick={handleDelete}>
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
                                        : <span>{task.deadline} • {task.jam}</span>
                                    }
                                </div>
                                <div className="detail-meta-item"><Users size={14} color="#6b7280" /><span>{totalSubs} mahasiswa</span></div>
                                <div className="detail-meta-item"><BookOpen size={14} color="#6b7280" /><span>{points} poin</span></div>
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
                                    {(task.rubric || []).map((r, i) => (
                                        <tr key={i}>
                                            <td>{r.item}</td>
                                            <td><span className="status-badge status--indigo">{r.poin}</span></td>
                                        </tr>
                                    ))}
                                    <tr style={{ borderTop: "2px solid #e5e7eb" }}>
                                        <td style={{ fontWeight: 800 }}>Total</td>
                                        <td><span className="status-badge status--green">{task.points || points}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Attachments */}
                        <div className="card">
                            <h2 className="card__title">Lampiran Tugas</h2>
                            {editing ? (
                                <div style={{ marginTop: 8 }}>
                                    <input type="file" onChange={e => setAttachment(e.target.files[0])} style={{ fontSize: 13 }} />
                                    {attachment && <p style={{ fontSize: 12, color: "#16a34a", margin: "4px 0 0" }}>File terpilih: {attachment.name}</p>}
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                                    {task.attachment ? (
                                        <>
                                            {task.attachment.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                                <div style={{ marginBottom: 12, borderRadius: 12, overflow: "hidden", border: "1px solid #f3f4f6" }}>
                                                    <img src={`http://127.0.0.1:8000/storage/${task.attachment}`} alt="Lampiran Dosen" style={{ width: "100%", height: "auto", display: "block" }} />
                                                </div>
                                            ) : null}
                                            <a href={`http://127.0.0.1:8000/storage/${task.attachment}`} target="_blank" rel="noopener noreferrer" className="attachment-chip" style={{ textDecoration: "none", width: "fit-content" }}>
                                                <Download size={13} />
                                                <span>{task.attachment.split('/').pop()}</span>
                                            </a>
                                        </>
                                    ) : (
                                        <span style={{ fontSize: 13, color: "#9ca3af" }}>Tidak ada lampiran.</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Stats + Submissions Preview ── */}
                    <div className="detail-side">

                        {/* Progress stats */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h2 className="card__title">Statistik</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                {[
                                    { label: "Dikumpulkan", val: submitted, total: totalSubs || 1, cls: "status--green" },
                                    { label: "Dinilai",     val: graded,    total: totalSubs || 1, cls: "status--indigo" },
                                    { label: "Belum",       val: Math.max(0, totalSubs - submitted), total: totalSubs || 1, cls: "status--gray" },
                                    { label: "Terlambat",   val: lateSubs, total: totalSubs || 1, cls: "status--red" },
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
                            {submissionsList.length === 0 ? (
                                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 10 }}>Belum ada pengumpulan.</p>
                            ) : (
                                submissionsList.slice(0, 4).map((s, i) => (
                                    <div key={i} className="submission-item">
                                        <div className="submission-item__avatar">{s.user?.name?.charAt(0) || "U"}</div>
                                        <div className="submission-item__body">
                                            <p className="submission-item__name">{s.user?.name} <span className="submission-item__nim">({s.user?.nim})</span></p>
                                            <p className="submission-item__task">{new Date(s.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="submission-item__right">
                                            <span className={`status-badge ${s.status === "submitted" ? "status--green" : s.status === "late" ? "status--red" : "status--gray"}`}>
                                                {s.status === "submitted" ? "Dikumpulkan" : s.status === "late" ? "Terlambat" : "Belum"}
                                            </span>
                                            {s.grade && <span style={{ fontSize: 11, fontWeight: 700, color: "#4338ca" }}>{s.grade}/100</span>}
                                        </div>
                                    </div>
                                ))
                            )}
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
