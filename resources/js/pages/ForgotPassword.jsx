import { useState } from "react";
import axiosClient from "../axiosClient";
import { useNavigate } from "react-router-dom";

function Dots() {
    return (
        <div style={{ position:"absolute",inset:0,overflow:"hidden",zIndex:0,pointerEvents:"none" }}>
            {Array.from({ length: 28 }, (_, i) => (
                <div key={i} style={{
                    position:"absolute",
                    width: i%3===0?6:i%5===0?10:4,
                    height: i%3===0?6:i%5===0?10:4,
                    borderRadius:"50%",
                    background:`rgba(99,102,241,${0.08+(i%5)*0.04})`,
                    top:`${(i*37+11)%100}%`,
                    left:`${(i*53+7)%100}%`,
                    animation:`float-dot ${4+(i%5)}s ease-in-out ${(i*0.4)%3}s infinite alternate`,
                }} />
            ))}
        </div>
    );
}

function Field({ label, type="text", value, onChange, placeholder, icon, error }) {
    const [show, setShow] = useState(false);
    const isPass = type === "password";
    return (
        <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            <label style={{ fontSize:12,fontWeight:700,color:"#374151",letterSpacing:"0.5px",textTransform:"uppercase" }}>{label}</label>
            <div style={{ position:"relative",display:"flex",alignItems:"center" }}>
                <span style={{ position:"absolute",left:14,fontSize:16,color:"#9ca3af",pointerEvents:"none" }}>{icon}</span>
                <input
                    type={isPass&&show?"text":type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    style={{
                        width:"100%",
                        padding:isPass?"12px 42px 12px 42px":"12px 14px 12px 42px",
                        border:`1.5px solid ${error?"#fca5a5":"#e5e7eb"}`,
                        borderRadius:14, fontSize:14,
                        fontFamily:"inherit", color:"#111827",
                        background:error?"#fff8f8":"#fafafa",
                        outline:"none", transition:"all 0.2s", boxSizing:"border-box",
                    }}
                    onFocus={e=>{e.target.style.borderColor="#4338ca";e.target.style.boxShadow="0 0 0 3px rgba(67,56,202,0.1)";e.target.style.background="#fff";}}
                    onBlur={e=>{e.target.style.borderColor=error?"#fca5a5":"#e5e7eb";e.target.style.boxShadow="none";e.target.style.background=error?"#fff8f8":"#fafafa";}}
                />
                {isPass && (
                    <button type="button" onClick={()=>setShow(s=>!s)} style={{
                        position:"absolute",right:12,background:"none",border:"none",
                        cursor:"pointer",fontSize:16,color:"#9ca3af",padding:4,
                        display:"flex",alignItems:"center",
                    }}>{show?"🙈":"👁️"}</button>
                )}
            </div>
            {error && <p style={{ fontSize:11,color:"#dc2626",margin:0,fontWeight:600 }}>{error}</p>}
        </div>
    );
}

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
    const [loading, setLoading] = useState(false);
    
    // Form data
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    async function handleSendEmail(e) {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        if (!email) return setErrorMsg("Email wajib diisi");

        setLoading(true);
        try {
            const res = await axiosClient.post("/forgot-password", { email });
            setSuccessMsg(res.data.message || "Kode OTP telah dikirim.");
            setTimeout(() => {
                setSuccessMsg("");
                setStep(2);
            }, 1500);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Gagal mengirim email.");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyCode(e) {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        if (!code || code.length !== 6) return setErrorMsg("Kode wajib 6 digit.");

        setLoading(true);
        try {
            const res = await axiosClient.post("/verify-reset-code", { email, code });
            setSuccessMsg(res.data.message || "Kode valid.");
            setTimeout(() => {
                setSuccessMsg("");
                setStep(3);
            }, 1000);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Kode tidak valid.");
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPassword(e) {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        if (password.length < 6) return setErrorMsg("Password minimal 6 karakter.");
        if (password !== confirmPassword) return setErrorMsg("Konfirmasi password tidak sama.");

        setLoading(true);
        try {
            const res = await axiosClient.post("/reset-password", { 
                email, 
                code, 
                password, 
                password_confirmation: confirmPassword 
            });
            setSuccessMsg(res.data.message || "Password berhasil diubah!");
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Gagal mengubah password.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
                @keyframes float-dot{from{transform:translateY(0)scale(1);}to{transform:translateY(-18px)scale(1.2);}}
                @keyframes slide-up{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}
                @keyframes fade-in{from{opacity:0;}to{opacity:1;}}
                @keyframes spin{to{transform:rotate(360deg);}}
                .auth-btn{width:100%;padding:14px;border-radius:14px;border:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:800;cursor:pointer;transition:transform .15s,box-shadow .15s;letter-spacing:.3px;display:flex;align-items:center;justify-content:center;gap:8px;}
                .auth-btn:hover:not(:disabled){transform:translateY(-2px);}
                .auth-btn:active:not(:disabled){transform:translateY(0);}
                .auth-btn:disabled{cursor:not-allowed;opacity:.8;}
            `}</style>

            <div style={{ minHeight:"100vh",display:"flex",background:"#f0f0f8",fontFamily:"'Plus Jakarta Sans',sans-serif",animation:"fade-in .4s ease",position:"relative",overflow:"hidden",justifyContent:"center",alignItems:"center" }}>
                <Dots />
                <div style={{ width: "100%", maxWidth: 440, background: "white", borderRadius: 20, padding: "40px 48px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)", position: "relative", zIndex: 1, animation: "slide-up .5s ease" }}>
                    
                    <button onClick={() => navigate(-1)} style={{ background:"none",border:"none",color:"#9ca3af",fontSize:24,cursor:"pointer",position:"absolute",top:24,left:24 }}>
                        ←
                    </button>

                    <div style={{ textAlign: "center", marginBottom: 32 }}>
                        <div style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:60,height:60,borderRadius:18,background:"#eef2ff",color:"#4338ca",fontSize:28,marginBottom:16 }}>
                            {step === 1 ? "✉️" : step === 2 ? "🔐" : "🔑"}
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#111827", marginBottom: 8 }}>
                            {step === 1 ? "Lupa Password" : step === 2 ? "Masukkan Kode OTP" : "Buat Password Baru"}
                        </h2>
                        <p style={{ fontSize: 14, color: "#6b7280" }}>
                            {step === 1 
                                ? "Masukkan alamat email akun kamu untuk menerima kode pemulihan."
                                : step === 2
                                ? `Kami telah mengirim 6 digit kode ke ${email}`
                                : "Silakan buat password baru untuk mengamankan akunmu."}
                        </p>
                    </div>

                    {errorMsg && (
                        <div style={{ padding:"12px 16px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,marginBottom:20,fontSize:13,color:"#dc2626",fontWeight:600,animation:"fade-in .3s ease" }}>
                            {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div style={{ padding:"12px 16px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,marginBottom:20,fontSize:13,color:"#16a34a",fontWeight:600,animation:"fade-in .3s ease" }}>
                            {successMsg}
                        </div>
                    )}

                    <form onSubmit={step === 1 ? handleSendEmail : step === 2 ? handleVerifyCode : handleResetPassword} style={{ display:"flex",flexDirection:"column",gap:16 }}>
                        
                        {step === 1 && (
                            <Field label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@student.ac.id" icon="✉️" />
                        )}

                        {step === 2 && (
                            <Field label="Kode OTP (6 Digit)" type="text" value={code} onChange={e=>setCode(e.target.value)} placeholder="Misal: 123456" icon="🔢" />
                        )}

                        {step === 3 && (
                            <>
                                <Field label="Password Baru" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 6 karakter" icon="🔒" />
                                <Field label="Konfirmasi Password Baru" type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Ulangi password" icon="🔐" />
                            </>
                        )}

                        <button type="submit" disabled={loading} className="auth-btn" style={{ marginTop: 12, background: "linear-gradient(135deg,#4338ca 0%,#6366f1 100%)", color: "white", boxShadow: "0 4px 16px rgba(67,56,202,.3)" }}>
                            {loading ? (
                                <><div style={{ width:18,height:18,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .8s linear infinite" }}/>Memproses…</>
                            ) : (
                                step === 1 ? "Kirim Kode OTP →" : step === 2 ? "Verifikasi Kode →" : "Simpan Password Baru ✓"
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </>
    );
}
