import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { Search, Bell, Plus, Clock3, Users, BookOpen, CheckCircle2, BarChart2, TrendingUp } from "lucide-react";
import axiosClient from "../../axiosClient";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconVariant, label, value, trend }) {
    return (
        <div className="stat-card">
            <div className={`stat-card__icon icon-bg--${iconVariant}`}>{icon}</div>
            <div className="stat-card__body">
                <p className="stat-card__label">{label}</p>
                <p className="stat-card__value">{value}</p>
            </div>
            {trend && <span className="stat-card__trend">{trend}</span>}
        </div>
    );
}

// ─── Student Submission Item ───────────────────────────────────────────────────
function SubmissionItem({ name, nim, task, status, time }) {
    const statusMap = {
        submitted:  { label: "Dikumpulkan", cls: "status--green"  },
        late:       { label: "Terlambat",   cls: "status--red"    },
        pending:    { label: "Belum",        cls: "status--gray"   },
    };
    const s = statusMap[status] || statusMap.pending;
    return (
        <div className="submission-item">
            <div className="submission-item__avatar">{name.charAt(0)}</div>
            <div className="submission-item__body">
                <p className="submission-item__name">{name} <span className="submission-item__nim">({nim})</span></p>
                <p className="submission-item__task">{task}</p>
            </div>
            <div className="submission-item__right">
                <span className={`status-badge ${s.cls}`}>{s.label}</span>
                <p className="submission-item__time">{time}</p>
            </div>
        </div>
    );
}

// ─── Task Management Item (for dosen) ─────────────────────────────────────────
function TaskManageItem({ title, course, deadline, submitted, total, badgeVariant }) {
    const pct = Math.round((submitted / total) * 100);
    return (
        <div className="task-manage-item">
            <div className="task-manage-item__left">
                <span className={`task-item__badge badge--${badgeVariant}`}>{course}</span>
                <p className="task-manage-item__title">{title}</p>
                <p className="task-manage-item__deadline"><Clock3 size={12} /> {deadline}</p>
            </div>
            <div className="task-manage-item__right">
                <p className="task-manage-item__count">{submitted}/{total} <span>mahasiswa</span></p>
                <div className="progress-bar" style={{ width: "80px" }}>
                    <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="task-manage-item__pct">{pct}%</p>
            </div>
        </div>
    );
}

