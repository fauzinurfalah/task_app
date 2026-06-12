import { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/NotificationBell";
import { Search, TrendingUp, Award, BookOpen, MoreHorizontal, Mail, Phone, Users } from "lucide-react";

// ─── Student Card ─────────────────────────────────────────────────────────────
function StudentCard({ student }) {
    const gradeColor = student.avg >= 80 ? "#10b981" : student.avg >= 60 ? "#ea580c" : "#ef4444";
    const gradeBg    = student.avg >= 80 ? "#ecfdf5" : student.avg >= 60 ? "#fff7ed" : "#fef2f2";

    return (
        <div style={{ background: "white", borderRadius: 24, padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "#cbd5e1"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.02)"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
                        {student.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 4px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.name}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b", margin: 0 }}>{student.nim}</p>
                    </div>
                </div>
                <div style={{ textAlign: "right", background: gradeBg, padding: "8px 12px", borderRadius: 12 }}>
                    <p style={{ fontWeight: 900, fontSize: 20, margin: 0, color: gradeColor, lineHeight: 1 }}>{student.avg}</p>
                    <p style={{ fontSize: 10, fontWeight: 800, color: gradeColor, margin: "4px 0 0", textTransform: "uppercase", opacity: 0.8 }}>Rata-rata</p>
                </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {student.courses.map(c => (
                    <span key={c} style={{ background: "#eef2ff", color: "#4f46e5", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800, letterSpacing: "0.5px" }}>{c}</span>
                ))}
                <span style={{ background: student.status === "aktif" ? "#ecfdf5" : "#f1f5f9", color: student.status === "aktif" ? "#059669" : "#64748b", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>{student.status}</span>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, background: "#f8fafc", padding: "12px", borderRadius: 12, border: "1px solid #f1f5f9", textAlign: "center" }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", lineHeight: 1 }}>{student.submitted}</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Dikumpulkan</p>
                </div>
                <div style={{ flex: 1, background: "#fef2f2", padding: "12px", borderRadius: 12, border: "1px solid #fee2e2", textAlign: "center" }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: "#dc2626", margin: "0 0 4px", lineHeight: 1 }}>{student.pending}</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Belum Mengumpul</p>
                </div>
            </div>

            <div style={{ paddingTop: 16, borderTop: "1px dashed #e2e8f0" }}>
                <a href={`mailto:${student.email}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#475569", textDecoration: "none", background: "#f8fafc", padding: "6px 12px", borderRadius: 10, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}>
                    <Mail size={14} color="#94a3b8" />{student.email}
                </a>
            </div>
        </div>
    );
}

// ─── Students Page ────────────────────────────────────────────────────────────
export default function DosenStudents() {
    const [search, setSearch]       = useState("");
    const [courseFilter, setCourse] = useState("all");
    const [students, setStudents]   = useState([]);
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        axiosClient.get('/dosen/students')
            .then(({ data }) => {
                const mapped = data.map(s => ({
                    id: s.id,
                    name: s.name,
                    nim: s.nim || "-",
                    email: s.email,
                    courses: s.courses?.map(c => c.nama_matkul) || [],
                    avg: s.submissions_avg_grade ? Math.round(s.submissions_avg_grade) : 0,
                    submitted: s.submitted_count || 0,
                    pending: s.pending_count || 0,
                    status: "aktif"
                }));
                setStudents(mapped);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const courses = [...new Set(students.flatMap(s => s.courses))];
    const AVG_ALL = students.length > 0 ? (students.reduce((a, s) => a + s.avg, 0) / students.length).toFixed(1) : 0;

    const filtered = students.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.nim.includes(search);
        const matchCourse = courseFilter === "all" || s.courses.includes(courseFilter);
        return matchSearch && matchCourse;
    });

    return (
        <div className="app-wrapper">
            <Sidebar role="dosen" />
            <main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px", minHeight: "100vh" }}>

                {/* TOPBAR */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.5px" }}>Data Mahasiswa</h1>
                        <p style={{ fontSize: 15, color: "#64748b", margin: 0, fontWeight: 600 }}>{students.length} mahasiswa terdaftar di mata kuliah Anda.</p>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                        <NotificationBell />
                    </div>
                </div>

                {/* SUMMARY STATS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
                    <div style={{ background: "white", borderRadius: 24, padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Users size={28} color="#4f46e5" />
                        </div>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 800, color: "#64748b", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Mahasiswa</p>
                            <p style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1 }}>{students.length}</p>
                        </div>
                    </div>
                    <div style={{ background: "white", borderRadius: 24, padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <TrendingUp size={28} color="#10b981" />
                        </div>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 800, color: "#64748b", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rata-rata Nilai</p>
                            <p style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1 }}>{AVG_ALL}</p>
                        </div>
                    </div>
                    <div style={{ background: "white", borderRadius: 24, padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Award size={28} color="#8b5cf6" />
                        </div>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 800, color: "#64748b", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Nilai Tertinggi</p>
                            <p style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1 }}>{students.length > 0 ? Math.max(...students.map(s => s.avg)) : 0}</p>
                        </div>
                    </div>
                    <div style={{ background: "white", borderRadius: 24, padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <MoreHorizontal size={28} color="#ea580c" />
                        </div>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 800, color: "#64748b", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mahasiswa Aktif</p>
                            <p style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1 }}>{students.filter(s => s.status === "aktif").length}</p>
                        </div>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "white", padding: "14px 20px", borderRadius: 16, border: "1px solid #e2e8f0", flex: "1 1 300px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                        <Search size={18} color="#94a3b8" />
                        <input placeholder="Cari nama mahasiswa atau NIM..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: "none", outline: "none", fontSize: 14, fontFamily: "inherit", width: "100%", fontWeight: 600, color: "#0f172a", background: "transparent" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", padding: "8px", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px", color: "#64748b", fontWeight: 700, fontSize: 13 }}><BookOpen size={16} /> Filter Mata Kuliah:</div>
                        <button style={{ padding: "8px 16px", borderRadius: 12, border: "none", background: courseFilter === "all" ? "#4f46e5" : "transparent", color: courseFilter === "all" ? "white" : "#64748b", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }} onClick={() => setCourse("all")}>Semua</button>
                        {courses.map(c => (
                            <button key={c} style={{ padding: "8px 16px", borderRadius: 12, border: "none", background: courseFilter === c ? "#4f46e5" : "transparent", color: courseFilter === c ? "white" : "#64748b", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }} onClick={() => setCourse(c)}>{c}</button>
                        ))}
                    </div>
                </div>

                {/* LIST */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                    {loading ? (
                        <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b", fontWeight: 700, gridColumn: "1 / -1", background: "white", borderRadius: 24, border: "1px solid #e2e8f0" }}>Memuat daftar mahasiswa...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: "80px 20px", textAlign: "center", gridColumn: "1 / -1", background: "white", borderRadius: 24, border: "2px dashed #e2e8f0" }}>
                            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Users size={32} color="#cbd5e1" /></div>
                            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Tidak Ada Mahasiswa</h3>
                            <p style={{ fontSize: 15, color: "#64748b", margin: 0 }}>Tidak ada data yang sesuai dengan pencarian Anda.</p>
                        </div>
                    ) : (
                        filtered.map(student => (
                            <StudentCard key={student.id} student={student} />
                        ))
                    )}
                </div>

            </main>
        </div>
    );
}
