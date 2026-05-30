import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import {
    Mail, Phone, MapPin, BookOpen, Edit3, Save, X,
    Award, Users, TrendingUp, CheckCircle2, GraduationCap,
} from "lucide-react";

// ─── Profile Page (Dosen) ─────────────────────────────────────────────────────
export default function DosenProfile() {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name:     "Dr. Budi Santoso, M.T.",
        nip:      "197805102005011003",
        email:    "budi.santoso@university.ac.id",
        phone:    "+62 812 3456 7890",
        address:  "Jl. Universitas No. 5, Jakarta",
        dept:     "Teknik Informatika",
        faculty:  "Fakultas Ilmu Komputer",
        position: "Lektor Kepala",
        bio:      "Dosen dengan spesialisasi di bidang Algoritma, Kecerdasan Buatan, dan Jaringan Komputer. Memiliki pengalaman mengajar lebih dari 15 tahun dan aktif dalam penelitian Machine Learning terapan.",
    });
    const [draft, setDraft] = useState({ ...form });

    function handleEdit() { setDraft({ ...form }); setEditing(true); }
    function handleSave() { setForm({ ...draft }); setEditing(false); }
    function handleCancel() { setEditing(false); }

    const COURSES = [
        { name: "Algoritma & Pemrograman", students: 42, variant: "indigo" },
        { name: "Jaringan Komputer",        students: 35, variant: "orange" },
        { name: "Kecerdasan Buatan",        students: 30, variant: "purple" },
    ];

    const STATS = [
        { icon: <Users size={20} color="#4338ca" />,       bg: "icon-bg--indigo",  label: "Total Mahasiswa", val: "107"   },
        { icon: <BookOpen size={20} color="#ea580c" />,    bg: "icon-bg--orange",  label: "Mata Kuliah",     val: "3"     },
        { icon: <CheckCircle2 size={20} color="#16a34a" />,bg: "icon-bg--green",   label: "Tugas Aktif",     val: "6"     },
        { icon: <Award size={20} color="#7c3aed" />,       bg: "icon-bg--purple",  label: "Rata-rata Nilai", val: "82.4"  },
    ];

    function Field({ label, value, field, multiline }) {
        return (
            <div className="profile-field">
                <label className="profile-field__label">{label}</label>
                {editing
                    ? multiline
                        ? <textarea className="edit-input edit-input--textarea" rows={3} value={draft[field]} onChange={e => setDraft(d => ({ ...d, [field]: e.target.value }))} />
                        : <input className="edit-input" value={draft[field]} onChange={e => setDraft(d => ({ ...d, [field]: e.target.value }))} />
                    : <p className="profile-field__value">{value}</p>
                }
            </div>
        );
    }

    return (
        <div className="app-wrapper">
            <Sidebar role="dosen" />
            <main className="main-content">

                <div className="topbar">
                    <div>
                        <h1 className="topbar__title">Profil Dosen</h1>
                        <p className="topbar__subtitle">Kelola informasi akun dan profil mengajar Anda.</p>
                    </div>
                    {!editing
                        ? <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: 13 }} onClick={handleEdit}><Edit3 size={14} /> Edit Profil</button>
                        : <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: 13 }} onClick={handleSave}><Save size={14} /> Simpan</button>
                            <button className="btn-outline" style={{ margin: 0, width: "auto", padding: "10px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }} onClick={handleCancel}><X size={14} /> Batal</button>
                          </div>
                    }
                </div>

                {/* STATS ROW */}
                <div className="stats-row" style={{ marginBottom: 24 }}>
                    {STATS.map(s => (
                        <div key={s.label} className="stat-card">
                            <div className={`stat-card__icon ${s.bg}`}>{s.icon}</div>
                            <div className="stat-card__body">
                                <p className="stat-card__label">{s.label}</p>
                                <p className="stat-card__value">{s.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="detail-grid">

                    {/* ── LEFT: Identity ── */}
                    <div className="detail-main">

                        {/* Avatar + name */}
                        <div className="card" style={{ marginBottom: 16, textAlign: "center", padding: "32px 24px" }}>
                            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #ea580c, #4338ca)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "white" }}>B</div>
                            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>{form.name}</h2>
                            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 8px" }}>{form.position} • {form.dept}</p>
                            <span className="status-badge status--green" style={{ fontSize: 11 }}>✓ Aktif Mengajar</span>
                        </div>

                        {/* Info form */}
                        <div className="card">
                            <h2 className="card__title">Informasi Pribadi</h2>
                            <Field label="Nama Lengkap"   value={form.name}     field="name"     />
                            <Field label="NIP"            value={form.nip}      field="nip"      />
                            <Field label="Jabatan"        value={form.position} field="position" />
                            <Field label="Departemen"     value={form.dept}     field="dept"     />
                            <Field label="Fakultas"       value={form.faculty}  field="faculty"  />
                            <Field label="Bio / Tentang"  value={form.bio}      field="bio"      multiline />
                        </div>
                    </div>

                    {/* ── RIGHT ── */}
                    <div className="detail-side">

                        {/* Contact */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h2 className="card__title">Kontak</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <div className="detail-meta-item" style={{ gap: 10 }}>
                                    <Mail size={15} color="#4338ca" />
                                    {editing
                                        ? <input className="edit-input" style={{ flex: 1 }} value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} />
                                        : <span style={{ fontSize: 13 }}>{form.email}</span>
                                    }
                                </div>
                                <div className="detail-meta-item" style={{ gap: 10 }}>
                                    <Phone size={15} color="#4338ca" />
                                    {editing
                                        ? <input className="edit-input" style={{ flex: 1 }} value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} />
                                        : <span style={{ fontSize: 13 }}>{form.phone}</span>
                                    }
                                </div>
                                <div className="detail-meta-item" style={{ gap: 10 }}>
                                    <MapPin size={15} color="#4338ca" />
                                    {editing
                                        ? <input className="edit-input" style={{ flex: 1 }} value={draft.address} onChange={e => setDraft(d => ({ ...d, address: e.target.value }))} />
                                        : <span style={{ fontSize: 13 }}>{form.address}</span>
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Courses */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h2 className="card__title">Mata Kuliah Diampu</h2>
                            {COURSES.map(c => (
                                <div key={c.name} className="course-card" style={{ marginBottom: 10 }}>
                                    <div className="course-card__header">
                                        <div className={`course-card__icon icon-bg--${c.variant}`} style={{ width: 36, height: 36, borderRadius: 10 }}>
                                            <GraduationCap size={16} color={c.variant === "indigo" ? "#4338ca" : c.variant === "orange" ? "#ea580c" : "#7c3aed"} />
                                        </div>
                                        <div>
                                            <p className="course-card__title">{c.name}</p>
                                            <p className="course-card__sub">{c.students} mahasiswa</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Change Password */}
                        <div className="card">
                            <h2 className="card__title">Keamanan Akun</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <input className="edit-input" type="password" placeholder="Password saat ini" />
                                <input className="edit-input" type="password" placeholder="Password baru" />
                                <input className="edit-input" type="password" placeholder="Konfirmasi password baru" />
                                <button className="btn-primary" style={{ padding: "10px", fontSize: 13 }}>Ganti Password</button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
