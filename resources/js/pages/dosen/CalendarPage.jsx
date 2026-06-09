import Sidebar from "../../components/Sidebar";
import { useState, useEffect, useRef } from "react";
import {
    ChevronLeft, ChevronRight, Plus, CalendarCheck2,
    AlertTriangle, BookOpen, Users, Clock, Zap, Info,
} from "lucide-react";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const FULL_DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y, m) { return new Date(y, m, 1).getDay(); }
function pad(n) { return String(n).padStart(2, "0"); }

// Dosen calendar has different event types: quiz grading, class schedule, etc.
function buildDosenEvents() {
    return [];
}

const EVENTS = buildDosenEvents();

const TYPE_CONFIG = {
    class:   { bg: "#eef2ff", color: "#4338ca", label: "KELAS"   },
    grading: { bg: "#fee2e2", color: "#dc2626", label: "PENILAIAN" },
    meeting: { bg: "#f0fdf4", color: "#16a34a", label: "RAPAT"   },
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
            <div ref={ref} onClick={toggle} style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:20, height:20, borderRadius:"50%", background: visible ? cfg.color : cfg.bg, color: visible ? "white" : cfg.color, cursor:"pointer", flexShrink:0, transition:"background 0.15s, color 0.15s, transform 0.15s", transform: visible ? "scale(1.15)" : "scale(1)", boxShadow: visible ? `0 2px 8px ${cfg.color}55` : "none" }}>
                <Info size={10} />
            </div>
            {visible && (
                <div ref={tooltipRef} onClick={e => e.stopPropagation()} style={{ position:"fixed", top:pos.top, left:pos.left, zIndex:99999, background:"white", border:`1.5px solid ${cfg.color}33`, borderRadius:14, padding:"12px 14px", minWidth:210, maxWidth:260, boxShadow:"0 8px 30px rgba(0,0,0,0.15)", animation:"tooltipFadeIn 0.15s ease" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5, color:cfg.color }}>
                        <EventTypeIcon type={event.type} size={12} />
                        <span style={{ fontSize:9, fontWeight:800, letterSpacing:1 }}>{cfg.label}</span>
                    </div>
                    <p style={{ fontSize:13, fontWeight:800, color:"#111827", margin:"0 0 6px", lineHeight:1.3 }}>{event.label}</p>
                    <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#6b7280" }}>
                        <Clock size={10} /><span>{event.time}</span>
                        <span style={{ color:"#d1d5db" }}>·</span><span>{event.location}</span>
                    </div>
                </div>
            )}
        </>
    );
}

function LiveClock({ now }) {
    const min  = pad(now.getMinutes());
    const sec  = pad(now.getSeconds());
    const ampm = now.getHours() >= 12 ? "PM" : "AM";
    const h12  = now.getHours() % 12 || 12;
    return (
        <div className="live-clock">
            <div className="live-clock__display">
                <span className="live-clock__time">{pad(h12)}:{min}</span>
                <span className="live-clock__sec">{sec}</span>
                <span className="live-clock__ampm">{ampm}</span>
            </div>
            <div className="live-clock__dot" />
        </div>
    );
}

function CountdownCard({ event, now }) {
    const cd = getCountdown(event.date, event.time, now);
    if (!cd) return null;
    const isUrgent = cd.diff < 86400000;
    return (
        <div className={`countdown-card ${isUrgent ? "countdown-card--urgent" : ""}`}>
            <div className="countdown-card__top"><Zap size={13} /><span>ACARA BERIKUTNYA</span></div>
            <p className="countdown-card__label">{event.label}</p>
            <div className="countdown-card__timer">
                {cd.days > 0 && <div className="countdown-unit"><span className="countdown-unit__num">{pad(cd.days)}</span><span className="countdown-unit__label">Hari</span></div>}
                <div className="countdown-unit"><span className="countdown-unit__num">{pad(cd.hours)}</span><span className="countdown-unit__label">Jam</span></div>
                <div className="countdown-sep">:</div>
                <div className="countdown-unit"><span className="countdown-unit__num">{pad(cd.mins)}</span><span className="countdown-unit__label">Menit</span></div>
                <div className="countdown-sep">:</div>
                <div className="countdown-unit"><span className={`countdown-unit__num ${isUrgent ? "tick" : ""}`}>{pad(cd.secs)}</span><span className="countdown-unit__label">Detik</span></div>
            </div>
            <p className="countdown-card__location">{event.location}</p>
        </div>
    );
}

