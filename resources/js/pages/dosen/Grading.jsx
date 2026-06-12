import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { ChevronLeft, Save, FileText, ChevronDown, ChevronUp, CheckCircle2, Award, ClipboardCheck } from "lucide-react";
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

    const gradeColor = finalGrade >= 80 ? "#059669" : finalGrade >= 60 ? "#ea580c" : finalGrade ? "#dc2626" : "#94a3b8";
    const gradeBg = finalGrade >= 80 ? "#ecfdf5" : finalGrade >= 60 ? "#fff7ed" : finalGrade ? "#fef2f2" : "#f1f5f9";
    const isAlreadyGraded = submission.grade !== null;

    return (
        <div style={{
            background: expanded ? "#f8fafc" : "white",
            borderBottom: "1px solid #e2e8f0",
            transition: "all 0.2s",
        }}>
            {/* Summary row */}
            <div onClick={() => setExpanded(e => !e)} style={{
                display: "flex", alignItems: "center", padding: "16px 24px", cursor: "pointer", gap: 16
            }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = expanded ? "#f8fafc" : "white"}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                    {submission.user?.name?.charAt(0) || "U"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{submission.user?.name}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: 0 }}>{submission.user?.nim || "-"} • {new Date(submission.created_at).toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
                    <span style={{
                        padding: "6px 12px", borderRadius: 12, fontSize: 11, fontWeight: 800,
                        background: submission.status === 'pending' ? "#f1f5f9" : submission.status === "late" ? "#fef2f2" : "#ecfdf5",
                        color: submission.status === 'pending' ? "#64748b" : submission.status === "late" ? "#dc2626" : "#059669",
                        border: `1px solid ${submission.status === 'pending' ? "#e2e8f0" : submission.status === "late" ? "#fecaca" : "#a7f3d0"}`
                    }}>
                        {submission.status === 'pending' ? 'Belum' : submission.status === "late" ? "Terlambat" : "Tepat Waktu"}
                    </span>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 70, justifyContent: "flex-end" }}>
                        {saved && <CheckCircle2 size={16} color="#10b981" />}
                        <span style={{
                            fontSize: 16, fontWeight: 900,
                            color: saved ? gradeColor : "transparent",
                            background: saved ? gradeBg : "transparent",
                            padding: saved ? "4px 10px" : 0, borderRadius: 8,
                            minWidth: 42, textAlign: "center", display: "inline-block"
                        }}>
                            {saved ? finalGrade : "0"}
                        </span>
                    </div>
                    {expanded ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                </div>
            </div>

            {/* Expanded grading form */}
            {expanded && (
                <div style={{ padding: "0 24px 24px", borderTop: "1px dashed #e2e8f0", marginTop: 8, paddingTop: 20 }}>
                    {/* File */}
                    {submission.file ? (
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>File Tugas</label>
                            <a href={`http://127.0.0.1:8000/storage/${submission.file}?download=1`} download style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "white", borderRadius: 12, border: "1px solid #e2e8f0", color: "#4f46e5", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#c7d2fe"} onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
                                <FileText size={16} /> {submission.file.split('/').pop()}
                            </a>
                        </div>
                    ) : (
                        <div style={{ marginBottom: 20, padding: "12px 16px", background: "#fef2f2", color: "#dc2626", borderRadius: 12, fontSize: 13, fontWeight: 700, border: "1px dashed #fca5a5" }}>
                            Belum ada file yang diunggah.
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, alignItems: "flex-start" }}>
                        {/* Scoring */}
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>Nilai Akhir (0 - 100)</label>
                            <input
                                type="number" min={0} max={100}
                                style={{ width: "100%", padding: "14px 16px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 24, fontWeight: 900, color: "#0f172a", fontFamily: "inherit", outline: "none", transition: "all 0.2s", textAlign: "center" }}
                                value={finalGrade}
                                onChange={e => {
                                    setFinalGrade(Math.min(100, Math.max(0, Number(e.target.value))));
                                    setSaved(false);
                                }}
                                disabled={isAlreadyGraded}
                                onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 4px rgba(79,70,229,.1)"; }}
                                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                            />
                        </div>

                        {/* Feedback */}
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>Catatan / Feedback</label>
                            <textarea
                                rows={3}
                                placeholder="Tulis catatan untuk mahasiswa ini..."
                                style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, fontFamily: "inherit", outline: "none", transition: "all 0.2s", resize: "vertical", minHeight: 70 }}
                                value={feedback}
                                onChange={e => { setFeedback(e.target.value); setSaved(false); }}
                                disabled={isAlreadyGraded}
                                onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 4px rgba(79,70,229,.1)"; }}
                                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                            />
                        </div>
                    </div>

                    {/* Save Action */}
                    {!isAlreadyGraded && (
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                            <button onClick={handleSave} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", border: "none", borderRadius: 14, color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(79,70,229,.2)" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                                <Save size={16} /> {loading ? "Menyimpan..." : "Simpan Nilai"}
                            </button>
                        </div>
                    )}
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

    if (loading) return <div style={{ padding: 60, textAlign: "center", fontSize: 16, fontWeight: 600, color: "#64748b" }}>Memuat data penilaian...</div>;

    const taskName = submissions.length > 0 ? submissions[0].task?.nama_tugas : "Tidak diketahui";

    return (
        <div className="app-wrapper">
            <Sidebar role="dosen" />
            <main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px" }}>

                {/* BREADCRUMB */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
                    <Link to="/dosen/tasks" style={{ color: "#64748b", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}><ChevronLeft size={16} /> Kelola Tugas</Link>
                    <span style={{ color: "#cbd5e1" }}>/</span>
                    <Link to="/dosen/submissions" style={{ color: "#64748b", textDecoration: "none" }}>Pengumpulan</Link>
                    <span style={{ color: "#cbd5e1" }}>/</span>
                    <span style={{ color: "#4f46e5", background: "#eef2ff", padding: "4px 10px", borderRadius: 8 }}>Penilaian</span>
                </div>

                {/* TOPBAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-1px" }}>Penilaian Tugas</h1>
                        <p style={{ fontSize: 15, color: "#64748b", margin: 0, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                            <ClipboardCheck size={16} color="#4f46e5" />
                            {submissions.some(s => s.task_id !== submissions[0]?.task_id) ? "Berbagai Tugas" : taskName} — <span style={{ color: "#0f172a" }}>{submissions.length} Pengumpulan</span>
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ background: "white", borderRadius: 16, padding: "14px 24px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <CheckCircle2 size={24} color="#4f46e5" />
                            </div>
                            <div>
                                <p style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1 }}>{graded}/{submissions.length}</p>
                                <p style={{ fontSize: 11, fontWeight: 800, color: "#64748b", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Selesai Dinilai</p>
                            </div>
                        </div>
                        <div style={{ background: "white", borderRadius: 16, padding: "14px 24px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Award size={24} color="#ea580c" />
                            </div>
                            <div>
                                <p style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1 }}>{avg.toFixed(1)}</p>
                                <p style={{ fontSize: 11, fontWeight: 800, color: "#64748b", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rata-rata Nilai</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* GRADING CARDS */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {submissions.length === 0 ? (
                        <div style={{ background: "white", borderRadius: 32, padding: "80px 20px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,.02)", border: "2px dashed #e2e8f0" }}>
                            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                                <ClipboardCheck size={40} color="#cbd5e1" />
                            </div>
                            <h3 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: "0 0 10px" }}>Tidak Ada Pengumpulan</h3>
                            <p style={{ fontSize: 15, color: "#64748b", margin: "0", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>Belum ada mahasiswa yang mengumpulkan tugas ini.</p>
                        </div>
                    ) : (
                        Object.entries(
                            submissions.reduce((acc, s) => {
                                const tId = s.task_id || "unknown";
                                const tName = s.task?.nama_tugas || `Task #${tId}`;
                                if (!acc[tId]) acc[tId] = { name: tName, subs: [] };
                                acc[tId].subs.push(s);
                                return acc;
                            }, {})
                        ).map(([tId, group]) => (
                            <div key={tId} style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
                                <div style={{ padding: "20px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#4f46e5" }} />
                                        {group.name}
                                    </h3>
                                    <span style={{ padding: "4px 12px", borderRadius: 12, background: "white", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 800, color: "#475569" }}>
                                        {group.subs.length} Pengumpulan
                                    </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {group.subs.map((s, i) => (
                                        <GradingRow key={s.id} submission={s} index={i} onGradeSaved={fetchSubmissions} />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </main>
        </div>
    );
}
