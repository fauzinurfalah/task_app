import Sidebar from "../../components/Sidebar";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import axiosClient from "../../axiosClient";
import {
    ChevronLeft, ChevronRight, CalendarCheck2,
    AlertTriangle, BookOpen, Users, Clock, Zap, Info, Calendar as CalendarIcon, MapPin
} from "lucide-react";

const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAY_NAMES   = ["MIN","SEN","SEL","RAB","KAM","JUM","SAB"];
const FULL_DAY_NAMES = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y, m) { return new Date(y, m, 1).getDay(); }
function pad(n) { return String(n).padStart(2, "0"); }

const TYPE_CONFIG = {
    class:   { bg: "#eef2ff", color: "#4f46e5", label: "KELAS"   },
    grading: { bg: "#fef2f2", color: "#dc2626", label: "PENILAIAN" },
    meeting: { bg: "#ecfdf5", color: "#059669", label: "RAPAT"   },
};

function getCountdown(dateStr, time, now) {
    const [h, min] = time.split(":").map(Number);
    const target = new Date(dateStr);
    target.setHours(h, min, 0, 0);
    const diff = target - now;
    if (diff <= 0) return null;
    return {
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000)  / 60000),
        secs:  Math.floor((diff % 60000)    / 1000),
        diff,
    };
}

function EventTypeIcon({ type, size = 11 }) {
    if (type === "grading") return <AlertTriangle size={size} />;
    if (type === "class")   return <BookOpen size={size} />;
    return <Users size={size} />;
}

function EventDot({ event }) {
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const ref = useRef(null);
    const tooltipRef = useRef(null);
    const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.meeting;

    function toggle(e) {
        e.stopPropagation();
        if (!visible && ref.current) {
            const r = ref.current.getBoundingClientRect();
            setPos({ top: r.bottom + 8, left: Math.min(r.left, window.innerWidth - 250) });
        }
        setVisible(v => !v);
    }

    useEffect(() => {
        if (!visible) return;
        function handleOutside(e) {
            if (ref.current && !ref.current.contains(e.target) && tooltipRef.current && !tooltipRef.current.contains(e.target)) setVisible(false);
        }
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [visible]);

    return (
        <>
            <div ref={ref} onClick={toggle} style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:24, height:24, borderRadius:"50%", background: visible ? cfg.color : cfg.bg, color: visible ? "white" : cfg.color, cursor:"pointer", flexShrink:0, transition:"all 0.2s", transform: visible ? "scale(1.1)" : "scale(1)", boxShadow: visible ? `0 4px 12px ${cfg.color}55` : "none", border: visible ? "none" : `1px solid ${cfg.color}33` }}>
                <Info size={12} />
            </div>
            {visible && createPortal(
                <div ref={tooltipRef} onClick={e => e.stopPropagation()} style={{ position:"fixed", top:pos.top, left:pos.left, zIndex:99999, background:"white", border:`1px solid ${cfg.color}33`, borderRadius:16, padding:"16px", minWidth:240, maxWidth:280, boxShadow:"0 12px 40px rgba(0,0,0,0.15)", animation:"tooltipFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, color:cfg.color }}>
                        <EventTypeIcon type={event.type} size={14} />
                        <span style={{ fontSize:10, fontWeight:800, letterSpacing:"1px", textTransform: "uppercase" }}>{cfg.label}</span>
                    </div>
                    <p style={{ fontSize:14, fontWeight:800, color:"#0f172a", margin:"0 0 10px", lineHeight:1.4 }}>{event.label}</p>
                    <div style={{ display:"flex", alignItems:"center", gap:12, fontSize:12, color:"#64748b", fontWeight: 600 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} color={cfg.color} /> {event.time}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} color={cfg.color} /> {event.location}</span>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

function LiveClock({ now }) {
    const min  = pad(now.getMinutes());
    const sec  = pad(now.getSeconds());
    const h24  = pad(now.getHours());
    return (
        <div style={{ background: "white", padding: "20px 24px", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", border: "1px solid #e2e8f0", marginBottom: 24 }}>
            <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#64748b", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "1px" }}>Waktu Saat Ini</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", letterSpacing: "-1px", lineHeight: 1 }}>{h24}:{min}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#8b5cf6" }}>{sec}</span>
                </div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <Clock size={24} color="#8b5cf6" />
                <div style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6", border: "2px solid #f5f3ff" }}></div>
            </div>
        </div>
    );
}

function CountdownCard({ event, now }) {
    const cd = getCountdown(event.date, event.time, now);
    if (!cd) return null;
    const isUrgent = cd.diff < 86400000;
    return (
        <div style={{ background: isUrgent ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" : "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", borderRadius: 24, padding: "24px", color: "white", boxShadow: isUrgent ? "0 12px 24px rgba(239,68,68,0.2)" : "0 12px 24px rgba(139,92,246,0.2)", marginBottom: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "white", opacity: 0.1 }} />
            
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, opacity: 0.9 }}>
                <Zap size={14} /> Agenda Berikutnya
            </div>
            <p style={{ fontSize: 18, fontWeight: 900, margin: "0 0 20px", lineHeight: 1.3, letterSpacing: "-0.5px" }}>{event.label}</p>
            
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                {cd.days > 0 && <div style={{ flex: 1, background: "rgba(0,0,0,0.15)", borderRadius: 12, padding: "10px", textAlign: "center", backdropFilter: "blur(4px)" }}><span style={{ display: "block", fontSize: 20, fontWeight: 900 }}>{pad(cd.days)}</span><span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8, textTransform: "uppercase" }}>Hari</span></div>}
                <div style={{ flex: 1, background: "rgba(0,0,0,0.15)", borderRadius: 12, padding: "10px", textAlign: "center", backdropFilter: "blur(4px)" }}><span style={{ display: "block", fontSize: 20, fontWeight: 900 }}>{pad(cd.hours)}</span><span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8, textTransform: "uppercase" }}>Jam</span></div>
                <div style={{ flex: 1, background: "rgba(0,0,0,0.15)", borderRadius: 12, padding: "10px", textAlign: "center", backdropFilter: "blur(4px)" }}><span style={{ display: "block", fontSize: 20, fontWeight: 900 }}>{pad(cd.mins)}</span><span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8, textTransform: "uppercase" }}>Mnt</span></div>
                <div style={{ flex: 1, background: "rgba(0,0,0,0.15)", borderRadius: 12, padding: "10px", textAlign: "center", backdropFilter: "blur(4px)" }}><span style={{ display: "block", fontSize: 20, fontWeight: 900 }}>{pad(cd.secs)}</span><span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8, textTransform: "uppercase" }}>Dtk</span></div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, opacity: 0.9 }}>
                <MapPin size={14} /> {event.location}
            </div>
        </div>
    );
}