function AgendaItem({ event, now }) {
    const [h, min] = event.time.split(":").map(Number);
    const eventDate = new Date(event.date);
    eventDate.setHours(h, min, 0, 0);
    const isPast  = eventDate < now;
    const isToday = event.date === `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    const tagMap = {
        class:   { cls: "agenda-tag--assignment", label: "KELAS"    },
        grading: { cls: "agenda-tag--exam",       label: "PENILAIAN" },
        meeting: { cls: "agenda-tag--meeting",    label: "RAPAT"    },
    };
    const tag = tagMap[event.type];
    return (
        <div className={`agenda-card ${isPast ? "agenda-card--past" : ""} ${isToday ? "agenda-card--today" : ""}`}>
            <div className="agenda-card__header">
                <span className={`agenda-tag ${tag.cls}`}>{tag.label}</span>
                <span className="agenda-card__time"><Clock size={11} />{event.time}</span>
            </div>
            <p className="agenda-card__title">{event.label}</p>
            <p className="agenda-card__sub">{event.location}</p>
            {isPast && <span className="agenda-badge--done">✓ Selesai</span>}
        </div>
    );
}

// ─── Dosen Calendar Page ──────────────────────────────────────────────────────
export default function DosenCalendarPage() {
    const [now, setNow] = useState(new Date());
    const [current, setCurrent] = useState({ year: now.getFullYear(), month: now.getMonth() });

    useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

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
    const goToday   = () => setCurrent({ year: now.getFullYear(), month: now.getMonth() });

    const eventMap = {};
    EVENTS.forEach(ev => {
        const d = parseInt(ev.date.split("-")[2]);
        const m = parseInt(ev.date.split("-")[1]) - 1;
        const y = parseInt(ev.date.split("-")[0]);
        if (y === year && m === month) { if (!eventMap[d]) eventMap[d] = []; eventMap[d].push(ev); }
    });

    const classes  = EVENTS.filter(e => e.type === "class"   && parseInt(e.date.split("-")[1])-1 === month).length;
    const gradings = EVENTS.filter(e => e.type === "grading" && parseInt(e.date.split("-")[1])-1 === month).length;

    const upcomingEvent = EVENTS
        .map(ev => { const [h, min] = ev.time.split(":").map(Number); const d = new Date(ev.date); d.setHours(h, min, 0, 0); return { ...ev, _ts: d }; })
        .filter(ev => ev._ts > now).sort((a, b) => a._ts - b._ts)[0];

    const todayStr  = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    const dayLabel  = FULL_DAY_NAMES[now.getDay()].toUpperCase();
    const dateLabel = `${dayLabel}, ${now.getDate()} ${MONTH_NAMES[now.getMonth()].toUpperCase()}`;
    const todayEvents = EVENTS.filter(e => e.date === todayStr);

    return (
        <>
            <style>{`@keyframes tooltipFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <div className="app-wrapper">
                <Sidebar role="dosen" />
                <main className="main-content cal-page">
                    <div className="cal-body">
                        <div className="cal-grid-wrapper">
                            {/* ── Month nav inside the calendar box ── */}
                            <div className="cal-grid-nav">
                                <button className="cal-grid-nav__btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
                                <h2 className="cal-grid-nav__title">{MONTH_NAMES[month]} {year}</h2>
                                <button className="cal-grid-nav__btn" onClick={nextMonth}><ChevronRight size={16} /></button>
                            </div>
                            <div className="cal-day-headers">
                                {DAY_NAMES.map(d => <div key={d} className="cal-day-header">{d}</div>)}
                            </div>
                            <div className="cal-cells">
                                {cells.map((cell, idx) => {
                                    const isToday = cell.currentMonth && cell.day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                                    const eventsOnDay = cell.currentMonth ? (eventMap[cell.day] || []) : [];
                                    return (
                                        <div key={idx} className={["cal-cell", !cell.currentMonth ? "cal-cell--other" : "", isToday ? "cal-cell--today" : ""].join(" ")}>
                                            <span className={`cal-cell__num ${isToday ? "cal-cell__num--today" : ""}`}>{cell.day}</span>
                                            {isToday && <span className="cal-cell__live-time">{pad(now.getHours() % 12 || 12)}:{pad(now.getMinutes())}<span className="cal-cell__live-dot" /></span>}
                                            {eventsOnDay.length > 0 && (
                                                <div style={{ display:"flex", flexWrap:"wrap", gap:3, marginTop:2 }}>
                                                    {eventsOnDay.map(ev => <EventDot key={ev.id} event={ev} />)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="agenda-panel">
                            <LiveClock now={now} />
                            <h2 className="agenda-panel__title">Agenda Hari Ini</h2>
                            <p className="agenda-panel__date">{dateLabel}</p>
                            {upcomingEvent && <CountdownCard event={upcomingEvent} now={now} />}
                            <div className="agenda-list">
                                {EVENTS.length > 0 ? (
                                    todayEvents.length > 0
                                        ? todayEvents.map(ev => <AgendaItem key={ev.id} event={ev} now={now} />)
                                        : EVENTS.slice(0, 3).map(ev => <AgendaItem key={ev.id} event={ev} now={now} />)
                                ) : (
                                    <p style={{color:'#9ca3af', fontSize:13, padding:"10px 0"}}>Belum ada agenda.</p>
                                )}
                            </div>
                            <button className="btn-schedule"><CalendarCheck2 size={16} />Lihat Jadwal Lengkap</button>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
