import Sidebar from "../components/Sidebar";
import { Search, Bell, Plus, Clock3, Code2, Calculator } from "lucide-react";

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

// ─── Task Item ────────────────────────────────────────────────────────────────
function TaskItem({ title, badge, badgeVariant, time, timeVariant }) {
    return (
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

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
    return (
        <div className="app-wrapper">

            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN */}
            <main className="main-content">

                {/* TOPBAR */}
                <div className="topbar">
                    <div>
                        <h1 className="topbar__title">Selamat Datang, Fauzi</h1>
                        <p className="topbar__subtitle">
                            Kamu punya 4 tugas yang harus diselesaikan hari ini.
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
                                    Penyelesaian tugas kamu meningkat 12% dibandingkan minggu lalu.
                                    Pertahankan ritme ini untuk menjaga IPK kamu tetap stabil.
                                </p>
                                <button className="btn-primary">Lihat Analitik Lengkap</button>
                            </div>
                            <CircleProgress percent={75} />
                        </div>

                        {/* Tugas Hari Ini */}
                        <div className="section-header">
                            <h2 className="section-header__title">Tugas Hari Ini</h2>
                            <button className="btn-link">Lihat Semua</button>
                        </div>

                        <div className="task-list">
                            <TaskItem
                                title="Algoritma"
                                badge="Matematika"
                                badgeVariant="indigo"
                                time="14:00"
                                timeVariant="red"
                            />
                            <TaskItem
                                title="Komputasi Awan"
                                badge="Teknik Komputer"
                                badgeVariant="orange"
                                time="18:00"
                                timeVariant="gray"
                            />
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

                                <div className="deadline-item">
                                    <div className="deadline-item__date deadline-item__date--red">
                                        <p className="deadline-item__month">OKT</p>
                                        <p className="deadline-item__day">24</p>
                                    </div>
                                    <div>
                                        <p className="deadline-item__title">Ujian Tengah Semester - AI</p>
                                        <p className="deadline-item__sub"> 09:00 AM</p>
                                    </div>
                                </div>

                                <div className="deadline-item">
                                    <div className="deadline-item__date deadline-item__date--indigo">
                                        <p className="deadline-item__month">Mei</p>
                                        <p className="deadline-item__day">26</p>
                                    </div>
                                    <div>
                                        <p className="deadline-item__title">Proyek Akhir Database</p>
                                        <p className="deadline-item__sub">Online Submission</p>
                                    </div>
                                </div>

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