function AgendaItem({ event, now }) {
    const [h, min] = event.time.split(":").map(Number);
    const eventDate = new Date(event.date);
    eventDate.setHours(h, min, 0, 0);
    const isPast  = eventDate < now;
    const isToday = event.date === `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    const tag = TYPE_CONFIG[event.type] || TYPE_CONFIG.meeting;

    return (
        <div style={{ background: isPast ? "#f8fafc" : "white", borderRadius: 20, padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", marginBottom: 16, transition: "all 0.2s", opacity: isPast ? 0.7 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: tag.bg, color: tag.color, fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 8, letterSpacing: "1px" }}>{tag.label}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#64748b" }}><Clock size={12} /> {event.time}</span>
            </div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", textDecoration: isPast ? "line-through" : "none" }}>{event.label}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", fontWeight: 600 }}><MapPin size={14} /> {event.location}</span>
                {isPast && <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "#ecfdf5", padding: "4px 8px", borderRadius: 6 }}>SELESAI</span>}
            </div>
        </div>
    );
}

// ─── Dosen Calendar Page ──────────────────────────────────────────────────────
export default function DosenCalendarPage() {
    const navigate = useNavigate();
    const [now, setNow] = useState(new Date());
    const [current, setCurrent] = useState({ year: now.getFullYear(), month: now.getMonth() });
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        
        axiosClient.get('/dosen/tasks')
            .then(({ data }) => {
                const mapped = data.map(task => ({
                    id: task.id_task,
                    label: task.nama_tugas || "-",
                    type: "grading",
                    date: task.deadline ? task.deadline.substring(0, 10) : "",
                    time: task.jam || "23:59",
                    location: task.mata_kuliah?.nama_matkul || "Umum",
                })).filter(e => e.date);
                setEvents(mapped);
            })
            .catch(err => console.error(err));

        return () => clearInterval(t);
    }, []);

    const { year, month } = current;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay    = getFirstDayOfMonth(year, month);
    const daysInPrev  = getDaysInMonth(year, month - 1);

    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, currentMonth: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, currentMonth: true });
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) cells.push({ day: d, currentMonth: false });

    const prevMonth = () => setCurrent(c => ({ year: c.month === 0 ? c.year-1 : c.year, month: c.month === 0 ? 11 : c.month-1 }));
    const nextMonth = () => setCurrent(c => ({ year: c.month === 11 ? c.year+1 : c.year, month: c.month === 11 ? 0 : c.month+1 }));

    const eventMap = {};
    events.forEach(ev => {
        const d = parseInt(ev.date.split("-")[2]);
        const m = parseInt(ev.date.split("-")[1]) - 1;
        const y = parseInt(ev.date.split("-")[0]);
        if (y === year && m === month) { if (!eventMap[d]) eventMap[d] = []; eventMap[d].push(ev); }
    });

    const upcomingEvent = events
        .map(ev => { const [h, min] = ev.time.split(":").map(Number); const d = new Date(ev.date); d.setHours(h, min, 0, 0); return { ...ev, _ts: d }; })
        .filter(ev => ev._ts > now).sort((a, b) => a._ts - b._ts)[0];

    const todayStr  = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    const dateLabel = `${FULL_DAY_NAMES[now.getDay()]}, ${now.getDate()} ${MONTH_NAMES[now.getMonth()]}`;
    const todayEvents = events.filter(e => e.date === todayStr);

    return (
        <>
            <style>{`
                @keyframes tooltipFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <div className="app-wrapper">
                <Sidebar role="dosen" />
                <main className="main-content" style={{ background: "#f8fafc", padding: "40px 48px", minHeight: "100vh" }}>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
                        {/* ── LEFT: Calendar Grid ── */}
                        <div style={{ background: "white", borderRadius: 32, padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)" }}>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                                <button onClick={prevMonth} style={{ width: 44, height: 44, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#8b5cf6"; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "#8b5cf6"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                                    <ChevronLeft size={20} />
                                </button>
                                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0 }}>
                                    {MONTH_NAMES[month]} <span style={{ color: "#8b5cf6" }}>{year}</span>
                                </h2>
                                <button onClick={nextMonth} style={{ width: 44, height: 44, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#8b5cf6"; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "#8b5cf6"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12, marginBottom: 16 }}>
                                {DAY_NAMES.map(d => (
                                    <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>{d}</div>
                                ))}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12 }}>
                                {cells.map((cell, idx) => {
                                    const isToday = cell.currentMonth && cell.day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                                    const eventsOnDay = cell.currentMonth ? (eventMap[cell.day] || []) : [];
                                    const isWeekend = idx % 7 === 0 || idx % 7 === 6;
                                    
                                    return (
                                        <div key={idx} style={{ aspectRatio: "1/1.1", borderRadius: 20, background: isToday ? "#8b5cf6" : cell.currentMonth ? (isWeekend ? "#fafafa" : "white") : "#f8fafc", border: isToday ? "none" : cell.currentMonth ? "1px solid #e2e8f0" : "1px dashed #cbd5e1", padding: "12px", position: "relative", opacity: cell.currentMonth ? 1 : 0.5, boxShadow: isToday ? "0 8px 24px rgba(139,92,246,.3)" : "none", transition: "transform 0.2s", cursor: "default" }} onMouseEnter={e => cell.currentMonth && (e.currentTarget.style.transform = "translateY(-2px)")} onMouseLeave={e => cell.currentMonth && (e.currentTarget.style.transform = "translateY(0)")}>
                                            <span style={{ fontSize: 16, fontWeight: 800, color: isToday ? "white" : cell.currentMonth ? (isWeekend ? "#dc2626" : "#0f172a") : "#94a3b8", display: "inline-block", width: 28, height: 28, lineHeight: "28px", textAlign: "center", borderRadius: "50%", background: isToday ? "rgba(255,255,255,0.2)" : "transparent" }}>
                                                {cell.day}
                                            </span>
                                            
                                            {eventsOnDay.length > 0 && (
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                                                    {eventsOnDay.slice(0, 3).map(ev => <EventDot key={ev.id} event={ev} />)}
                                                    {eventsOnDay.length > 3 && (
                                                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f1f5f9", color: "#64748b", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>+{eventsOnDay.length - 3}</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── RIGHT: Agenda Panel ── */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            <LiveClock now={now} />
                            
                            <div style={{ background: "white", borderRadius: 32, padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)" }}>
                                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.5px" }}>Agenda Hari Ini</h2>
                                <p style={{ fontSize: 14, fontWeight: 600, color: "#8b5cf6", margin: "0 0 24px" }}>{dateLabel}</p>
                                
                                {upcomingEvent && <CountdownCard event={upcomingEvent} now={now} />}
                                
                                <div className="hide-scrollbar" style={{ display: "flex", flexDirection: "column", maxHeight: 400, overflowY: "auto", margin: "0 -10px", padding: "0 10px" }}>
                                    {events.length > 0 ? (
                                        todayEvents.length > 0
                                            ? todayEvents.map(ev => <AgendaItem key={ev.id} event={ev} now={now} />)
                                            : events.slice(0, 3).map(ev => <AgendaItem key={ev.id} event={ev} now={now} />)
                                    ) : (
                                        <div style={{ padding: "32px", textAlign: "center", background: "#f8fafc", borderRadius: 20, border: "2px dashed #e2e8f0" }}>
                                            <CalendarIcon size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
                                            <p style={{ fontSize: 14, fontWeight: 700, color: "#64748b", margin: 0 }}>Belum ada agenda hari ini.</p>
                                        </div>
                                    )}
                                </div>
                                
                                <button onClick={() => navigate('/dosen/tasks')} style={{ width: "100%", padding: "16px", borderRadius: 16, border: "1.5px solid #e2e8f0", background: "white", color: "#0f172a", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 16, transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }} onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                                    <CalendarCheck2 size={18} /> Lihat Semua Tugas
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
