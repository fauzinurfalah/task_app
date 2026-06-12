import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import {
    ChevronLeft, Clock3, Users, BookOpen, CheckCircle2,
    Download, Edit3, Trash2, Save, X, Layers, Paperclip, BarChart2
} from "lucide-react";
import axiosClient from "../../axiosClient";
import { useNavigate } from "react-router-dom";

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
                setDeadline(data.deadline ? data.deadline.substring(0, 10) : "");
                setNamaMatkul(data.nama_matkul || "");
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [taskId]);

    const handleDelete = async () => {
        if (confirm("Apakah anda yakin ingin menghapus tugas ini secara permanen?")) {
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

    if (loading) return <div className="app-wrapper"><Sidebar role="dosen" /><main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>Memuat Detail Tugas...</main></div>;
    if (!task) return <div className="app-wrapper"><Sidebar role="dosen" /><main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>Tugas tidak ditemukan.</main></div>;

    const submissionsList = task?.submissions || [];
    const submitted = task?.submitted_count || 0;
    const graded    = task?.graded_count || 0;
    const totalSubs = task?.submissions_count || 0;
    const lateSubs  = submissionsList.filter(s => s.status === 'late').length;

    const inputStyles = {
        width: "100%", padding: "12px 16px", border: "1.5px solid #e2e8f0", borderRadius: 12,
        fontSize: 14, fontFamily: "inherit", outline: "none", transition: "all 0.2s",
        background: "white"
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
                    <span style={{ color: "#ea580c", background: "#fff7ed", padding: "4px 10px", borderRadius: 8 }}>{editing && !taskId ? "Buat Tugas Baru" : "Detail Tugas"}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

                    {/* ── LEFT: Task Info ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                        {/* Header Card */}
                        <div style={{ background: "white", borderRadius: 24, padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                                <div style={{ flex: 1, paddingRight: 24 }}>
                                    {editing
                                        ? <input placeholder="Kategori / Mata Kuliah" value={namaMatkul} onChange={e => setNamaMatkul(e.target.value)} style={{ ...inputStyles, marginBottom: 12, fontWeight: 700, color: "#ea580c", background: "#fff7ed", borderColor: "#fed7aa" }} onFocus={e => { e.target.style.borderColor = "#ea580c"; e.target.style.boxShadow = "0 0 0 4px rgba(234,88,12,0.1)"; }} onBlur={e => { e.target.style.borderColor = "#fed7aa"; e.target.style.boxShadow = "none"; }} />
                                        : <span style={{ padding: "6px 12px", background: "#eef2ff", color: "#4f46e5", borderRadius: 10, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-block", marginBottom: 16 }}>{task.nama_matkul || "Umum"}</span>
                                    }
                                    {editing
                                        ? <input placeholder="Judul Tugas" value={title} onChange={e => setTitle(e.target.value)} style={{ ...inputStyles, fontSize: 24, fontWeight: 900, color: "#0f172a" }} onFocus={e => { e.target.style.borderColor = "#ea580c"; e.target.style.boxShadow = "0 0 0 4px rgba(234,88,12,0.1)"; }} onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
                                        : <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0", lineHeight: 1.3, letterSpacing: "-0.5px" }}>{title}</h1>
                                    }
                                </div>
                                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                                    {editing ? (
                                        <>
                                            <button onClick={() => { if(!taskId) navigate("/dosen/tasks"); else setEditing(false); }} style={{ padding: "10px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", color: "#475569", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                                                <X size={16} /> Batal
                                            </button>
                                            <button onClick={handleSave} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", color: "white", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s", boxShadow: "0 4px 12px rgba(234,88,12,0.25)" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                                                <Save size={16} /> Simpan
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => setEditing(true)} style={{ padding: "10px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", color: "#0f172a", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }} onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                                                <Edit3 size={16} /> Edit
                                            </button>
                                            <button onClick={handleDelete} style={{ padding: "10px 16px", borderRadius: 12, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"} onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}>
                                                <Trash2 size={16} /> Hapus
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div style={{ display: "flex", gap: 24, marginBottom: 24, padding: "16px 20px", background: "#f8fafc", borderRadius: 16, border: "1px solid #f1f5f9", flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700, color: "#475569" }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}><Clock3 size={16} color="#ea580c" /></div>
                                    {editing
                                        ? <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ ...inputStyles, padding: "8px 12px" }} />
                                        : <span>{task.deadline || "-"} • {task.jam || "-"}</span>
                                    }
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700, color: "#475569" }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}><Users size={16} color="#4f46e5" /></div>
                                    <span>{totalSubs} Mahasiswa Ditugaskan</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700, color: "#475569" }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}><CheckCircle2 size={16} color="#10b981" /></div>
                                    <span>{points} Poin Maksimal</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                <Layers size={16} color="#64748b" />
                                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#475569", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Deskripsi Tugas</h3>
                            </div>
                            {editing
                                ? <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={6} style={{ ...inputStyles, resize: "vertical", lineHeight: 1.6 }} placeholder="Tuliskan detail tugas yang harus dikerjakan mahasiswa..." onFocus={e => { e.target.style.borderColor = "#ea580c"; e.target.style.boxShadow = "0 0 0 4px rgba(234,88,12,0.1)"; }} onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
                                : <div style={{ fontSize: 15, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "#fafafa", padding: "20px", borderRadius: 16, border: "1px solid #f1f5f9" }}>{desc || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Tidak ada deskripsi.</span>}</div>
                            }
                        </div>

                        {/* Attachments */}
                        <div style={{ background: "white", borderRadius: 24, padding: "24px 32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                                <Paperclip size={20} color="#4f46e5" />
                                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>Lampiran Tugas</h2>
                            </div>
                            
                            {editing ? (
                                <div style={{ padding: "24px", border: "2px dashed #cbd5e1", borderRadius: 16, textAlign: "center", background: "#f8fafc", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.background = "#eef2ff"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}>
                                    <input type="file" onChange={e => setAttachment(e.target.files[0])} style={{ fontSize: 14, fontWeight: 600, color: "#64748b" }} />
                                    {attachment && <p style={{ fontSize: 13, fontWeight: 700, color: "#10b981", margin: "12px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><CheckCircle2 size={16} /> File siap diunggah: {attachment.name}</p>}
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {task.attachment ? (
                                        <>
                                            {task.attachment.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                                <div style={{ marginBottom: 16, borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0", display: "inline-block" }}>
                                                    <img src={`http://127.0.0.1:8000/storage/${task.attachment}`} alt="Lampiran Dosen" style={{ maxWidth: "100%", maxHeight: 300, display: "block" }} />
                                                </div>
                                            ) : null}
                                            <a href={`http://127.0.0.1:8000/storage/${task.attachment}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 20px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", color: "#4f46e5", fontSize: 14, fontWeight: 800, textDecoration: "none", transition: "all 0.2s", width: "fit-content" }} onMouseEnter={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
                                                <Download size={18} />
                                                <span>{task.attachment.split('/').pop()}</span>
                                            </a>
                                        </>
                                    ) : (
                                        <div style={{ padding: "16px 20px", background: "#f1f5f9", borderRadius: 12, color: "#64748b", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8" }} /> Tidak ada file lampiran.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Stats + Submissions Preview ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                        {/* Progress stats */}
                        <div style={{ background: "white", borderRadius: 24, padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                                <BarChart2 size={20} color="#ea580c" />
                                <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Statistik</h2>
                            </div>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {[
                                    { label: "Dikumpulkan", val: submitted, total: totalSubs || 1, color: "#10b981", bg: "#ecfdf5" },
                                    { label: "Dinilai",     val: graded,    total: totalSubs || 1, color: "#4f46e5", bg: "#eef2ff" },
                                    { label: "Belum",       val: Math.max(0, totalSubs - submitted), total: totalSubs || 1, color: "#64748b", bg: "#f1f5f9" },
                                    { label: "Terlambat",   val: lateSubs, total: totalSubs || 1, color: "#ef4444", bg: "#fef2f2" },
                                ].map(s => (
                                    <div key={s.label}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>{s.label}</span>
                                            <span style={{ fontSize: 13, fontWeight: 900, color: s.color }}>{s.val}</span>
                                        </div>
                                        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${(s.val/s.total)*100}%`, background: s.color, borderRadius: 99, transition: "width 0.5s ease" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submissions preview */}
                        <div style={{ background: "white", borderRadius: 24, padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Users size={18} color="#0f172a" />
                                    <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Pengumpulan</h2>
                                </div>
                                <Link to={`/dosen/submissions?task=${task.id}`} style={{ fontSize: 12, fontWeight: 800, color: "#4f46e5", textDecoration: "none", padding: "6px 12px", background: "#eef2ff", borderRadius: 10, transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#e0e7ff"} onMouseLeave={e => e.currentTarget.style.background = "#eef2ff"}>
                                    Lihat Semua
                                </Link>
                            </div>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {submissionsList.length === 0 ? (
                                    <div style={{ padding: "20px", textAlign: "center", background: "#f8fafc", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b", margin: 0 }}>Belum ada pengumpulan mahasiswa.</p>
                                    </div>
                                ) : (
                                    submissionsList.slice(0, 4).map((s, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 16, border: "1px solid #f1f5f9", background: "#fafafa" }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                                                {s.user?.name?.charAt(0) || "U"}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.user?.name}</p>
                                                <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", margin: 0 }}>{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: s.status === "submitted" ? "#ecfdf5" : s.status === "late" ? "#fef2f2" : "#f1f5f9", color: s.status === "submitted" ? "#059669" : s.status === "late" ? "#dc2626" : "#64748b", border: `1px solid ${s.status === "submitted" ? "#a7f3d0" : s.status === "late" ? "#fecaca" : "#e2e8f0"}` }}>
                                                    {s.status === "submitted" ? "Dikumpulkan" : s.status === "late" ? "Terlambat" : "Belum"}
                                                </span>
                                                {s.grade && <span style={{ fontSize: 12, fontWeight: 900, color: "#ea580c" }}>{s.grade}/100</span>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <Link to={`/dosen/grading?task=${task.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", marginTop: 20, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", color: "white", fontSize: 14, fontWeight: 800, textDecoration: "none", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(79,70,229,0.2)" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                                <CheckCircle2 size={18} /> Mulai Penilaian
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