// ─── Dosen Dashboard ─────────────────────────────────────────────────────────
export default function DosenDashboard() {
    const [stats, setStats] = useState({
        total_mahasiswa: 0,
        tugas_aktif: 0,
        sudah_dinilai: 0,
        rata_rata_nilai: 0,
    });
    const [tasks, setTasks] = useState([]);
    const [matkuls, setMatkuls] = useState([]);
    const [showMatkulModal, setShowMatkulModal] = useState(false);
    const [matkulForm, setMatkulForm] = useState({ kode_mk: "", nama_matkul: "" });
    const [matkulLoading, setMatkulLoading] = useState(false);
    const [user, setUser] = useState({});

    async function handleAddMatkul(e) {
        e.preventDefault();
        setMatkulLoading(true);
        try {
            const res = await axiosClient.post('/dosen/mata-kuliah', {
                ...matkulForm,
                nama_dosen: user.name,
            });
            setMatkuls([...matkuls, res.data.mata_kuliah]);
            setShowMatkulModal(false);
            setMatkulForm({ kode_mk: "", nama_matkul: "" });
        } catch (err) {
            console.error(err);
            alert("Gagal menambahkan kelas. Pastikan kode mata kuliah unik.");
        } finally {
            setMatkulLoading(false);
        }
    }

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(u);

        axiosClient.get('/dosen/dashboard-stats')
            .then(({ data }) => setStats(data))
            .catch(err => console.error(err));

        axiosClient.get('/dosen/tasks')
            .then(({ data }) => {
                // Filter active tasks
                setTasks(data.filter(t => t.status === 'active').slice(0, 3));
            })
            .catch(err => console.error(err));

        axiosClient.get('/dosen/mata-kuliah')
            .then(({ data }) => setMatkuls(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="app-wrapper">

            {/* SIDEBAR */}
            <Sidebar role="dosen" />

            {/* MAIN */}
            <main className="main-content">

                {/* TOPBAR */}
                <div className="topbar">
                    <div>
                        <h1 className="topbar__title">Selamat Datang, {user.name}</h1>
                        <p className="topbar__subtitle">
                            Belum ada pengumpulan baru hari ini.
                        </p>
                    </div>
                    <div className="topbar__actions">
                        <button className="icon-btn"><Search size={17} /></button>
                        <button className="icon-btn"><Bell size={17} /></button>
                    </div>
                </div>

                <div className="stats-row">
                    <StatCard
                        icon={<Users size={20} color="#4338ca" />}
                        iconVariant="indigo"
                        label="Total Mahasiswa"
                        value={stats.total_mahasiswa}
                    />
                    <StatCard
                        icon={<BookOpen size={20} color="#ea580c" />}
                        iconVariant="orange"
                        label="Tugas Aktif"
                        value={stats.tugas_aktif}
                    />
                    <StatCard
                        icon={<CheckCircle2 size={20} color="#16a34a" />}
                        iconVariant="green"
                        label="Sudah Dinilai"
                        value={stats.sudah_dinilai}
                    />
                    <StatCard
                        icon={<TrendingUp size={20} color="#7c3aed" />}
                        iconVariant="purple"
                        label="Rata-rata Nilai"
                        value={stats.rata_rata_nilai}
                    />
                </div>

                {/* GRID */}
                <div className="dashboard-grid">

                    {/* ── LEFT ── */}
                    <div className="col-left">

                        {/* Tugas yang Dikelola */}
                        <div className="section-header">
                            <h2 className="section-header__title">Tugas yang Dikelola</h2>
                            <button className="btn-link">Kelola Semua</button>
                        </div>
                        <div className="task-list">
                            {tasks.map(t => (
                                <TaskManageItem
                                    key={t.id_task}
                                    title={t.nama_tugas}
                                    course={t.mata_kuliah?.nama_matkul}
                                    deadline={`${t.deadline} ${t.jam}`}
                                    submitted={t.submitted_count || 0}
                                    total={stats.total_mahasiswa}
                                    badgeVariant="indigo"
                                />
                            ))}
                            {tasks.length === 0 && <p style={{color:'#9ca3af', padding:'20px 0'}}>Belum ada tugas aktif.</p>}
                        </div>

                        {/* Statistik Kelas */}
                        <div style={{ marginTop: "24px" }}>
                            <div className="section-header" style={{ marginBottom: "14px" }}>
                                <h2 className="section-header__title">Ringkasan Kelas</h2>
                                <button className="btn-link" onClick={() => setShowMatkulModal(true)}>+ Tambah Kelas</button>
                            </div>
                            <div className="course-grid">
                                {matkuls.length > 0 ? matkuls.map(m => (
                                    <div className="course-card" key={m.id_matkul || m.kode_mk}>
                                        <div className="course-card__header">
                                            <div className="course-card__icon icon-bg--indigo">
                                                <BookOpen size={20} color="#4338ca" />
                                            </div>
                                            <div>
                                                <p className="course-card__title">{m.nama_matkul}</p>
                                                <p className="course-card__sub">{m.kode_mk}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p style={{color:'#9ca3af', padding:'10px 0'}}>Belum ada kelas aktif.</p>}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT ── */}
                    <div className="col-right">

                        {/* Pengumpulan Terbaru */}
                        <div className="card">
                            <h2 className="card__title">Pengumpulan Terbaru</h2>
                            <div className="deadline-list" style={{ gap: "8px" }}>
                                <p style={{color:'#9ca3af', fontSize:13}}>Belum ada pengumpulan.</p>
                            </div>
                            <button className="btn-outline">Lihat Semua Pengumpulan</button>
                        </div>

                        {/* Aktivitas Dosen */}
                        <div className="card">
                            <h2 className="card__title card__title--lg">Aktivitas Terakhir</h2>
                            <div className="activity-timeline">
                                <p style={{color:'#9ca3af', fontSize:13}}>Belum ada aktivitas.</p>
                            </div>
                        </div>
                    </div>

                </div>

            </main>

            {/* MODAL TAMBAH KELAS */}
            {showMatkulModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                    <div style={{ background: "white", padding: 24, borderRadius: 16, width: 400, animation: "pop-in 0.3s ease" }}>
                        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Tambah Kelas Baru</h2>
                        <form onSubmit={handleAddMatkul} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 700 }}>Kode Mata Kuliah</label>
                                <input required type="text" value={matkulForm.kode_mk} onChange={e => setMatkulForm({...matkulForm, kode_mk: e.target.value})} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", marginTop: 4, outline: "none", fontFamily: "inherit" }} placeholder="e.g. IF101" />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 700 }}>Nama Mata Kuliah</label>
                                <input required type="text" value={matkulForm.nama_matkul} onChange={e => setMatkulForm({...matkulForm, nama_matkul: e.target.value})} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", marginTop: 4, outline: "none", fontFamily: "inherit" }} placeholder="e.g. Pemrograman Web" />
                            </div>
                            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                                <button type="button" onClick={() => setShowMatkulModal(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>Batal</button>
                                <button type="submit" disabled={matkulLoading} style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: "#4338ca", color: "white", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", opacity: matkulLoading ? 0.7 : 1 }}>{matkulLoading ? "Menyimpan..." : "Simpan"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
