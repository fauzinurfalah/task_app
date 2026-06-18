import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { User, Mail, Hash, Edit3, Save, X, LogOut, Briefcase, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ name: "-", email: "-", nip: "-" });
    const [editing, setEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [form, setForm] = useState({ name: "-", email: "-", nip: "-" });

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        const p = {
            name: u.name || "Dosen",
            email: u.email || "dosen@university.ac.id",
            nip: u.nim || u.nip || "-", // Handle both nim/nip fallback
        };
        setProfile(p);
        setForm(p);
    }, []);

    function handleSave() {
        setIsSaving(true);
        setTimeout(() => {
            setProfile(form);
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...u, ...form, nim: form.nip })); // Synchronize for dummy login
            
            setIsSaving(false);
            setIsSuccess(true);
            
            setTimeout(() => {
                setEditing(false);
                setTimeout(() => setIsSuccess(false), 600);
            }, 800);
        }, 500);
    }

    function handleCancel() {
        setForm(profile); // Reset form
        setEditing(false);
    }

    function handleLogout() {
        localStorage.removeItem("user");
        navigate("/login");
    }

    const s = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
    const initials = profile.name.slice(0, 2).toUpperCase();

    const inp = { width: "100%", padding: "14px 16px", border: "1.5px solid #e2e8f0", borderRadius: 16, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f8fafc", transition: "all 0.2s" };
    const focus = e => { e.target.style.borderColor = "#ea580c"; e.target.style.boxShadow = "0 0 0 4px rgba(234,88,12,.1)"; e.target.style.background = "white"; };
    const blur = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; };

    return (
        <div className="app-wrapper">
            <Sidebar role="dosen" />
            <main className="main-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", minHeight: "100vh", padding: "40px", overflow: "hidden" }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 900 }}>
                    
                    {/* EDIT CARD (Rendered behind initially) */}
                    <div style={{
                        position: "absolute",
                        width: "100%", maxWidth: 440,
                        background: "white",
                        borderRadius: 32,
                        padding: 32,
                        boxShadow: "0 10px 40px rgba(0,0,0,.05)",
                        border: "1px solid #e2e8f0",
                        transform: editing ? "translateX(230px)" : "translateX(0) scale(0.95)",
                        opacity: editing ? 1 : 0,
                        visibility: editing || isSuccess ? "visible" : "hidden",
                        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        zIndex: 1,
                        boxSizing: "border-box"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>Edit Profil</h3>
                            <button onClick={handleCancel} disabled={isSaving || isSuccess} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", padding: 8, borderRadius: 12, transition: "all 0.2s", opacity: (isSaving || isSuccess) ? 0.5 : 1 }} onMouseEnter={e => { if(!(isSaving||isSuccess)) { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; } }} onMouseLeave={e => { if(!(isSaving||isSuccess)) { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; } }}><X size={20} /></button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Nama Lengkap</label>
                                <input value={form.name} onChange={s("name")} style={inp} onFocus={focus} onBlur={blur} disabled={isSaving || isSuccess} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</label>
                                <input value={form.email} onChange={s("email")} style={inp} onFocus={focus} onBlur={blur} disabled={isSaving || isSuccess} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>NIP</label>
                                <input value={form.nip} onChange={s("nip")} style={inp} onFocus={focus} onBlur={blur} disabled={isSaving || isSuccess} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
                            <button onClick={handleCancel} disabled={isSaving || isSuccess} style={{ flex: 1, padding: "14px", borderRadius: 16, border: "1.5px solid #e2e8f0", background: "white", fontSize: 14, fontWeight: 800, cursor: (isSaving||isSuccess)?"not-allowed":"pointer", color: "#475569", transition: "all 0.2s", opacity: (isSaving||isSuccess)?0.5:1 }} onMouseEnter={e => { if(!(isSaving||isSuccess)) e.currentTarget.style.background = "#f8fafc" }} onMouseLeave={e => { if(!(isSaving||isSuccess)) e.currentTarget.style.background = "white" }}>
                                Batal
                            </button>
                            <button onClick={handleSave} disabled={isSaving || isSuccess}
                                style={{ flex: 2, padding: "14px", borderRadius: 16, background: isSuccess ? "#10b981" : "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", color: "white", border: "none", fontSize: 14, fontWeight: 800, cursor: (isSaving||isSuccess)?"not-allowed":"pointer", boxShadow: isSuccess ? "0 8px 20px rgba(16,185,129,.25)" : "0 8px 20px rgba(234,88,12,.25)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onMouseEnter={e => { if(!(isSaving||isSuccess)) e.currentTarget.style.transform = "translateY(-2px)" }} onMouseLeave={e => { if(!(isSaving||isSuccess)) e.currentTarget.style.transform = "translateY(0)" }}>
                                {isSuccess ? <><CheckCircle size={18} /> Tersimpan</> : isSaving ? "Menyimpan..." : <><Save size={18} /> Simpan</>}
                            </button>
                        </div>
                    </div>

                    {/* PROFILE CARD (Main foreground) */}
                    <div style={{
                        width: "100%", maxWidth: 440,
                        background: "white",
                        borderRadius: 32,
                        padding: "48px 40px",
                        boxShadow: "0 10px 40px rgba(0,0,0,.05)",
                        border: "1px solid #e2e8f0",
                        textAlign: "center",
                        position: "relative",
                        overflow: "hidden",
                        transform: editing ? "translateX(-230px)" : "translateX(0)",
                        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        zIndex: 2,
                        boxSizing: "border-box"
                    }}>
                        {/* Background accent */}
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", zIndex: 0 }} />
                        
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <div style={{ width: 110, height: 110, borderRadius: 32, background: "white", padding: 6, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ width: "100%", height: "100%", borderRadius: 26, background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", color: "white", fontSize: 36, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {initials}
                                </div>
                            </div>
                            
                            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.5px" }}>{profile.name}</h1>
                            <p style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#ea580c", background: "#fff7ed", padding: "6px 12px", borderRadius: 10, margin: "0 0 32px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                <Briefcase size={14} /> Dosen Pengajar
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left", marginBottom: 40 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#f8fafc", borderRadius: 20, border: "1px solid #f1f5f9" }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "white", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Mail size={18} color="#ea580c" />
                                    </div>
                                    <div style={{ overflow: "hidden" }}>
                                        <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Alamat Email</p>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.email}</p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#f8fafc", borderRadius: 20, border: "1px solid #f1f5f9" }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "white", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Hash size={18} color="#ea580c" />
                                    </div>
                                    <div style={{ overflow: "hidden" }}>
                                        <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Nomor Induk Pegawai (NIP)</p>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.nip}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <button onClick={() => { setForm(profile); setEditing(true); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px", borderRadius: 16, background: "white", color: "#0f172a", border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }} onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                                    <Edit3 size={18} /> Edit Informasi Profil
                                </button>
                                <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px", borderRadius: 16, background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fecaca", fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"} onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}>
                                    <LogOut size={18} /> Keluar dari Akun
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}