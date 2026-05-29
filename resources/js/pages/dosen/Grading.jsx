import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { ChevronLeft, Save, Star, FileText, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

// ─── Sample Data ──────────────────────────────────────────────────────────────
const SUBMISSIONS = [
    { id: 1, name: "Andi Saputra",  nim: "2021001", file: "andi_sorting.zip",  submittedAt: "2026-05-29 22:30", grade: null,  feedback: "",  status: "submitted" },
    { id: 2, name: "Sari Dewi",     nim: "2021015", file: "sari_sorting.zip",  submittedAt: "2026-05-30 01:10", grade: null,  feedback: "",  status: "late"      },
    { id: 3, name: "Rizky Maulana", nim: "2021032", file: "rizky_sorting.zip", submittedAt: "2026-05-29 20:15", grade: 88,    feedback: "Kerjaan bagus, merge sort sudah optimal.", status: "submitted" },
    { id: 4, name: "Budi Santoso",  nim: "2021044", file: "budi_sorting.zip",  submittedAt: "2026-05-29 18:00", grade: 92,    feedback: "Excellent! Semua algoritma benar dan terdokumentasi.", status: "submitted" },
    { id: 5, name: "Rina Suryani",  nim: "2021020", file: "rina_sorting.zip",  submittedAt: "2026-05-29 21:45", grade: 75,    feedback: "Quick sort ada bug di edge case. Perlu diperbaiki.", status: "submitted" },
    { id: 6, name: "Laila Fitriani",nim: "2021011", file: "laila_sorting.zip", submittedAt: "2026-05-30 09:00", grade: null,  feedback: "",  status: "late"      },
];

const RUBRIC = [
    { item: "Implementasi Bubble Sort", maxPoin: 25 },
    { item: "Implementasi Merge Sort",  maxPoin: 35 },
    { item: "Implementasi Quick Sort",  maxPoin: 30 },
    { item: "Dokumentasi & Kerapian",   maxPoin: 10 },
];

// ─── Grading Row ──────────────────────────────────────────────────────────────
function GradingRow({ submission, index }) {
    const [expanded, setExpanded] = useState(index === 0);
    const [rubricScores, setRubricScores] = useState(
        RUBRIC.map(r => ({ ...r, score: 0 }))
    );
    const [feedback, setFeedback]     = useState(submission.feedback || "");
    const [saved, setSaved]           = useState(submission.grade !== null);
    const [finalGrade, setFinalGrade] = useState(submission.grade);

    const total = rubricScores.reduce((s, r) => s + Number(r.score), 0);

    function handleSave() {
        setFinalGrade(total);
        setSaved(true);
    }

    const gradeColor = finalGrade >= 80 ? "#16a34a" : finalGrade >= 60 ? "#ea580c" : finalGrade ? "#dc2626" : "#9ca3af";

    return (
        <div className={`grading-row ${saved ? "grading-row--saved" : ""}`}>
            {/* Summary row */}
            <div className="grading-row__header" onClick={() => setExpanded(e => !e)}>
                <div className="submission-item__avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{submission.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{submission.name}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{submission.nim} • {submission.submittedAt}</p>
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
                    <div className="attachment-chip" style={{ marginBottom: 16 }}>
                        <FileText size={13} />
                        <span>{submission.file}</span>
                    </div>

                    {/* Rubric scoring */}
                    <table className="grade-table" style={{ marginBottom: 16 }}>
                        <thead>
                            <tr><th>Kriteria</th><th>Maks</th><th>Nilai</th></tr>
                        </thead>
                        <tbody>
                            {rubricScores.map((r, i) => (
                                <tr key={i}>
                                    <td>{r.item}</td>
                                    <td style={{ color: "#9ca3af" }}>{r.maxPoin}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min={0}
                                            max={r.maxPoin}
                                            className="grade-input"
                                            value={r.score}
                                            onChange={e => {
                                                const v = Math.min(r.maxPoin, Math.max(0, Number(e.target.value)));
                                                setRubricScores(prev => prev.map((x, j) => j === i ? { ...x, score: v } : x));
                                                setSaved(false);
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                            <tr style={{ borderTop: "2px solid #e5e7eb" }}>
                                <td style={{ fontWeight: 800 }}>Total</td>
                                <td style={{ color: "#9ca3af" }}>100</td>
                                <td><span style={{ fontSize: 18, fontWeight: 900, color: gradeColor }}>{total}</span></td>
                            </tr>
                        </tbody>
                    </table>

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
                        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", fontSize: 13 }} onClick={handleSave}>
                            <Save size={14} /> Simpan Nilai
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
    const taskId   = params.get("task") || "1";

    const graded   = SUBMISSIONS.filter(s => s.grade !== null).length;
    const avg      = SUBMISSIONS.filter(s => s.grade).reduce((a, s) => a + s.grade, 0) / (SUBMISSIONS.filter(s => s.grade !== null).length || 1);

    return (
        <div className="app-wrapper">
            <Sidebar role="dosen" />
            <main className="main-content">

                {/* BREADCRUMB */}
                <div className="breadcrumb">
                    <Link to="/dosen/tasks" className="breadcrumb__link"><ChevronLeft size={14} /> Kelola Tugas</Link>
                    <span className="breadcrumb__sep">/</span>
                    <Link to={`/dosen/tasks/detail?id=${taskId}`} className="breadcrumb__link">Detail</Link>
                    <span className="breadcrumb__sep">/</span>
                    <span className="breadcrumb__current">Penilaian</span>
                </div>

                {/* TOPBAR */}
                <div className="topbar" style={{ marginTop: 8 }}>
                    <div>
                        <h1 className="topbar__title">Penilaian Tugas</h1>
                        <p className="topbar__subtitle">Implementasi Algoritma Sorting — {SUBMISSIONS.length} pengumpulan</p>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <div className="mini-stat" style={{ textAlign: "center", background: "white", borderRadius: 12, padding: "8px 20px" }}>
                            <p className="mini-stat__val" style={{ color: "#4338ca" }}>{graded}/{SUBMISSIONS.length}</p>
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
                    {SUBMISSIONS.map((s, i) => (
                        <GradingRow key={s.id} submission={s} index={i} />
                    ))}
                </div>

            </main>
        </div>
    );
}
