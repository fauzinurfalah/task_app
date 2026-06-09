import { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import Sidebar from "../../components/Sidebar";
import { Search, TrendingUp, Award, BookOpen, MoreHorizontal, Mail, Phone } from "lucide-react";

// ─── Student Card ─────────────────────────────────────────────────────────────
function StudentCard({ student }) {
    const gradeColor = student.avg >= 80 ? "#16a34a" : student.avg >= 60 ? "#ea580c" : "#dc2626";
    return (
        <div className="student-card">
            <div className="student-card__top">
                <div className="submission-item__avatar" style={{ width: 46, height: 46, fontSize: 16 }}>{student.name.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: 14, margin: 0, color: "#111827" }}>{student.name}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0 0" }}>{student.nim}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 900, fontSize: 22, margin: 0, color: gradeColor }}>{student.avg}</p>
                    <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>rata-rata</p>
                </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0" }}>
                {student.courses.map(c => (
                    <span key={c} className="task-item__badge badge--indigo" style={{ fontSize: 10 }}>{c}</span>
                ))}
                <span className={`status-badge ${student.status === "aktif" ? "status--green" : "status--gray"}`}>{student.status}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", borderTop: "1px solid #f3f4f6", paddingTop: 10, marginTop: 6 }}>
                <span>✅ {student.submitted} dikumpulkan</span>
                <span>⏳ {student.pending} belum</span>
            </div>

            <div className="student-card__contacts">
                <a href={`mailto:${student.email}`} className="contact-chip"><Mail size={11} />{student.email}</a>
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
            <main className="main-content">

                {/* TOPBAR */}
                <div className="topbar">
                    <div>
                        <h1 className="topbar__title">Data Mahasiswa</h1>
                        <p className="topbar__subtitle">{students.length} mahasiswa terdaftar di mata kuliah Anda.</p>
                    </div>
                </div>

                {/* SUMMARY STATS */}
                <div className="stats-row" style={{ marginBottom: 20 }}>
                    <div className="stat-card">
                        <div className="stat-card__icon icon-bg--indigo"><BookOpen size={20} color="#4338ca" /></div>
                        <div className="stat-card__body"><p className="stat-card__label">Total Mahasiswa</p><p className="stat-card__value">{students.length}</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon icon-bg--green"><TrendingUp size={20} color="#16a34a" /></div>
                        <div className="stat-card__body"><p className="stat-card__label">Rata-rata Nilai</p><p className="stat-card__value">{AVG_ALL}</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon icon-bg--purple"><Award size={20} color="#7c3aed" /></div>
                        <div className="stat-card__body"><p className="stat-card__label">Nilai Tertinggi</p><p className="stat-card__value">{students.length > 0 ? Math.max(...students.map(s => s.avg)) : 0}</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon icon-bg--orange"><MoreHorizontal size={20} color="#ea580c" /></div>
                        <div className="stat-card__body"><p className="stat-card__label">Aktif</p><p className="stat-card__value">{students.filter(s => s.status === "aktif").length}</p></div>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="page-toolbar" style={{ marginBottom: 20 }}>
                    <div className="search-box">
                        <Search size={15} color="#9ca3af" />
                        <input className="search-box__input" placeholder="Cari nama atau NIM..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="filter-tabs">
                        <button className={`filter-tab ${courseFilter === "all" ? "filter-tab--active" : ""}`} onClick={() => setCourse("all")}>Semua</button>
                        {courses.map(c => (
                            <button key={c} className={`filter-tab ${courseFilter === c ? "filter-tab--active" : ""}`} onClick={() => setCourse(c)}>{c}</button>
                        ))}
                    </div>
                </div>

                {/* LIST */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {loading ? (
                        <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", gridColumn: "1 / -1" }}>Memuat daftar mahasiswa...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", gridColumn: "1 / -1" }}>Tidak ada mahasiswa yang sesuai.</div>
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
