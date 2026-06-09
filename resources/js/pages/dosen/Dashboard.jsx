import Sidebar from "../../components/Sidebar";
import { Search, Bell, Plus, Clock3, Users, BookOpen, CheckCircle2, BarChart2, TrendingUp } from "lucide-react";

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
    return (
        <div className="app-wrapper">

            {/* SIDEBAR */}
            <Sidebar role="dosen" />

            {/* MAIN */}
            <main className="main-content">

                {/* TOPBAR */}
                <div className="topbar">
                    <div>
                        <h1 className="topbar__title">Selamat Datang, Dr. Budi</h1>
                        <p className="topbar__subtitle">
                            Ada 12 pengumpulan baru yang perlu diperiksa hari ini.
                        </p>
                    </div>
                    <div className="topbar__actions">
                        <button className="icon-btn"><Search size={17} /></button>
                        <button className="icon-btn"><Bell size={17} /></button>
                        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 13 }}>
                            <Plus size={15} /> Buat Tugas
                        </button>
                    </div>
                </div>

                {/* STAT CARDS */}
                <div className="stats-row">
                    <StatCard
                        icon={<Users size={20} color="#4338ca" />}
                        iconVariant="indigo"
                        label="Total Mahasiswa"
                        value="128"
                        trend="+3 baru"
                    />
                    <StatCard
                        icon={<BookOpen size={20} color="#ea580c" />}
                        iconVariant="orange"
                        label="Tugas Aktif"
                        value="6"
                        trend="2 deadline hari ini"
                    />
                    <StatCard
                        icon={<CheckCircle2 size={20} color="#16a34a" />}
                        iconVariant="green"
                        label="Sudah Dinilai"
                        value="84"
                        trend="dari 128"
                    />
                    <StatCard
                        icon={<TrendingUp size={20} color="#7c3aed" />}
                        iconVariant="purple"
                        label="Rata-rata Nilai"
                        value="82.4"
                        trend="↑ +1.2 minggu ini"
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
                            <TaskManageItem
                                title="Implementasi Algoritma Sorting"
                                course="Algoritma & Pemrograman"
                                deadline="Hari ini, 23:59"
                                submitted={38}
                                total={42}
                                badgeVariant="indigo"
                            />
                            <TaskManageItem
                                title="Laporan Praktikum Jaringan"
                                course="Jaringan Komputer"
                                deadline="Besok, 12:00"
                                submitted={20}
                                total={35}
                                badgeVariant="orange"
                            />
                            <TaskManageItem
                                title="Proyek Akhir - Machine Learning"
                                course="Kecerdasan Buatan"
                                deadline="3 Jun, 23:59"
                                submitted={5}
                                total={30}
                                badgeVariant="purple"
                            />
                        </div>

                        {/* Statistik Kelas */}
                        <div style={{ marginTop: "24px" }}>
                            <h2 className="section-header__title" style={{ marginBottom: "14px" }}>
                                Ringkasan Kelas
                            </h2>
                            <div className="course-grid">
                                <div className="course-card">
                                    <div className="course-card__header">
                                        <div className="course-card__icon icon-bg--indigo">
                                            <BarChart2 size={20} color="#4338ca" />
                                        </div>
                                        <div>
                                            <p className="course-card__title">Algoritma</p>
                                            <p className="course-card__sub">42 Mahasiswa</p>
                                        </div>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-bar__fill" style={{ width: "90%" }} />
                                    </div>
                                </div>
                                <div className="course-card">
                                    <div className="course-card__header">
                                        <div className="course-card__icon icon-bg--orange">
                                            <BarChart2 size={20} color="#ea580c" />
                                        </div>
                                        <div>
                                            <p className="course-card__title">Jaringan Komputer</p>
                                            <p className="course-card__sub">35 Mahasiswa</p>
                                        </div>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-bar__fill" style={{ width: "57%" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT ── */}
                    <div className="col-right">

                        {/* Pengumpulan Terbaru */}
                        <div className="card">
                            <h2 className="card__title">Pengumpulan Terbaru</h2>
                            <div className="deadline-list" style={{ gap: "8px" }}>
                                <SubmissionItem name="Andi"   nim="2021001" task="Sorting Algorithm" status="submitted" time="10 menit lalu" />
                                <SubmissionItem name="Sari"   nim="2021015" task="Jaringan - Lab 3"  status="late"      time="2 jam lalu"   />
                                <SubmissionItem name="Rizky"  nim="2021032" task="Sorting Algorithm" status="submitted" time="3 jam lalu"   />
                                <SubmissionItem name="Dewi"   nim="2021007" task="Sorting Algorithm" status="pending"   time="—"            />
                            </div>
                            <button className="btn-outline">Lihat Semua Pengumpulan</button>
                        </div>

                        {/* Aktivitas Dosen */}
                        <div className="card">
                            <h2 className="card__title card__title--lg">Aktivitas Terakhir</h2>
                            <div className="activity-timeline">
                                <div className="activity-item">
                                    <div className="activity-item__dot dot--active" />
                                    <p className="activity-item__title">Memberi nilai: Algoritma Sorting (Andi)</p>
                                    <p className="activity-item__time">15 Menit yang lalu</p>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-item__dot dot--inactive" />
                                    <p className="activity-item__title">Membuat tugas baru: Proyek ML</p>
                                    <p className="activity-item__time">1 Jam yang lalu</p>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-item__dot dot--inactive" />
                                    <p className="activity-item__title">Mengumumkan revisi deadline: Jaringan</p>
                                    <p className="activity-item__time">Kemarin</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
