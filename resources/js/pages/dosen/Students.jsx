import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Search, TrendingUp, Award, BookOpen, MoreHorizontal, Mail, Phone } from "lucide-react";

// ─── Sample Students ──────────────────────────────────────────────────────────
const STUDENTS = [
    { id: 1,  name: "Andi Saputra",    nim: "2021001", email: "andi@mail.com",  phone: "081234567890", courses: ["Algoritma", "Jaringan"],   avg: 88, submitted: 12, pending: 1, status: "aktif"   },
    { id: 2,  name: "Sari Dewi",       nim: "2021015", email: "sari@mail.com",  phone: "081234567891", courses: ["Algoritma"],                avg: 73, submitted: 8,  pending: 3, status: "aktif"   },
    { id: 3,  name: "Rizky Maulana",   nim: "2021032", email: "rizky@mail.com", phone: "081234567892", courses: ["Algoritma", "AI"],          avg: 91, submitted: 15, pending: 0, status: "aktif"   },
    { id: 4,  name: "Dewi Lestari",    nim: "2021007", email: "dewi@mail.com",  phone: "081234567893", courses: ["Jaringan"],                 avg: 65, submitted: 6,  pending: 4, status: "aktif"   },
    { id: 5,  name: "Budi Santoso",    nim: "2021044", email: "budi@mail.com",  phone: "081234567894", courses: ["Algoritma", "Jaringan", "AI"], avg: 92, submitted: 18, pending: 0, status: "aktif" },
    { id: 6,  name: "Rina Suryani",    nim: "2021020", email: "rina@mail.com",  phone: "081234567895", courses: ["Algoritma"],                avg: 75, submitted: 10, pending: 2, status: "aktif"   },
    { id: 7,  name: "Hendra Wijaya",   nim: "2021055", email: "hendra@mail.com",phone: "081234567896", courses: ["Jaringan"],                 avg: 58, submitted: 5,  pending: 5, status: "cuti"    },
    { id: 8,  name: "Laila Fitriani",  nim: "2021011", email: "laila@mail.com", phone: "081234567897", courses: ["Algoritma", "AI"],          avg: 80, submitted: 11, pending: 1, status: "aktif"   },
    { id: 9,  name: "Yoga Pratama",    nim: "2021060", email: "yoga@mail.com",  phone: "081234567898", courses: ["AI"],                       avg: 84, submitted: 9,  pending: 2, status: "aktif"   },
    { id: 10, name: "Mega Wulandari",  nim: "2021033", email: "mega@mail.com",  phone: "081234567899", courses: ["Algoritma", "Jaringan"],   avg: 79, submitted: 13, pending: 1, status: "aktif"   },
];

const AVG_ALL = (STUDENTS.reduce((a, s) => a + s.avg, 0) / STUDENTS.length).toFixed(1);

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
    const [view, setView]           = useState("grid"); // grid | table

    const courses = [...new Set(STUDENTS.flatMap(s => s.courses))];

    const filtered = STUDENTS.filter(s => {
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
                        <p className="topbar__subtitle">{STUDENTS.length} mahasiswa terdaftar di mata kuliah Anda.</p>
                    </div>
                </div>

                {/* SUMMARY STATS */}
                <div className="stats-row" style={{ marginBottom: 20 }}>
                    <div className="stat-card">
                        <div className="stat-card__icon icon-bg--indigo"><BookOpen size={20} color="#4338ca" /></div>
                        <div className="stat-card__body"><p className="stat-card__label">Total Mahasiswa</p><p className="stat-card__value">{STUDENTS.length}</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon icon-bg--green"><TrendingUp size={20} color="#16a34a" /></div>
                        <div className="stat-card__body"><p className="stat-card__label">Rata-rata Nilai</p><p className="stat-card__value">{AVG_ALL}</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon icon-bg--purple"><Award size={20} color="#7c3aed" /></div>
                        <div className="stat-card__body"><p className="stat-card__label">Nilai Tertinggi</p><p className="stat-card__value">{Math.max(...STUDENTS.map(s => s.avg))}</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon icon-bg--orange"><MoreHorizontal size={20} color="#ea580c" /></div>
                        <div className="stat-card__body"><p className="stat-card__label">Aktif</p><p className="stat-card__value">{STUDENTS.filter(s => s.status === "aktif").length}</p></div>
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

                {/* GRID */}
                <div className="student-grid">
                    {filtered.map(s => <StudentCard key={s.id} student={s} />)}
                </div>
                {filtered.length === 0 && (
                    <p style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0" }}>Tidak ada mahasiswa ditemukan.</p>
                )}

            </main>
        </div>
    );
}
