import { useState, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import {
    Edit3, Mail, Phone, MapPin, BookOpen, Award,
    Calendar, BarChart2, CheckCircle2, Clock, Star,
    TrendingUp, Shield, Camera, Save, X, GraduationCap,
    Hash, Code2, Calculator, Cpu, Globe, Plus, Trash2,
    Download, Share2, Bell, Lock, ChevronRight, Zap,
    Target, Flame, Medal, ExternalLink, Copy, Check,
    Upload, Settings, LogOut, Eye, Users, Briefcase
} from "lucide-react";

// ─── Static Data ──────────────────────────────────────────────────────────────
const INIT_PROFILE = {
    name: "Dr. Budi Santoso, M.T.",
    nip: "197805102005011003",
    email: "budi.santoso@university.ac.id",
    phone: "+62 812-3456-7890",
    address: "Jl. Universitas No. 5, Jakarta",
    dept: "Teknik Informatika",
    faculty: "Fakultas Ilmu Komputer",
    position: "Lektor Kepala",
    teachingHours: 120,
    students: 107,
    bio: "Dosen dengan spesialisasi di bidang Algoritma, Kecerdasan Buatan, dan Jaringan Komputer. Memiliki pengalaman mengajar lebih dari 15 tahun dan aktif dalam penelitian Machine Learning terapan.",
    github: "github.com/budisantoso",
    linkedin: "linkedin.com/in/budisantoso",
    website: "budisantoso.dev",
};

const INIT_COURSES = [
    { id: 1, name: "Kecerdasan Buatan", sks: 3, students: 40, icon: Cpu, color: "#4338ca", bg: "#eef2ff" },
    { id: 2, name: "Mobile Programming Lanjut", sks: 4, students: 35, icon: Code2, color: "#7c3aed", bg: "#f5f3ff" },
    { id: 3, name: "Algoritma & Struktur Data", sks: 3, students: 32, icon: Hash, color: "#dc2626", bg: "#fef2f2" },
];

const INIT_ACHIEVEMENTS = [
    { id: 1, icon: "🏆", title: "Hibah Penelitian Ristekdikti", year: "2025", color: "#f59e0b" },
    { id: 2, icon: "🥇", title: "Dosen Berprestasi Tingkat Fakultas", year: "2024", color: "#eab308" },
    { id: 3, icon: "📜", title: "Publikasi Jurnal Internasional (Q1)", year: "2024", color: "#3b82f6" },
];

const STATS = [
    { label: "Total Mahasiswa", value: 107, icon: Users, color: "#16a34a", bg: "#ecfdf5", trend: "+12 semester ini" },
    { label: "Mata Kuliah", value: 3, icon: BookOpen, color: "#4338ca", bg: "#eef2ff", trend: "Semester Genap" },
    { label: "Publikasi", value: 15, icon: Award, color: "#ea580c", bg: "#fff7ed", trend: "+2 tahun ini" },
    { label: "Jam Mengajar", value: 120, icon: Clock, color: "#dc2626", bg: "#fef2f2", trend: "Sesuai Beban Kerja" },
];

const ACTIVITY_HISTORY = [
    { label: "Menilai Quiz Algoritma", time: "Hari ini, 10:00", dot: "#4338ca", icon: "✅" },
    { label: "Mengunggah Materi Komputasi Awan", time: "Kemarin, 22:30", dot: "#16a34a", icon: "📤" },
    { label: "Rapat Koordinasi Jurusan", time: "28 Mei, 14:00", dot: "#ea580c", icon: "💬" },
    { label: "Submit Laporan BKD", time: "25 Mei, 23:45", dot: "#0891b2", icon: "🚀" },
];

const HEATMAP_LEVELS = [0, 2, 3, 1, 0, 2, 3, 2, 1, 3, 0, 2, 3, 1, 2, 0, 3, 2, 1, 3, 2, 0, 1, 3, 2, 3, 1, 0, 2, 3, 1];
const HEATMAP_COLORS = ["#f1f5f9", "#c7d2fe", "#818cf8", "#4338ca"];

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditModal({ profile, onClose, onSave }) {
    const [form, setForm] = useState({ ...profile });
    const [activeSection, setSection] = useState("personal");
    const s = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
    const inp = {
        width: "100%", padding: "11px 14px", border: "1.5px solid #e5e7eb",
        borderRadius: 12, fontSize: 13, fontFamily: "inherit", color: "#111827",
        outline: "none", boxSizing: "border-box", background: "#fafafa", transition: "all .2s",
    };
    const focus = e => { e.target.style.borderColor = "#4338ca"; e.target.style.boxShadow = "0 0 0 3px rgba(67,56,202,.1)"; e.target.style.background = "#fff"; };
    const blur = e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; e.target.style.background = "#fafafa"; };

    const SECTIONS = [
        { key: "personal", label: "Informasi Pribadi" },
        { key: "academic", label: "Data Akademik" },
        { key: "social", label: "Tautan Sosial" },
    ];

    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 26, width: "100%", maxWidth: 560, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,.25)", animation: "modalIn .25s cubic-bezier(.34,1.56,.64,1)" }}>
                {/* Header */}
                <div style={{ padding: "22px 26px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <div>
                        <h3 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: 0, letterSpacing: "-.3px" }}>Edit Profil</h3>
                        <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>Perbarui informasi profil Anda</p>
                    </div>
                    <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", transition: "all .15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#e5e7eb"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f3f4f6"; }}>
                        <X size={16} />
                    </button>
                </div>
                {/* Section tabs */}
                <div style={{ display: "flex", gap: 4, padding: "12px 26px 0", flexShrink: 0, borderBottom: "1px solid #f3f4f6" }}>
                    {SECTIONS.map(sec => (
                        <button key={sec.key} onClick={() => setSection(sec.key)}
                            style={{
                                padding: "8px 16px", borderRadius: "10px 10px 0 0", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                                background: activeSection === sec.key ? "#4338ca" : "none",
                                color: activeSection === sec.key ? "white" : "#9ca3af",
                                borderBottom: activeSection === sec.key ? "2px solid #4338ca" : "2px solid transparent",
                            }}>
                            {sec.label}
                        </button>
                    ))}
                </div>
                {/* Body */}
                <div style={{ padding: "20px 26px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                    {activeSection === "personal" && [
                        { key: "name", label: "Nama Lengkap", ph: "Dr. Budi Santoso" },
                        { key: "email", label: "Email", ph: "email@university.ac.id" },
                        { key: "phone", label: "Nomor HP", ph: "+62 812-xxxx-xxxx" },
                        { key: "address", label: "Alamat", ph: "Kota, Provinsi" },
                    ].map(f => (
                        <div key={f.key}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>{f.label}</label>
                            <input value={form[f.key] || ""} onChange={s(f.key)} placeholder={f.ph} style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                    ))}
                    {activeSection === "personal" && (
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>Bio</label>
                            <textarea value={form.bio || ""} onChange={s("bio")} rows={3}
                                style={{ ...inp, resize: "none" }} onFocus={focus} onBlur={blur} />
                        </div>
                    )}
                    {activeSection === "academic" && [
                        { key: "position", label: "Jabatan" },
                        { key: "dept", label: "Departemen" },
                        { key: "faculty", label: "Fakultas" },
                        { key: "nip", label: "NIP" },
                    ].map(f => (
                        <div key={f.key}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>{f.label}</label>
                            <input value={form[f.key] || ""} onChange={s(f.key)} style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                    ))}
                    {activeSection === "social" && [
                        { key: "github", label: "GitHub", ph: "github.com/username", icon: "💻" },
                        { key: "linkedin", label: "LinkedIn", ph: "linkedin.com/in/username", icon: "💼" },
                        { key: "website", label: "Website", ph: "yourwebsite.dev", icon: "🌐" },
                    ].map(f => (
                        <div key={f.key}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>{f.icon} {f.label}</label>
                            <input value={form[f.key] || ""} onChange={s(f.key)} placeholder={f.ph} style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                    ))}
                </div>
                {/* Footer */}
                <div style={{ padding: "16px 26px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 10, flexShrink: 0 }}>
                    <button onClick={() => onSave(form)}
                        style={{ flex: 1, padding: 13, borderRadius: 14, border: "none", background: "linear-gradient(135deg,#4338ca,#6366f1)", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(67,56,202,.3)", transition: "all .2s" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(67,56,202,.4)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(67,56,202,.3)"; }}>
                        <Save size={15} /> Simpan Perubahan
                    </button>
                    <button onClick={onClose} style={{ padding: "13px 22px", borderRadius: 14, border: "1.5px solid #e5e7eb", background: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#374151", transition: "all .15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f9fafb"; }} onMouseLeave={e => { e.currentTarget.style.background = "white"; }}>
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Add Achievement Modal ────────────────────────────────────────────────────
function AddAchievModal({ onClose, onAdd }) {
    const [f, setF] = useState({ icon: "🏆", title: "", year: new Date().getFullYear().toString(), color: "#4338ca" });
    const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
    const inp = { width: "100%", padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fafafa" };
    const focus = e => { e.target.style.borderColor = "#4338ca"; e.target.style.boxShadow = "0 0 0 3px rgba(67,56,202,.1)"; };
    const blur = e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; };
    const EMOJIS = ["🏆", "🥇", "🥈", "🥉", "📜", "⭐", "🎖️", "🎗️", "🎓", "💡", "🚀", "💎"];
    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 400, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,.2)", animation: "modalIn .2s ease" }}>
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: 0 }}>Tambah Pencapaian/Publikasi</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
                </div>
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".5px" }}>Pilih Ikon</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {EMOJIS.map(em => (
                                <button key={em} onClick={() => setF(p => ({ ...p, icon: em }))}
                                    style={{ width: 38, height: 38, borderRadius: 10, border: `2px solid ${f.icon === em ? "#4338ca" : "#e5e7eb"}`, background: f.icon === em ? "#eef2ff" : "white", fontSize: 18, cursor: "pointer", transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {em}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>Nama Judul *</label>
                        <input value={f.title} onChange={s("title")} placeholder="Jurnal Internasional..." style={inp} onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>Tahun</label>
                        <input value={f.year} onChange={s("year")} placeholder="2026" style={inp} onFocus={focus} onBlur={blur} />
                    </div>
                </div>
                <div style={{ padding: "16px 24px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 10 }}>
                    <button onClick={() => { if (!f.title.trim()) return; onAdd({ ...f, id: Date.now() }); onClose(); }}
                        style={{ flex: 1, padding: 12, borderRadius: 13, border: "none", background: "linear-gradient(135deg,#4338ca,#6366f1)", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                        + Tambah
                    </button>
                    <button onClick={onClose} style={{ padding: "12px 18px", borderRadius: 13, border: "1.5px solid #e5e7eb", background: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>Batal</button>
                </div>
            </div>
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ stat }) {
    const Icon = stat.icon;
    return (
        <div style={{ background: "white", borderRadius: 20, padding: "20px 16px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1.5px solid #f3f4f6", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 28px ${stat.color}22`; e.currentTarget.style.borderColor = `${stat.color}30`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.06)"; e.currentTarget.style.borderColor = "#f3f4f6"; }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={22} color={stat.color} />
            </div>
            <p style={{ fontSize: 28, fontWeight: 900, color: stat.color, margin: 0, lineHeight: 1, letterSpacing: "-1px" }}>{stat.value}</p>
            <div>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0, fontWeight: 600 }}>{stat.label}</p>
                <p style={{ fontSize: 10, color: stat.color, margin: "3px 0 0", fontWeight: 700 }}>{stat.trend}</p>
            </div>
        </div>
    );
}

// ─── Course Row ───────────────────────────────────────────────────────────────
function CourseRow({ course }) {
    const Icon = course.icon;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #f9fafb", cursor: "pointer", transition: "all .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: course.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={17} color={course.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{course.sks} SKS</span>
                </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151", minWidth: 32, textAlign: "center" }}>{course.students} Mhs</span>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DosenProfile() {
    const [profile, setProfile] = useState(INIT_PROFILE);
    const [achievements, setAchievements] = useState(INIT_ACHIEVEMENTS);
    const [editing, setEditing] = useState(false);
    const [addAchiev, setAddAchiev] = useState(false);
    const [activeTab, setTab] = useState("courses");
    const [copied, setCopied] = useState(false);
    const [avatarColor] = useState(["#ea580c", "#4338ca", "#059669", "#dc2626", "#7c3aed"][Math.floor(Math.random() * 5)]);
    const fileRef = useRef(null);
    const [avatarEmoji, setAvatarEmoji] = useState(null);

    function handleSave(data) { setProfile(data); setEditing(false); }
    function copyEmail() {
        navigator.clipboard?.writeText(profile.email);
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    }

    const initials = profile.name.replace(/[^a-zA-Z ]/g, "").split(" ").filter(w => w.length > 0).map(w => w[0]).join("").slice(0, 2).toUpperCase();

    const TABS = [
        { key: "courses", label: "Mata Kuliah", icon: BookOpen, count: INIT_COURSES.length },
        { key: "activity", label: "Aktivitas", icon: BarChart2, count: null },
        { key: "settings", label: "Pengaturan", icon: Settings, count: null },
    ];

    return (
        <div className="app-wrapper">
            <style>{`
                @keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:none}}
                @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
                .prof-card{background:white;border-radius:22px;padding:22px;box-shadow:0 1px 4px rgba(0,0,0,.06);border:1px solid #f3f4f6;}
                .prof-action-btn{display:flex;align-items:center;justify-content:space-between;width:100%;padding:12px 16px;border:1.5px solid #f3f4f6;border-radius:13px;background:white;font-size:13px;font-weight:600;color:#374151;cursor:pointer;font-family:inherit;transition:all .15s;margin-bottom:8px;}
                .prof-action-btn:hover{border-color:#4338ca;color:#4338ca;background:#fafbff;}
                .achiev-item{display:flex;align-items:center;gap:12px;padding:12px 14px;background:#f9fafb;border-radius:14px;transition:all .15s;cursor:pointer;margin-bottom:8px;}
                .achiev-item:hover{background:#f0f1ff;transform:translateX(3px);}
            `}</style>

            {editing && <EditModal profile={profile} onClose={() => setEditing(false)} onSave={handleSave} />}
            {addAchiev && <AddAchievModal onClose={() => setAddAchiev(false)} onAdd={a => setAchievements(p => [a, ...p])} />}

            <Sidebar role="dosen" />

            <main className="main-content profile-page" style={{ padding: 0, display: "flex", flexDirection: "column" }}>

                {/* ══ HERO BANNER ══ */}
                <div style={{ position: "relative", overflow: "hidden", padding: "36px 36px 32px", background: "linear-gradient(135deg,#7c2d12 0%,#ea580c 45%,#f59e0b 100%)" }}>
                    {/* Decorative blobs */}
                    {[
                        { w: 300, h: 300, top: -80, right: 80, bg: "rgba(255,255,255,.1)" },
                        { w: 200, h: 200, top: 40, right: -40, bg: "rgba(255,255,255,.05)" },
                        { w: 150, h: 150, bottom: -60, left: 200, bg: "rgba(0,0,0,.15)" },
                    ].map((b, i) => (
                        <div key={i} style={{ position: "absolute", width: b.w, height: b.h, borderRadius: "50%", background: b.bg, top: b.top, right: b.right, bottom: b.bottom, left: b.left, pointerEvents: "none" }} />
                    ))}

                    <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", gap: 28 }}>
                        {/* Avatar */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                            <div style={{ width: 96, height: 96, borderRadius: 26, background: `linear-gradient(135deg,${avatarColor}aa,${avatarColor})`, border: "3px solid rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", boxShadow: "0 8px 32px rgba(0,0,0,.3)", fontSize: avatarEmoji ? 40 : 36, fontWeight: 900, color: "white", letterSpacing: "-2px" }}>
                                {avatarEmoji || initials}
                            </div>
                            {/* Camera button */}
                            <button onClick={() => fileRef.current?.click()}
                                style={{ position: "absolute", bottom: -4, right: -4, width: 30, height: 30, borderRadius: "50%", background: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ea580c", boxShadow: "0 2px 8px rgba(0,0,0,.2)", transition: "transform .15s" }}
                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                                onMouseLeave={e => e.currentTarget.style.transform = ""}>
                                <Camera size={14} />
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} />
                        </div>

                        {/* Identity */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
                                <div>
                                    <h1 style={{ fontSize: 30, fontWeight: 900, color: "white", margin: "0 0 6px", letterSpacing: "-.5px" }}>{profile.name}</h1>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {[
                                            { icon: Briefcase, val: profile.position },
                                            { icon: Hash, val: `NIP: ${profile.nip}` },
                                            { icon: Building, val: profile.faculty },
                                            { icon: BookOpen, val: profile.dept },
                                        ].map((chip, i) => {
                                            const I = chip.icon; return (
                                                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "rgba(255,255,255,.15)", borderRadius: 9, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.9)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,.2)" }}>
                                                    <I size={12} />{chip.val}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                                {/* Action buttons */}
                                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                    <button onClick={() => setEditing(true)}
                                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.3)", borderRadius: 13, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(8px)", transition: "all .2s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.25)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.15)"}>
                                        <Edit3 size={14} /> Edit Profil
                                    </button>
                                    <button style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", backdropFilter: "blur(8px)", transition: "all .2s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.25)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.15)"}>
                                        <Share2 size={15} />
                                    </button>
                                </div>
                            </div>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,.85)", lineHeight: 1.7, margin: 0, maxWidth: 650 }}>{profile.bio}</p>

                            {/* Social links */}
                            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                                {[
                                    { label: "💻 " + profile.github, href: `https://${profile.github}` },
                                    { label: "💼 " + profile.linkedin, href: `https://${profile.linkedin}` },
                                    { label: "🌐 " + profile.website, href: `https://${profile.website}` },
                                ].filter(l => l.href !== "https://undefined").map((l, i) => (
                                    <a key={i} href={l.href} target="_blank" rel="noreferrer"
                                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", background: "rgba(255,255,255,.1)", borderRadius: 8, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.9)", textDecoration: "none", border: "1px solid rgba(255,255,255,.15)", transition: "all .15s" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.2)"; e.currentTarget.style.color = "white"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "rgba(255,255,255,.9)"; }}>
                                        {l.label} <ExternalLink size={10} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══ MAIN CONTENT ══ */}
                <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 22, padding: "22px 36px 36px", flex: 1, minHeight: 0, overflowY: "auto" }}>

                    {/* ── LEFT COLUMN ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                        {/* Contact Card */}
                        <div className="prof-card">
                            <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, color: "#111827", margin: "0 0 16px" }}>
                                <Shield size={16} color="#ea580c" />Informasi Kontak
                            </h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {[
                                    { icon: Mail, val: profile.email, action: "copy" },
                                    { icon: Phone, val: profile.phone, action: null },
                                    { icon: MapPin, val: profile.address, action: null },
                                ].map((item, i) => {
                                    const I = item.icon; return (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <I size={14} color="#ea580c" />
                                            </div>
                                            <span style={{ fontSize: 13, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.val}</span>
                                            {item.action === "copy" && (
                                                <button onClick={copyEmail}
                                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, borderRadius: 6, display: "flex", transition: "color .15s" }}
                                                    onMouseEnter={e => e.currentTarget.style.color = "#ea580c"}
                                                    onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
                                                    title="Salin email">
                                                    {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Achievements Card */}
                        <div className="prof-card">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>
                                    <Award size={16} color="#ea580c" />Penelitian & Publikasi
                                </h2>
                                <button onClick={() => setAddAchiev(true)}
                                    style={{ width: 30, height: 30, borderRadius: 9, background: "#fff7ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ea580c", transition: "all .15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#ffedd5"}
                                    onMouseLeave={e => e.currentTarget.style.background = "#fff7ed"}>
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div>
                                {achievements.map(a => (
                                    <div key={a.id} className="achiev-item"
                                        style={{ position: "relative", overflow: "hidden" }}>
                                        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg,${a.color}08,transparent)`, pointerEvents: "none", borderRadius: 14 }} />
                                        <span style={{ fontSize: 22, flexShrink: 0 }}>{a.icon}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</p>
                                            <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", fontWeight: 600 }}>{a.year}</p>
                                        </div>
                                        <button onClick={() => setAchievements(p => p.filter(x => x.id !== a.id))}
                                            style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4, opacity: 0, transition: "all .15s", display: "flex", borderRadius: 6 }}
                                            onMouseEnter={e => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "#fee2e2"; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = "#d1d5db"; e.currentTarget.style.background = "none"; }}
                                            className="achiev-del">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                                {achievements.length === 0 && (
                                    <div style={{ textAlign: "center", padding: "20px 0", color: "#9ca3af" }}>
                                        <p style={{ fontSize: 22, margin: "0 0 6px" }}>🏅</p>
                                        <p style={{ fontSize: 12, margin: 0 }}>Belum ada publikasi tercatat.</p>
                                    </div>
                                )}
                            </div>
                            <style>{`.achiev-item:hover .achiev-del{opacity:1!important}`}</style>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                        {/* Stats Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                            {STATS.map(s => <StatCard key={s.label} stat={s} />)}
                        </div>

                        {/* Tabs Card */}
                        <div className="prof-card" style={{ padding: 0, overflow: "hidden", flex: 1 }}>
                            {/* Tab bar */}
                            <div style={{ display: "flex", borderBottom: "1px solid #f3f4f6", padding: "0 4px" }}>
                                {TABS.map(t => {
                                    const I = t.icon; return (
                                        <button key={t.key} onClick={() => setTab(t.key)}
                                            style={{ display: "flex", alignItems: "center", gap: 7, padding: "16px 20px", border: "none", borderBottom: `2.5px solid ${activeTab === t.key ? "#ea580c" : "transparent"}`, background: "none", fontSize: 13, fontWeight: 700, color: activeTab === t.key ? "#ea580c" : "#9ca3af", cursor: "pointer", fontFamily: "inherit", transition: "all .15s", marginBottom: -1 }}>
                                            <I size={14} />
                                            {t.label}
                                            {t.count !== null && (
                                                <span style={{ background: activeTab === t.key ? "#fff7ed" : "#f3f4f6", color: activeTab === t.key ? "#ea580c" : "#9ca3af", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "1px 7px", transition: "all .15s" }}>{t.count}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab: Courses */}
                            {activeTab === "courses" && (
                                <div style={{ padding: "16px 22px 22px" }}>
                                    {/* Header row */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 800, color: "#111827", margin: 0 }}>Mata Kuliah Diampu Semester Ini</p>
                                            <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>Total {INIT_COURSES.reduce((a, c) => a + c.sks, 0)} SKS · {INIT_COURSES.length} Kelas Aktif</p>
                                        </div>
                                    </div>
                                    {/* Column headers */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 0 8px", borderBottom: "1.5px solid #f3f4f6", marginBottom: 4 }}>
                                        <div style={{ width: 42 }} />
                                        <span style={{ flex: 1, fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase" }}>Mata Kuliah</span>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, width: 80, textAlign: "right", textTransform: "uppercase" }}>Mahasiswa</span>
                                    </div>
                                    {INIT_COURSES.map(c => <CourseRow key={c.id} course={c} />)}
                                </div>
                            )}

                            {/* Tab: Activity */}
                            {activeTab === "activity" && (
                                <div style={{ padding: "20px 22px" }}>
                                    {/* Heatmap */}
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                            <div>
                                                <p style={{ fontSize: 14, fontWeight: 800, color: "#111827", margin: 0 }}>Aktivitas Dosen</p>
                                                <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>Mei 2026 · 22 hari aktif</p>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9ca3af" }}>
                                                <span>Rendah</span>
                                                {HEATMAP_COLORS.map(c => (
                                                    <div key={c} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />
                                                ))}
                                                <span>Tinggi</span>
                                            </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(11,1fr)", gap: 5, marginBottom: 4 }}>
                                            {HEATMAP_LEVELS.map((lv, i) => (
                                                <div key={i}
                                                    title={`${i + 1} Mei — Level ${lv}`}
                                                    style={{ aspectRatio: 1, borderRadius: 5, background: HEATMAP_COLORS[lv], cursor: "pointer", transition: "transform .15s,filter .15s" }}
                                                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.3)"; e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.zIndex = 1; }}
                                                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.filter = ""; e.currentTarget.style.zIndex = 0; }}
                                                />
                                            ))}
                                        </div>
                                        {/* Day labels */}
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 2px" }}>
                                            {["1", "5", "10", "15", "20", "25", "30", "31"].map(d => (
                                                <span key={d} style={{ fontSize: 9, color: "#d1d5db", fontWeight: 600 }}>{d}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Activity feed */}
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 800, color: "#111827", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
                                            <Target size={15} color="#ea580c" />Riwayat Aktivitas
                                        </p>
                                        <div style={{ borderLeft: "2px solid #e5e7eb", marginLeft: 8, display: "flex", flexDirection: "column", gap: 16 }}>
                                            {ACTIVITY_HISTORY.map((a, i) => (
                                                <div key={i} style={{ position: "relative", paddingLeft: 20 }}>
                                                    <div style={{ position: "absolute", left: -9, top: 4, width: 16, height: 16, borderRadius: "50%", background: a.dot, border: "2px solid white", boxShadow: `0 0 0 2px ${a.dot}40` }} />
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <span style={{ fontSize: 15 }}>{a.icon}</span>
                                                        <div>
                                                            <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{a.label}</p>
                                                            <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{a.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Settings */}
                            {activeTab === "settings" && (
                                <div style={{ padding: "20px 22px" }}>
                                    <p style={{ fontSize: 14, fontWeight: 800, color: "#111827", margin: "0 0 16px" }}>Pengaturan Akun</p>

                                    {/* Setting groups */}
                                    {[
                                        {
                                            label: "Privasi & Keamanan",
                                            items: [
                                                { icon: Lock, label: "Ubah Password", desc: "Terakhir diubah 30 hari lalu" },
                                                { icon: Eye, label: "Visibilitas Profil", desc: "Publik untuk mahasiswa" },
                                                { icon: Bell, label: "Notifikasi", desc: "Email & push notification aktif" },
                                            ]
                                        },
                                        {
                                            label: "Data & Akun",
                                            items: [
                                                { icon: Download, label: "Ekspor Data", desc: "Unduh semua data akun" },
                                                { icon: Share2, label: "Bagikan Profil", desc: "Salin tautan profil publik" },
                                            ]
                                        },
                                    ].map(group => (
                                        <div key={group.label} style={{ marginBottom: 20 }}>
                                            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 10px" }}>{group.label}</p>
                                            {group.items.map(item => {
                                                const I = item.icon; return (
                                                    <button key={item.label} className="prof-action-btn">
                                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                            <div style={{ width: 36, height: 36, borderRadius: 11, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                <I size={15} color="#6b7280" />
                                                            </div>
                                                            <div style={{ textAlign: "left" }}>
                                                                <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{item.label}</p>
                                                                <p style={{ fontSize: 11, color: "#9ca3af", margin: "1px 0 0" }}>{item.desc}</p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={15} color="#d1d5db" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}

                                    {/* Danger zone */}
                                    <div style={{ padding: "16px", background: "#fff5f5", borderRadius: 14, border: "1.5px solid #fecaca" }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>⚠ Zona Berbahaya</p>
                                        <button style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", border: "1.5px solid #fca5a5", borderRadius: 12, background: "white", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                                            onMouseLeave={e => e.currentTarget.style.background = "white"}>
                                            <LogOut size={15} color="#dc2626" />
                                            <div style={{ textAlign: "left" }}>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", margin: 0 }}>Keluar dari Akun</p>
                                                <p style={{ fontSize: 11, color: "#f87171", margin: "1px 0 0" }}>Sesi akan berakhir di semua perangkat</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}