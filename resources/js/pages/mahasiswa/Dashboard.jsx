import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { Search, Bell, Plus, Clock3, Code2, Calculator } from "lucide-react";
import axiosClient from "../../axiosClient";

// ─── Circular Progress ───────────────────────────────────────────────────────
function CircleProgress({ percent = 75 }) {
    const radius = 52;
    const stroke = 13;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <div className="circle-progress">
            <svg width="130" height="130" viewBox="0 0 130 130">
                {/* Background track */}
                <circle
                    cx="65" cy="65"
                    r={normalizedRadius}
                    fill="none"
                    stroke="#e0e7ff"
                    strokeWidth={stroke}
                />
                {/* Progress arc */}
                <circle
                    cx="65" cy="65"
                    r={normalizedRadius}
                    fill="none"
                    stroke="#4338ca"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 65 65)"
                    className="circle-progress__arc"
                />
            </svg>
            <div className="circle-progress__center">
                <span className="circle-progress__percent">{percent}%</span>
                <span className="circle-progress__label">DONE</span>
            </div>
        </div>
    );
}

import { Link } from "react-router-dom";

function TaskItem({ id, title, badge, badgeVariant, time, timeVariant }) {
    return (
        <Link to="/mahasiswa/tasks/detail" state={{ taskId: id }} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="task-item">
                <div className="task-item__checkbox" />
                <div className="task-item__body">
                    <p className="task-item__title">{title}</p>
                    <div className="task-item__meta">
                        <span className={`task-item__badge badge--${badgeVariant}`}>
                            {badge}
                        </span>
                        <div className={`task-item__time time--${timeVariant}`}>
                            <Clock3 size={13} />
                            {time}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ icon, iconVariant, title, sub, progress }) {
    return (
        <div className="course-card">
            <div className="course-card__header">
                <div className={`course-card__icon icon-bg--${iconVariant}`}>
                    {icon}
                </div>
                <div>
                    <p className="course-card__title">{title}</p>
                    <p className="course-card__sub">{sub}</p>
                </div>
            </div>
            <div className="progress-bar">
                <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}

// ─── Mahasiswa Dashboard ─────────────────────────────────────────────────────
export default function MahasiswaDashboard() {
    const [user, setUser] = useState({});
    const [stats, setStats] = useState({ tugas_selesai: 0, tugas_aktif: 0, total_tugas: 0, rata_nilai: 0 });
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(u);

        axiosClient.get('/mahasiswa/dashboard-stats')
            .then(({ data }) => setStats(data))
            .catch(err => console.error(err));

        axiosClient.get('/mahasiswa/tasks')
            .then(({ data }) => setTasks(data.slice(0, 4)))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const percent = stats.total_tugas > 0
        ? Math.round((stats.tugas_selesai / stats.total_tugas) * 100)
        : 0;

    return (
        <div className="app-wrapper">

            {/* SIDEBAR */}
            <Sidebar role="mahasiswa" />

            {/* MAIN */}
            <main className="main-content">

                {/* TOPBAR */}
                <div className="topbar">
                    <div>
                        <h1 className="topbar__title">Selamat Datang, {user.name}</h1>
                        <p className="topbar__subtitle">
                            Kamu punya {stats.tugas_aktif} tugas yang harus diselesaikan.
                        </p>
                    </div>
                    <div className="topbar__actions">
                        <button className="icon-btn"><Search size={17} /></button>
                        <button className="icon-btn"><Bell size={17} /></button>
                    </div>
                </div>

                {/* GRID */}
                <div className="dashboard-grid">

                    {/* ── LEFT ── */}
                    <div className="col-left">

                        {/* Progress Card */}
                        <div className="progress-card">
                            <div className="progress-card__body">
                                <p className="progress-card__label">Progress Mingguan</p>
                                <h2 className="progress-card__title">Hampir Selesai!</h2>
                                <p className="progress-card__desc">
                                    Kamu sudah menyelesaikan {stats.tugas_selesai} dari {stats.total_tugas} tugas.
                                    Rata-rata nilaimu: <strong>{stats.rata_nilai}</strong>.
                                </p>
                                <Link to="/mahasiswa/tasks" className="btn-primary" style={{ textDecoration: "none" }}>Lihat Semua Tugas</Link>
                            </div>
                            <CircleProgress percent={percent} />
                        </div>

                        {/* Tugas Hari Ini */}
                        <div className="section-header">
                            <h2 className="section-header__title">Tugas Hari Ini</h2>
                            <button className="btn-link">Lihat Semua</button>
                        </div>

                        <div className="task-list">
                            {tasks.length > 0 ? tasks.map(t => (
                                <TaskItem
                                    key={t.task.id_task}
                                    id={t.task.id_task}
                                    title={t.task.nama_tugas}
                                    badge={t.task.nama_matkul || "Umum"}
                                    badgeVariant="indigo"
                                    time={t.task.jam || "23:59"}
                                    timeVariant="red"
                                />
                            )) : (
                                <p style={{ color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>Belum ada tugas.</p>
                            )}
                        </div>

                        {/* Mata Kuliah Aktif */}
                        <div>
                            <h2 className="section-header__title" style={{ marginBottom: "14px" }}>
                                Mata Kuliah Aktif
                            </h2>
                            <div className="course-grid">
                                <CourseCard
                                    icon={<Code2 size={20} color="#4338ca" />}
                                    iconVariant="indigo"
                                    title="Kecerdasan Buatan"
                                    sub="3 SKS • Lab 1"
                                    progress={75}
                                />
                                <CourseCard
                                    icon={<Calculator size={20} color="#ea580c" />}
                                    iconVariant="orange"
                                    title="Mobile Programming Lanjut"
                                    sub="4 SKS • Lab 2"
                                    progress={40}
                                />
                            </div>
                        </div>

                    </div>

                    {/* ── RIGHT ── */}
                    <div className="col-right">

                        {/* Deadline Mendatang */}
                        <div className="card">
                            <h2 className="card__title">Deadline Mendatang</h2>
                            <div className="deadline-list">
                                {tasks.slice(0, 3).map(t => {
                                    const date = new Date(t.task.deadline);
                                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
                                    return (
                                        <div key={t.task.id_task} className="deadline-item">
                                            <div className="deadline-item__date deadline-item__date--red">
                                                <p className="deadline-item__month">{monthNames[date.getMonth()]}</p>
                                                <p className="deadline-item__day">{date.getDate()}</p>
                                            </div>
                                            <div>
                                                <p className="deadline-item__title">{t.task.nama_tugas}</p>
                                                <p className="deadline-item__sub">{t.task.jam || "23:59"}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button className="btn-outline">Lihat Kalender</button>
                        </div>

                        {/* Aktivitas Terakhir */}
                        <div className="card">
                            <h2 className="card__title card__title--lg">Aktivitas Terakhir</h2>
                            <div className="activity-timeline">

                                <div className="activity-item">
                                    <div className="activity-item__dot dot--active" />
                                    <p className="activity-item__title">Mengunggah Tugas Algoritma</p>
                                    <p className="activity-item__time">10 Menit yang lalu</p>
                                </div>

                                <div className="activity-item">
                                    <div className="activity-item__dot dot--inactive" />
                                    <p className="activity-item__title">Diskusi Grup: Proyek AI</p>
                                    <p className="activity-item__time">2 Jam yang lalu</p>
                                </div>

                                <div className="activity-item">
                                    <div className="activity-item__dot dot--inactive" />
                                    <p className="activity-item__title">Diskusi Grup: Komputasi Awan</p>
                                    <p className="activity-item__time">Kemarin</p>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>

                {/* FAB */}
                <button className="fab">
                    <Plus size={24} />
                </button>

            </main>
        </div>
    );
}
