import { useState } from "react";
import axios from "axios";
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

export default function Auth() {
    const navigate = useNavigate();
    const [mode, setMode]       = useState("login");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm]       = useState({ name:"",nim:"",email:"",password:"",confirm:"" });
    const [errors, setErrors]   = useState({});
    const [apiError, setApiError] = useState("");

    const set = key => e => setForm(f=>({...f,[key]:e.target.value}));
    const isLogin = mode==="login";

    function validate() {
        const e={};
        if(!isLogin){
            if(!form.name.trim()) e.name="Nama tidak boleh kosong";
            if(!form.nim.trim())  e.nim="NIM tidak boleh kosong";
            if(form.password!==form.confirm) e.confirm="Password tidak sama";
        }
        if(!form.email.includes("@")) e.email="Email tidak valid";
        if(form.password.length<6)    e.password="Password minimal 6 karakter";
        return e;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs=validate();
        if(Object.keys(errs).length){ setErrors(errs); return; }
        setErrors({});
        setApiError("");
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.post('/api/login', {
                email,
                password
            });
            
            // On success, maybe save the user data in localStorage or state
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message;
            const validationErrors = err.response?.data?.errors;
            if(validationErrors) {
                const mapped = {};
                Object.entries(validationErrors).forEach(([k,v]) => { mapped[k] = v[0]; });
                setErrors(mapped);
            } else {
                setApiError(msg || "Terjadi kesalahan. Coba lagi.");
            }
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
                @keyframes pop-in{0%{transform:scale(.5);opacity:0;}80%{transform:scale(1.1);}100%{transform:scale(1);opacity:1;}}
                @keyframes draw-check{from{stroke-dashoffset:40;}to{stroke-dashoffset:0;}}
                .auth-btn{width:100%;padding:14px;border-radius:14px;border:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:800;cursor:pointer;transition:transform .15s,box-shadow .15s;letter-spacing:.3px;display:flex;align-items:center;justify-content:center;gap:8px;}
                .auth-btn:hover:not(:disabled){transform:translateY(-2px);}
                .auth-btn:active:not(:disabled){transform:translateY(0);}
                .auth-btn:disabled{cursor:not-allowed;opacity:.8;}
                .tab-btn{flex:1;padding:10px;border:none;border-radius:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;}
            `}</style>

            <div style={{ minHeight:"100vh",display:"flex",background:"#f0f0f8",fontFamily:"'Plus Jakarta Sans',sans-serif",animation:"fade-in .4s ease",position:"relative",overflow:"hidden" }}>
                <Dots />

                {/* LEFT */}
                <div style={{ flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"60px 40px",background:"linear-gradient(145deg,#3730a3 0%,#4338ca 40%,#6366f1 100%)",position:"relative",overflow:"hidden" }}>
                    <div style={{ position:"absolute",top:-80,left:-80,width:300,height:300,borderRadius:"50%",background:"rgba(255,255,255,.05)" }} />
                    <div style={{ position:"absolute",bottom:-60,right:-60,width:250,height:250,borderRadius:"50%",background:"rgba(255,255,255,.07)" }} />
                    <div style={{ position:"absolute",top:"40%",right:-40,width:180,height:180,borderRadius:"50%",border:"2px solid rgba(255,255,255,.1)" }} />

                    <div style={{ position:"relative",zIndex:1,maxWidth:400,textAlign:"center",animation:"slide-up .6s ease .1s both" }}>
                        <div style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:72,height:72,borderRadius:22,background:"rgba(255,255,255,.15)",backdropFilter:"blur(10px)",border:"1.5px solid rgba(255,255,255,.25)",marginBottom:28,fontSize:32 }}>📋</div>
                        <h1 style={{ fontSize:40,fontWeight:900,color:"white",lineHeight:1.1,marginBottom:16,letterSpacing:"-1px" }}>
                            Kelola Tugasmu<br /><span style={{ color:"#a5b4fc" }}>Lebih Cerdas.</span>
                        </h1>
                        <p style={{ fontSize:15,color:"rgba(255,255,255,.7)",lineHeight:1.7,marginBottom:40 }}>
                            Platform manajemen tugas dan jadwal akademik yang dirancang khusus untuk mahasiswa berprestasi.
                        </p>
                        {[
                            { icon:"✅",text:"Pantau progress tugas real-time" },
                            { icon:"📅",text:"Kalender deadline terintegrasi" },
                            { icon:"📊",text:"Analitik performa akademik" },
                        ].map((f,i)=>(
                            <div key={i} style={{ display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.15)",borderRadius:12,padding:"12px 16px",marginBottom:10,textAlign:"left",animation:`slide-up .5s ease ${.3+i*.1}s both` }}>
                                <span style={{ fontSize:18 }}>{f.icon}</span>
                                <span style={{ fontSize:13,fontWeight:600,color:"rgba(255,255,255,.9)" }}>{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT */}
                <div style={{ width:480,display:"flex",flexDirection:"column",justifyContent:"center",padding:"40px 48px",background:"white",position:"relative",zIndex:1,overflowY:"auto" }}>
                    {success && (
                        <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"white",zIndex:10,animation:"fade-in .3s ease",gap:16 }}>
                            <div style={{ width:80,height:80,borderRadius:"50%",background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",animation:"pop-in .4s ease" }}>
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                    <circle cx="20" cy="20" r="18" stroke="#16a34a" strokeWidth="2.5"/>
                                    <path d="M12 20 L18 26 L28 14" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" style={{ animation:"draw-check .4s ease .3s both" }}/>
                                </svg>
                            </div>
                            <p style={{ fontSize:18,fontWeight:800,color:"#111827" }}>{isLogin?"Selamat Datang!":"Akun Berhasil Dibuat!"}</p>
                            <p style={{ fontSize:13,color:"#9ca3af" }}>Mengalihkan ke dashboard…</p>
                        </div>
                    )}

                    <div style={{ marginBottom:32,animation:"slide-up .5s ease .15s both" }}>
                        <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"#eef2ff",borderRadius:10,padding:"6px 14px",marginBottom:16 }}>
                            <span style={{ fontSize:20,fontWeight:900,color:"#4338ca",letterSpacing:"-0.5px" }}>TaskApp</span>
                        </div>
                        <h2 style={{ fontSize:28,fontWeight:900,color:"#111827",marginBottom:6,letterSpacing:"-0.5px" }}>
                            {isLogin?"Masuk ke akun":"Buat akun baru"}
                        </h2>
                        <p style={{ fontSize:14,color:"#6b7280" }}>
                            {isLogin?"Masukkan email dan password kamu untuk melanjutkan.":"Daftar gratis dan mulai kelola tugasmu sekarang."}
                        </p>
                    </div>

                    <div style={{ display:"flex",gap:6,background:"#f3f4f6",borderRadius:14,padding:6,marginBottom:28,animation:"slide-up .5s ease .2s both" }}>
                        {[{key:"login",label:"Masuk"},{key:"register",label:"Daftar"}].map(t=>(
                            <button key={t.key} className="tab-btn"
                                onClick={()=>{setMode(t.key);setErrors({});setApiError("");}}
                                style={{ background:mode===t.key?"white":"transparent",color:mode===t.key?"#4338ca":"#9ca3af",boxShadow:mode===t.key?"0 1px 6px rgba(0,0,0,.1)":"none" }}
                            >{t.label}</button>
                        ))}
                    </div>

                    {apiError && (
                        <div style={{ padding:"12px 16px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,marginBottom:16,fontSize:13,color:"#dc2626",fontWeight:600 }}>
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:16,animation:"slide-up .5s ease .25s both" }}>
                        {!isLogin && (
                            <>
                                <Field label="Nama Lengkap" value={form.name} onChange={set("name")} placeholder="Fauzi Ramadhan" icon="👤" error={errors.name}/>
                                <Field label="NIM" value={form.nim} onChange={set("nim")} placeholder="12345678" icon="🎓" error={errors.nim}/>
                            </>
                        )}
                        <Field label="Email" type="email" value={form.email} onChange={set("email")} placeholder="nama@student.ac.id" icon="✉️" error={errors.email}/>
                        <Field label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 6 karakter" icon="🔒" error={errors.password}/>
                        {!isLogin && <Field label="Konfirmasi Password" type="password" value={form.confirm} onChange={set("confirm")} placeholder="Ulangi password" icon="🔐" error={errors.confirm}/>}

                        {isLogin && (
                            <div style={{ textAlign:"right",marginTop:-8 }}>
                                <button type="button" style={{ background:"none",border:"none",fontSize:12,fontWeight:700,color:"#4338ca",cursor:"pointer",fontFamily:"inherit" }}>Lupa password?</button>
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="auth-btn" style={{ marginTop:8,background:"linear-gradient(135deg,#4338ca 0%,#6366f1 100%)",color:"white",boxShadow:"0 4px 16px rgba(67,56,202,.3)" }}>
                            {loading?(
                                <><div style={{ width:18,height:18,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .8s linear infinite" }}/>Memproses…</>
                            ):isLogin?"Masuk ke Dashboard →":"Buat Akun Sekarang →"}
                        </button>
                    </form>

                    <p style={{ textAlign:"center",fontSize:12,color:"#9ca3af",marginTop:28 }}>
                        {isLogin?"Belum punya akun? ":"Sudah punya akun? "}
                        <button type="button" onClick={()=>{setMode(isLogin?"register":"login");setErrors({});setApiError("");}}
                            style={{ background:"none",border:"none",color:"#4338ca",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>
                            {isLogin?"Daftar sekarang":"Masuk di sini"}
                        </button>
                    </p>
                    <p style={{ textAlign:"center",fontSize:11,color:"#d1d5db",marginTop:16 }}>
                        Dengan melanjutkan, kamu menyetujui{" "}
                        <span style={{ color:"#9ca3af",cursor:"pointer" }}>Syarat & Ketentuan</span>{" "}dan{" "}
                        <span style={{ color:"#9ca3af",cursor:"pointer" }}>Kebijakan Privasi</span>
                    </p>
                </div>
            </div>
        </>
    );
}