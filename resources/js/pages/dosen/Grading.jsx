import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { ChevronLeft, Save, Star, FileText, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import axiosClient from "../../axiosClient";

// ─── Grading Row ──────────────────────────────────────────────────────────────
function GradingRow({ submission, index, onGradeSaved }) {
    const [expanded, setExpanded] = useState(index === 0);
    const [feedback, setFeedback]     = useState(submission.feedback || "");
    const [saved, setSaved]           = useState(submission.grade !== null);
    const [finalGrade, setFinalGrade] = useState(submission.grade || 0);
    const [loading, setLoading]       = useState(false);

    async function handleSave() {
        setLoading(true);
        try {
            await axiosClient.post(`/dosen/submissions/${submission.id}/grade`, {
                grade: finalGrade,
                feedback: feedback
            });
            setSaved(true);
            if (onGradeSaved) onGradeSaved();
            alert("Nilai berhasil disimpan!");
        } catch (err) {
            console.error(err);
            alert("Gagal menyimpan nilai");
        } finally {
            setLoading(false);
        }
    }

    const gradeColor = finalGrade >= 80 ? "#16a34a" : finalGrade >= 60 ? "#ea580c" : finalGrade ? "#dc2626" : "#9ca3af";

    return (
        <div className={`grading-row ${saved ? "grading-row--saved" : ""}`}>
            {/* Summary row */}
            <div className="grading-row__header" onClick={() => setExpanded(e => !e)}>
                <div className="submission-item__avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{submission.user?.name?.charAt(0) || "U"}</div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{submission.user?.name}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{submission.user?.nim || "-"} • {new Date(submission.created_at).toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className={`status-badge ${submission.status === "late" ? "status--red" : "status--green"}`}>
                        {submission.status === "late" ? "Terlambat" : "Tepat Waktu"}
                    </span>
                    {saved && (
                        <span style={{ fontSize: 18, fontWeight: 900, color: gradeColor }}>{finalGrade}</span>
                    )}
                    {saved && <CheckCircle2 size={16} color="#16a34a" />}
                    {expanded ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
                </div>
            </div>

            {/* Expanded grading form */}
            {expanded && (
                <div className="grading-row__body">
                    {/* File */}
                    {submission.file && (
                        <div className="attachment-chip" style={{ marginBottom: 16 }}>
                            <FileText size={13} />
                            <a href={`http://127.0.0.1:8000/storage/${submission.file}?download=1`} download style={{ color: "inherit", textDecoration: "none" }}>
                                {submission.file.split('/').pop()}
                            </a>
                        </div>
                    )}

                    {/* Simple scoring */}
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>Nilai Akhir (0 - 100)</label>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        className="edit-input"
                        style={{ width: 100, marginBottom: 16 }}
                        value={finalGrade}
                        onChange={e => {
                            setFinalGrade(Math.min(100, Math.max(0, Number(e.target.value))));
                            setSaved(false);
                        }}
                    />

                    {/* Feedback */}
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>Catatan / Feedback</label>
                    <textarea
                        className="edit-input edit-input--textarea"
                        rows={3}
                        placeholder="Tulis catatan untuk mahasiswa ini..."
                        value={feedback}
                        onChange={e => { setFeedback(e.target.value); setSaved(false); }}
                    />

                    {/* Save */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", fontSize: 13 }} onClick={handleSave} disabled={loading}>
                            <Save size={14} /> {loading ? "Menyimpan..." : "Simpan Nilai"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Grading Page ─────────────────────────────────────────────────────────────
export default function DosenGrading() {
    const [params] = useSearchParams();
    const submissionId = params.get("submission");
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubmissions = () => {
        axiosClient.get('/dosen/submissions')
            .then(({ data }) => {
                let filtered = data;
                if (submissionId) {
                    filtered = data.filter(s => s.id == submissionId);
                }
                setSubmissions(filtered);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchSubmissions();
    }, [submissionId]);

    const graded   = submissions.filter(s => s.grade !== null).length;
    const avg      = submissions.filter(s => s.grade !== null).reduce((a, s) => a + s.grade, 0) / (graded || 1);

    if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Memuat data penilaian...</div>;

    const taskName = submissions.length > 0 ? submissions[0].task?.nama_tugas : "Tidak diketahui";
    const taskId = submissions.length > 0 ? submissions[0].task_id : "";

    return (
        <div className="app-wrapper">
            <Sidebar role="dosen" />
            <main className="main-content">

                {/* BREADCRUMB */}
                <div className="breadcrumb">
                    <Link to="/dosen/tasks" className="breadcrumb__link"><ChevronLeft size={14} /> Kelola Tugas</Link>
                    <span className="breadcrumb__sep">/</span>
                    <Link to={`/dosen/submissions`} className="breadcrumb__link">Pengumpulan</Link>
                    <span className="breadcrumb__sep">/</span>
                    <span className="breadcrumb__current">Penilaian</span>
                </div>

                {/* TOPBAR */}
                <div className="topbar" style={{ marginTop: 8 }}>
                    <div>
                        <h1 className="topbar__title">Penilaian Tugas</h1>
                        <p className="topbar__subtitle">{taskName} — {submissions.length} pengumpulan</p>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <div className="mini-stat" style={{ textAlign: "center", background: "white", borderRadius: 12, padding: "8px 20px" }}>
                            <p className="mini-stat__val" style={{ color: "#4338ca" }}>{graded}/{submissions.length}</p>
                            <p className="mini-stat__label">Dinilai</p>
                        </div>
                        <div className="mini-stat" style={{ textAlign: "center", background: "white", borderRadius: 12, padding: "8px 20px" }}>
                            <p className="mini-stat__val" style={{ color: "#16a34a" }}>{avg.toFixed(1)}</p>
                            <p className="mini-stat__label">Rata-rata</p>
                        </div>
                    </div>
                </div>

                {/* GRADING CARDS */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {submissions.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#6b7280", marginTop: 40 }}>Tidak ada pengumpulan ditemukan.</p>
                    ) : (
                        submissions.map((s, i) => (
                            <GradingRow key={s.id} submission={s} index={i} onGradeSaved={fetchSubmissions} />
                        ))
                    )}
                </div>

            </main>
        </div>
    );
}
