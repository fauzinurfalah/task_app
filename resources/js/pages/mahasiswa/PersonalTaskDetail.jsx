import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import {
    ArrowLeft, ChevronRight, Target, Clock, Calendar,
    CheckCircle2, Circle, Plus, Trash2, Edit3, Flame,
    BookOpen, X, Save, AlertTriangle, Layers, BarChart2, Tag
} from "lucide-react";

const LS_KEY = "mahasiswa_personal_tasks";

const PRI_CFG = {
    urgent: { bg: "#fef2f2", color: "#dc2626", dot: "#dc2626", label: "Urgent", border: "#fecaca" },
    high:   { bg: "#fff7ed", color: "#ea580c", dot: "#ea580c", label: "High", border: "#fed7aa" },
    medium: { bg: "#fefce8", color: "#ca8a04", dot: "#ca8a04", label: "Medium", border: "#fef08a" },
    low:    { bg: "#f0fdf4", color: "#10b981", dot: "#10b981", label: "Low", border: "#a7f3d0" },
};

function daysLeft(due, time = "23:59") {
    const d = new Date(`${due}T${time}`);
    const now = new Date();
    if (d < now) return -1;
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDate   = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.round((dueDate - todayDate) / 86400000);
}
function fmtDate(s) {
    return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ task, onClose, onSave }) {
    const [f, setF] = useState({ ...task });
    const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
    const inp = { width: "100%", padding: "14px 16px", border: "1.5px solid #e2e8f0", borderRadius: 16, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#f8fafc", transition: "all .2s" };
    const focus = e => { e.target.style.borderColor = "#8b5cf6"; e.target.style.boxShadow = "0 0 0 4px rgba(139,92,246,.1)"; e.target.style.background = "white"; };
    const blur  = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; };
    const pris  = [
        { v: "urgent", l: "🔴 Urgent" }, { v: "high", l: "🟠 High" },
        { v: "medium", l: "🟡 Medium" }, { v: "low",  l: "🟢 Low" },
    ];
    return (
        <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.6)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)" }}>
            <div onClick={e => e.stopPropagation()} style={{ background:"white",borderRadius:32,width:"100%",maxWidth:540,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,.2)",display:"flex",flexDirection:"column" }}>
                <div style={{ padding:"28px 32px 20px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(10px)",zIndex:10 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                        <div style={{ width:40,height:40,borderRadius:12,background:"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center" }}><Target size={20} color="#8b5cf6"/></div>
                        <h3 style={{ fontSize:20,fontWeight:900,color:"#0f172a",margin:0,letterSpacing:"-0.5px" }}>Edit Tugas Mandiri</h3>
                    </div>
                    <button onClick={onClose} style={{ background:"#f1f5f9",border:"none",cursor:"pointer",color:"#64748b",padding:8,borderRadius:12,transition:"all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}><X size={20}/></button>
                </div>
                <div style={{ padding:"24px 32px",display:"flex",flexDirection:"column",gap:20 }}>
                    <div><label style={{ fontSize:12,fontWeight:800,color:"#475569",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px" }}>Nama Tugas <span style={{color:"#ef4444"}}>*</span></label>
                        <input type="text" value={f.title} onChange={s("title")} style={inp} onFocus={focus} onBlur={blur}/></div>
                    <div><label style={{ fontSize:12,fontWeight:800,color:"#475569",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px" }}>Kategori</label>
                        <input type="text" value={f.course} onChange={s("course")} style={inp} onFocus={focus} onBlur={blur}/></div>
                    <div><label style={{ fontSize:12,fontWeight:800,color:"#475569",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px" }}>Catatan</label>
                        <textarea value={f.description} onChange={s("description")} rows={4} style={{ ...inp,resize:"vertical" }} onFocus={focus} onBlur={blur}/></div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                        <div><label style={{ fontSize:12,fontWeight:800,color:"#475569",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px" }}>Tenggat Waktu <span style={{color:"#ef4444"}}>*</span></label>
                            <input type="date" value={f.due} onChange={s("due")} style={inp} onFocus={focus} onBlur={blur}/></div>
                        <div><label style={{ fontSize:12,fontWeight:800,color:"#475569",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px" }}>Jam Target</label>
                            <input type="time" value={f.dueTime} onChange={s("dueTime")} style={inp} onFocus={focus} onBlur={blur}/></div>
                    </div>
                    <div><label style={{ fontSize:12,fontWeight:800,color:"#475569",display:"block",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.5px" }}>Prioritas</label>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                            {pris.map(p => (
                                <button key={p.v} onClick={() => setF(prev => ({ ...prev, priority: p.v }))}
                                    style={{ padding:"12px 16px",borderRadius:16,border:`1.5px solid ${f.priority===p.v?PRI_CFG[p.v].dot:"#e2e8f0"}`,background:f.priority===p.v?PRI_CFG[p.v].bg:"#f8fafc",fontSize:14,fontWeight:800,color:f.priority===p.v?PRI_CFG[p.v].color:"#475569",cursor:"pointer",fontFamily:"inherit",transition:"all .2s",display:"flex",alignItems:"center",gap:8,justifyContent:"center" }}>
                                    {p.l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ padding:"24px 32px",borderTop:"1px solid #f1f5f9",display:"flex",gap:12,position:"sticky",bottom:0,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(10px)" }}>
                    <button onClick={onClose} style={{ flex:1,padding:"14px 20px",borderRadius:16,border:"1.5px solid #e2e8f0",background:"white",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",color:"#475569",transition:"all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "white"}>Batal</button>
                    <button onClick={() => { if(!f.title.trim()||!f.due) return; onSave(f); onClose(); }}
                        style={{ flex:2,padding:"14px 20px",borderRadius:16,border:"none",background:"linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",color:"white",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 20px rgba(124,58,237,.25)",transition:"all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 110, color = "#8b5cf6" }) {
    const r = (size - 16) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={12} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={pct === 100 ? "#10b981" : color}
                    strokeWidth={12} strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: "stroke-dashoffset .8s cubic-bezier(0.4, 0, 0.2, 1)" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" }}>{pct}%</span>
                <span style={{ fontSize: 10, color: "#64748b", fontWeight: 800, letterSpacing: "1px" }}>SELESAI</span>
            </div>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PersonalTaskDetail() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const taskId    = location.state?.taskId;

    const [task, setTask]       = useState(null);
    const [subtasks, setSubs]   = useState([]);
    const [newSub, setNewSub]   = useState("");
    const [showEdit, setEdit]   = useState(false);

    // Load from localStorage
    useEffect(() => {
        const all = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
        const found = all.find(t => String(t.id) === String(taskId));
        if (found) {
            setTask(found);
            setSubs(found.subtasks || []);
        }
    }, [taskId]);

    // Persist changes back to localStorage
    function persist(updated) {
        const all = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
        const next = all.map(t => String(t.id) === String(taskId) ? updated : t);
        localStorage.setItem(LS_KEY, JSON.stringify(next));
        setTask(updated);
    }

    function toggleDone() {
        const updated = { ...task, status: task.status === "completed" ? "pending" : "completed", progress: task.status === "completed" ? 0 : 100, subtasks };
        persist(updated);
    }

    function saveTask(edited) {
        const updated = { ...edited, subtasks };
        persist(updated);
    }

    function toggleSub(id) {
        const next = subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s);
        setSubs(next);
        persist({ ...task, subtasks: next });
    }
    function deleteSub(id) {
        const next = subtasks.filter(s => s.id !== id);
        setSubs(next);
        persist({ ...task, subtasks: next });
    }
    function addSub() {
        if (!newSub.trim()) return;
        const next = [...subtasks, { id: Date.now(), label: newSub.trim(), done: false }];
        setSubs(next);
        persist({ ...task, subtasks: next });
        setNewSub("");
    }

    if (!task) return (
        <div className="app-wrapper">
            <Sidebar />
            <main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "white", borderRadius: 32, padding: "80px 40px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,.02)", border: "2px dashed #e2e8f0", maxWidth: 500, width: "100%" }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                        <Target size={40} color="#cbd5e1" />
                    </div>
                    <h3 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: "0 0 10px" }}>Tugas Tidak Ditemukan</h3>
                    <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 30px" }}>Tugas mandiri ini mungkin telah dihapus atau ID-nya tidak valid.</p>
                    <button onClick={() => navigate("/mahasiswa/tasks")} style={{ padding: "14px 28px", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 20px rgba(139,92,246,0.25)" }}>Kembali ke Daftar Tugas</button>
                </div>
            </main>
        </div>
    );

    const pc      = PRI_CFG[task.priority] || PRI_CFG.medium;
    const days    = daysLeft(task.due, task.dueTime || "23:59");
    const done    = task.status === "completed";
    const doneSubs = subtasks.filter(s => s.done).length;
    const subPct  = subtasks.length ? Math.round((doneSubs / subtasks.length) * 100) : 0;
    const progress = done ? 100 : (subtasks.length > 0 ? subPct : task.progress || 0);

    return (
        <div className="app-wrapper">
            {showEdit && <EditModal task={task} onClose={() => setEdit(false)} onSave={saveTask} />}
            <Sidebar />
            <main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px", minHeight: "100vh" }}>
                
                {/* Breadcrumb */}
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:28 }}>
                    <button onClick={() => navigate("/mahasiswa/tasks")}
                        style={{ display:"flex",alignItems:"center",gap:6,background:"none",border:"none",fontSize:13,fontWeight:700,color:"#64748b",cursor:"pointer",fontFamily:"inherit",padding:0,transition:"color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#0f172a"}
                        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
                        <ArrowLeft size={16}/> Kembali ke Daftar Tugas
                    </button>
                    <ChevronRight size={14} color="#cbd5e1"/>
                    <span style={{ fontSize:13,fontWeight:700,color:"#8b5cf6",background:"#f5f3ff",padding:"4px 10px",borderRadius:8 }}>Tugas Mandiri</span>
                </div>

                <div style={{ display:"grid",gridTemplateColumns:"1fr 340px",gap:24,alignItems:"start" }}>
                    {/* ── LEFT ── */}
                    <div style={{ display:"flex",flexDirection:"column",gap:24 }}>

                        {/* Hero Card */}
                        <div style={{ background:"white",borderRadius:24,padding:"32px",boxShadow:"0 4px 16px rgba(0,0,0,.02)",border:"1px solid #e2e8f0",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24 }}>
                            <div style={{ flex:1,minWidth:0 }}>
                                {/* Badges */}
                                <div style={{ display:"flex",gap:12,marginBottom:16,flexWrap:"wrap",alignItems:"center" }}>
                                    <span style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:10,fontSize:11,fontWeight:800,background:"#f5f3ff",color:"#8b5cf6",border:"1px solid #ddd6fe",letterSpacing:"0.5px" }}>
                                        <Target size={14}/>MANDIRI
                                    </span>
                                    <span style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:10,fontSize:11,fontWeight:800,background:pc.bg,color:pc.color,border:`1px solid ${pc.border}`,letterSpacing:"0.5px" }}>
                                        <span style={{ width:8,height:8,borderRadius:"50%",background:pc.dot }}/>{pc.label}
                                    </span>
                                    <span style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:10,fontSize:11,fontWeight:800,letterSpacing:"0.5px",
                                        background: done?"#ecfdf5":"#f1f5f9", color: done?"#059669":"#64748b", border:`1px solid ${done?"#a7f3d0":"#e2e8f0"}` }}>
                                        {done ? "✓ SELESAI" : "● BERLANGSUNG"}
                                    </span>
                                </div>

                                <h1 style={{ fontSize:32,fontWeight:900,color:"#0f172a",margin:"0 0 12px",letterSpacing:"-0.5px",lineHeight:1.2 }}>{task.title}</h1>
                                <p style={{ fontSize:15,color:"#64748b",margin:"0 0 20px",display:"flex",alignItems:"center",gap:8,fontWeight:600 }}>
                                    <span style={{ background:"#f8fafc",border:"1px solid #e2e8f0",color:"#475569",fontSize:13,fontWeight:800,padding:"6px 14px",borderRadius:10 }}>{task.course || "Tugas Umum"}</span>
                                </p>

                                <div style={{ display:"flex",flexWrap:"wrap",gap:20,marginBottom:16 }}>
                                    <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:14,color:"#475569",fontWeight:700 }}>
                                        <Calendar size={16} color="#94a3b8"/><span>{fmtDate(task.due)}</span>
                                    </div>
                                    <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:14,color:"#475569",fontWeight:700 }}>
                                        <Clock size={16} color="#94a3b8"/><span>{task.dueTime || "23:59"}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:16,flexShrink:0,padding:"10px" }}>
                                <ProgressRing pct={progress} color="#8b5cf6" />
                            </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                            <div style={{ background:"white",borderRadius:24,padding:"24px 32px",boxShadow:"0 4px 16px rgba(0,0,0,.02)",border:"1px solid #e2e8f0" }}>
                                <h2 style={{ display:"flex",alignItems:"center",gap:10,fontSize:18,fontWeight:900,color:"#0f172a",margin:"0 0 16px" }}>
                                    <BookOpen size={20} color="#8b5cf6"/>Catatan Tambahan
                                </h2>
                                <div style={{ fontSize:15,color:"#334155",lineHeight:1.8,whiteSpace:"pre-wrap",background:"#fafafa",padding:"20px 24px",borderRadius:16,border:"1px solid #f1f5f9" }}>
                                    {task.description}
                                </div>
                            </div>
                        )}

                        {/* Sub-tasks */}
                        <div style={{ background:"white",borderRadius:24,padding:"24px 32px",boxShadow:"0 4px 16px rgba(0,0,0,.02)",border:"1px solid #e2e8f0" }}>
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                                <h2 style={{ display:"flex",alignItems:"center",gap:10,fontSize:18,fontWeight:900,color:"#0f172a",margin:0 }}>
                                    <CheckCircle2 size={20} color="#8b5cf6"/>Sub-tugas
                                </h2>
                                <span style={{ background:"#f8fafc",padding:"4px 12px",borderRadius:12,border:"1px solid #e2e8f0",fontSize:13,fontWeight:800,color:"#64748b" }}>{doneSubs} dari {subtasks.length} Selesai</span>
                            </div>

                            {subtasks.length > 0 && (
                                <div style={{ marginBottom:20 }}>
                                    <div style={{ height:8,background:"#f1f5f9",borderRadius:99,overflow:"hidden" }}>
                                        <div style={{ height:"100%",width:`${subPct}%`,background:"linear-gradient(90deg, #8b5cf6, #6d28d9)",borderRadius:99,transition:"width .4s ease" }}/>
                                    </div>
                                </div>
                            )}

                            <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
                                {subtasks.length === 0 && <div style={{ padding:"30px",textAlign:"center",background:"#f8fafc",borderRadius:16,border:"1px dashed #cbd5e1" }}><p style={{ fontSize:14,color:"#64748b",fontWeight:600,margin:0 }}>Belum ada rincian sub-tugas yang ditambahkan.</p></div>}
                                {subtasks.map(sub => (
                                    <div key={sub.id} style={{ display:"flex",alignItems:"center",gap:16,padding:"16px 20px",background:"#f8fafc",borderRadius:16,border:"1px solid #e2e8f0",transition:"all .2s" }}
                                        onMouseEnter={e => { e.currentTarget.style.background="white"; e.currentTarget.style.borderColor="#cbd5e1"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.02)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.boxShadow="none"; }}>
                                        <button onClick={() => toggleSub(sub.id)} style={{ background:"none",border:"none",cursor:"pointer",display:"flex",flexShrink:0,padding:0,transition:"transform .2s" }}
                                            onMouseEnter={e => e.currentTarget.style.transform="scale(1.15)"}
                                            onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
                                            {sub.done ? <CheckCircle2 size={24} color="#10b981" /> : <Circle size={24} color="#cbd5e1"/>}
                                        </button>
                                        <span style={{ flex:1,fontSize:15,fontWeight:700,color:sub.done?"#94a3b8":"#0f172a",textDecoration:sub.done?"line-through":"none",transition:"all .2s" }}>{sub.label}</span>
                                        <button onClick={() => deleteSub(sub.id)}
                                            style={{ background:"#fef2f2",border:"none",cursor:"pointer",color:"#dc2626",display:"flex",padding:8,borderRadius:10,opacity:0.6,transition:"all .2s" }}
                                            onMouseEnter={e => { e.currentTarget.style.opacity=1; e.currentTarget.style.background="#fee2e2"; }}
                                            onMouseLeave={e => { e.currentTarget.style.opacity=0.6; e.currentTarget.style.background="#fef2f2"; }}>
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display:"flex",gap:12 }}>
                                <input value={newSub} onChange={e => setNewSub(e.target.value)}
                                    onKeyDown={e => e.key==="Enter" && addSub()}
                                    placeholder="Ketik sub-tugas baru... (tekan Enter)"
                                    style={{ flex:1,padding:"14px 20px",border:"1px solid #e2e8f0",borderRadius:16,fontSize:14,fontFamily:"inherit",outline:"none",transition:"all .2s",background:"white" }}
                                    onFocus={e => { e.target.style.borderColor="#8b5cf6"; e.target.style.boxShadow="0 0 0 4px rgba(139,92,246,.1)"; }}
                                    onBlur={e => { e.target.style.borderColor="#e2e8f0"; e.target.style.boxShadow="none"; }}
                                />
                                <button onClick={addSub} style={{ width:48,height:48,borderRadius:16,background:"#0f172a",color:"white",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s" }}
                                    onMouseEnter={e => e.currentTarget.style.background="#1e293b"}
                                    onMouseLeave={e => e.currentTarget.style.background="#0f172a"}>
                                    <Plus size={20}/>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT ── */}
                    <div style={{ display:"flex",flexDirection:"column",gap:24 }}>

                        {/* Actions */}
                        <div style={{ background:"white",borderRadius:24,padding:"24px",boxShadow:"0 4px 16px rgba(0,0,0,.02)",border:"1px solid #e2e8f0",display:"flex",flexDirection:"column",gap:12 }}>
                            <button onClick={toggleDone}
                                style={{ background:done?"white":"linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",color:done?"#0f172a":"white",border:done?"1px solid #e2e8f0":"none",padding:"16px 20px",borderRadius:16,fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",boxShadow:done?"none":"0 8px 20px rgba(139,92,246,0.25)",transition:"all .2s" }}
                                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; if(done) e.currentTarget.style.background="#f8fafc"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; if(done) e.currentTarget.style.background="white"; }}>
                                {done ? <><Circle size={18} color="#64748b"/>Tandai Belum Selesai</> : <><CheckCircle2 size={18}/>Tandai Selesai</>}
                            </button>
                            <button onClick={() => setEdit(true)}
                                style={{ background:"white",color:"#0f172a",border:"1px solid #e2e8f0",padding:"16px 20px",borderRadius:16,fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",transition:"all .2s" }}
                                onMouseEnter={e => { e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.borderColor="#cbd5e1"; }}
                                onMouseLeave={e => { e.currentTarget.style.background="white"; e.currentTarget.style.borderColor="#e2e8f0"; }}>
                                <Edit3 size={18}/>Edit Tugas
                            </button>
                        </div>

                        {/* Deadline Card */}
                        <div style={{ background:"white",borderRadius:24,padding:"24px",boxShadow:"0 4px 16px rgba(0,0,0,.02)",border:"1px solid #e2e8f0" }}>
                            <h3 style={{ fontSize:14,fontWeight:900,color:"#0f172a",margin:"0 0 16px",display:"flex",alignItems:"center",gap:10,textTransform:"uppercase",letterSpacing:"0.5px" }}>
                                <Clock size={18} color="#8b5cf6"/>Deadline Target
                            </h3>
                            <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:14,fontSize:14,fontWeight:800,
                                background: days<0?"#fef2f2": days===0?"#fff7ed":"#f5f3ff",
                                color: days<0?"#dc2626": days===0?"#ea580c":"#8b5cf6",
                                border: `1px solid ${days<0?"#fecaca": days===0?"#fed7aa":"#ddd6fe"}` }}>
                                {days<0 ? <><AlertTriangle size={16}/>Terlambat!</>
                                    : days===0 ? <><Flame size={16}/>Hari ini!</>
                                    : <><Clock size={16}/>{days} hari lagi</>}
                            </div>
                            <p style={{ fontSize:13,fontWeight:600,color:"#64748b",margin:"12px 0 0" }}>{fmtDate(task.due)} · {task.dueTime||"23:59"}</p>
                        </div>

                        {/* Info Card */}
                        <div style={{ background:"white",borderRadius:24,padding:"24px",boxShadow:"0 4px 16px rgba(0,0,0,.02)",border:"1px solid #e2e8f0" }}>
                            <h3 style={{ display:"flex",alignItems:"center",gap:10,fontSize:14,fontWeight:900,color:"#0f172a",margin:"0 0 16px",textTransform:"uppercase",letterSpacing:"0.5px" }}>
                                <Tag size={18} color="#8b5cf6"/>Informasi Detail
                            </h3>
                            <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                                {[
                                    { k:"Prioritas",  v:pc.label,  vc:pc.color },
                                    { k:"Kategori",   v:task.course||"—" },
                                    { k:"Progress",   v:`${progress}%`, vc:done?"#10b981":"#8b5cf6" },
                                    { k:"Sub-tugas",  v:`${doneSubs} dari ${subtasks.length}` },
                                ].map((r,i,arr) => (
                                    <div key={r.k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,paddingBottom:i!==arr.length-1?16:0,borderBottom:i!==arr.length-1?"1px solid #f1f5f9":"none" }}>
                                        <span style={{ color:"#64748b",fontWeight:700 }}>{r.k}</span>
                                        <span style={{ color:r.vc||"#0f172a",fontWeight:800 }}>{r.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
