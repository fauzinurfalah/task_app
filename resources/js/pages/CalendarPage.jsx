import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    CalendarCheck2,
    AlertTriangle,
    BookOpen,
    Users,
    Clock,
    Timer,
    Zap,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
];
const DAY_NAMES = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const FULL_DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}
function pad(n) {
    return String(n).padStart(2, "0");
}

// ─── Sample Events (pakai tanggal relatif ke bulan ini) ──────────────────────
function buildEvents() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return [
        {
            id: 1,
            date: `${y}-${m}-03`,
            label: "MATH 101 Quiz",
            type: "exam",
            color: "event--exam",
            time: "09:00",
            location: "Room 301",
        },
        {
            id: 2,
            date: `${y}-${m}-08`,
            label: "CS History Essay",
            type: "assignment",
            color: "event--assignment",
            time: "11:59",
            location: "Online Submit",
        },
        {
            id: 3,
            date: `${y}-${m}-14`,
            label: "PHYSICS Midterm",
            type: "exam",
            color: "event--exam",
            time: "09:00",
            location: "Main Hall, Room 402",
        },
        {
            id: 4,
            date: `${y}-${m}-23`,
            label: "Group Project Due",
            type: "assignment",
            color: "event--assignment",
            time: "23:59",
            location: "Online Submit",
        },
        {
            id: 5,
            date: `${y}-${m}-28`,
            label: "Lab Prep Session",
            type: "meeting",
            color: "event--meeting",
            time: "14:30",
            location: "Library – Study Room B",
        },
    ];
}

const EVENTS = buildEvents();

// ─── Countdown helper ─────────────────────────────────────────────────────────
function getCountdown(eventDateStr, eventTime, now) {
    const [h, min] = eventTime.split(":").map(Number);
    const target = new Date(eventDateStr);
    target.setHours(h, min, 0, 0);
    const diff = target - now;
    if (diff <= 0) return null;
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);
    return { days, hours, mins, secs, diff };
}

// ─── Event Icon ────────────────────────────────────────────────────────────────
function EventIcon({ type }) {
    if (type === "exam")       return <AlertTriangle size={10} />;
    if (type === "assignment") return <BookOpen size={10} />;
    return <Users size={10} />;
}

// ─── Event Pill ────────────────────────────────────────────────────────────────
function EventPill({ event }) {
    return (
        <div className={`cal-event ${event.color}`}>
            <EventIcon type={event.type} />
            <span>{event.label}</span>
        </div>
    );
}

// ─── Live Clock Component ──────────────────────────────────────────────────────
function LiveClock({ now }) {
    const h   = pad(now.getHours());
    const min = pad(now.getMinutes());
    const sec = pad(now.getSeconds());
    const ampm = now.getHours() >= 12 ? "PM" : "AM";
    const h12 = now.getHours() % 12 || 12;

    return (
        <div className="live-clock">
            <div className="live-clock__display">
                <span className="live-clock__time">
                    {pad(h12)}:{min}
                </span>
                <span className="live-clock__sec">{sec}</span>
                <span className="live-clock__ampm">{ampm}</span>
            </div>
            <div className="live-clock__dot" />
        </div>
    );
}

// ─── Countdown Card ────────────────────────────────────────────────────────────
function CountdownCard({ event, now }) {
    const cd = getCountdown(event.date, event.time, now);
    if (!cd) return null;

    const isUrgent = cd.diff < 86400000; // less than 1 day

    return (
        <div className={`countdown-card ${isUrgent ? "countdown-card--urgent" : ""}`}>
            <div className="countdown-card__top">
                <Zap size={13} />
                <span>NEXT EVENT</span>
            </div>
            <p className="countdown-card__label">{event.label}</p>
            <div className="countdown-card__timer">
                {cd.days > 0 && (
                    <div className="countdown-unit">
                        <span className="countdown-unit__num">{pad(cd.days)}</span>
                        <span className="countdown-unit__label">Days</span>
                    </div>
                )}
                <div className="countdown-unit">
                    <span className="countdown-unit__num">{pad(cd.hours)}</span>
                    <span className="countdown-unit__label">Hours</span>
                </div>
                <div className="countdown-sep">:</div>
                <div className="countdown-unit">
                    <span className="countdown-unit__num">{pad(cd.mins)}</span>
                    <span className="countdown-unit__label">Mins</span>
                </div>
                <div className="countdown-sep">:</div>
                <div className="countdown-unit">
                    <span className={`countdown-unit__num ${isUrgent ? "tick" : ""}`}>
                        {pad(cd.secs)}
                    </span>
                    <span className="countdown-unit__label">Secs</span>
                </div>
            </div>
            <p className="countdown-card__location">{event.location}</p>
        </div>
    );
}

// ─── Agenda Item ───────────────────────────────────────────────────────────────
function AgendaItem({ event, now }) {
    const [h, min] = event.time.split(":").map(Number);
    const eventDate = new Date(event.date);
    eventDate.setHours(h, min, 0, 0);
    const isPast    = eventDate < now;
    const isToday   = event.date === `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;

    const tagMap = {
        exam:       { cls: "agenda-tag--exam",       label: "EXAM"       },
        assignment: { cls: "agenda-tag--assignment",  label: "ASSIGNMENT" },
        meeting:    { cls: "agenda-tag--meeting",      label: "MEETING"    },
    };
    const tag = tagMap[event.type];

    return (
        <div className={`agenda-card ${isPast ? "agenda-card--past" : ""} ${isToday ? "agenda-card--today" : ""}`}>
            <div className="agenda-card__header">
                <span className={`agenda-tag ${tag.cls}`}>{tag.label}</span>
                <span className="agenda-card__time">
                    <Clock size={11} />
                    {event.time}
                </span>
            </div>
            <p className="agenda-card__title">{event.label}</p>
            <p className="agenda-card__sub">{event.location}</p>
            {isPast && <span className="agenda-badge--done">✓ Passed</span>}
        </div>
    );
}

// ─── Calendar Page ─────────────────────────────────────────────────────────────
export default function CalendarPage() {
    const [now, setNow] = useState(new Date());
    const [current, setCurrent] = useState({
        year: now.getFullYear(),
        month: now.getMonth(),
    });

    // ── Realtime tick (setiap detik) ──────────────────────────────────────────
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { year, month } = current;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay    = getFirstDayOfMonth(year, month);
    const daysInPrev  = getDaysInMonth(year, month - 1);

    // Build grid cells (6 rows × 7 cols = 42)
    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ day: daysInPrev - i, currentMonth: false, prevMonth: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, currentMonth: true });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
        cells.push({ day: d, currentMonth: false, nextMonth: true });
    }

    const prevMonth = () =>
        setCurrent(c => ({
            year: c.month === 0 ? c.year - 1 : c.year,
            month: c.month === 0 ? 11 : c.month - 1,
        }));

    const nextMonth = () =>
        setCurrent(c => ({
            year: c.month === 11 ? c.year + 1 : c.year,
            month: c.month === 11 ? 0 : c.month + 1,
        }));

    const goToday = () =>
        setCurrent({ year: now.getFullYear(), month: now.getMonth() });

    // Map events to grid
    const eventMap = {};
    EVENTS.forEach(ev => {
        const d = parseInt(ev.date.split("-")[2]);
        const m = parseInt(ev.date.split("-")[1]) - 1;
        const y = parseInt(ev.date.split("-")[0]);
        if (y === year && m === month) {
            if (!eventMap[d]) eventMap[d] = [];
            eventMap[d].push(ev);
        }
    });

    // Stats
    const exams     = EVENTS.filter(e => e.type === "exam"       && parseInt(e.date.split("-")[1])-1 === month).length;
    const deadlines = EVENTS.filter(e => e.type === "assignment" && parseInt(e.date.split("-")[1])-1 === month).length;

    // Next upcoming event (for countdown)
    const upcomingEvent = EVENTS
        .map(ev => {
            const [h, min] = ev.time.split(":").map(Number);
            const d = new Date(ev.date);
            d.setHours(h, min, 0, 0);
            return { ...ev, _ts: d };
        })
        .filter(ev => ev._ts > now)
        .sort((a, b) => a._ts - b._ts)[0];

    // Today string
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    const dayLabel = FULL_DAY_NAMES[now.getDay()].toUpperCase();
    const dateLabel = `${dayLabel}, ${now.getDate()} ${MONTH_NAMES[now.getMonth()].toUpperCase()}`;

    // Today's events (all events on today)
    const todayEvents = EVENTS.filter(e => e.date === todayStr);

    return (
        <div className="app-wrapper">
            <Sidebar />

            <main className="main-content cal-page">

                {/* ── HEADER ── */}
                <div className="cal-header">
                    <div>
                        <h1 className="cal-header__month">
                            {MONTH_NAMES[month]} {year}
                        </h1>
                        <p className="cal-header__sub">
                            {deadlines} deadline{deadlines !== 1 ? "s" : ""} and {exams} exam{exams !== 1 ? "s" : ""} this month
                        </p>
                    </div>
                    <div className="cal-header__controls">
                        <div className="cal-nav">
                            <button className="cal-nav__btn" onClick={prevMonth}>
                                <ChevronLeft size={16} />
                            </button>
                            <button className="cal-nav__today" onClick={goToday}>Today</button>
                            <button className="cal-nav__btn" onClick={nextMonth}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <button className="btn-add-event">
                            <Plus size={16} />
                            Add Event
                        </button>
                    </div>
                </div>

                {/* ── BODY ── */}
                <div className="cal-body">

                    {/* ── CALENDAR GRID ── */}
                    <div className="cal-grid-wrapper">
                        <div className="cal-day-headers">
                            {DAY_NAMES.map(d => (
                                <div key={d} className="cal-day-header">{d}</div>
                            ))}
                        </div>

                        <div className="cal-cells">
                            {cells.map((cell, idx) => {
                                const isToday =
                                    cell.currentMonth &&
                                    cell.day === now.getDate() &&
                                    month === now.getMonth() &&
                                    year === now.getFullYear();

                                return (
                                    <div
                                        key={idx}
                                        className={[
                                            "cal-cell",
                                            !cell.currentMonth ? "cal-cell--other" : "",
                                            isToday ? "cal-cell--today" : "",
                                        ].join(" ")}
                                    >
                                        <span className={`cal-cell__num ${isToday ? "cal-cell__num--today" : ""}`}>
                                            {cell.day}
                                        </span>

                                        {/* Live time badge inside today cell */}
                                        {isToday && (
                                            <span className="cal-cell__live-time">
                                                {pad(now.getHours() % 12 || 12)}:{pad(now.getMinutes())}
                                                <span className="cal-cell__live-dot" />
                                            </span>
                                        )}

                                        {cell.currentMonth && eventMap[cell.day] && (
                                            <div className="cal-cell__events">
                                                {eventMap[cell.day].map(ev => (
                                                    <EventPill key={ev.id} event={ev} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── AGENDA PANEL ── */}
                    <div className="agenda-panel">

                        {/* Live Clock */}
                        <LiveClock now={now} />

                        <h2 className="agenda-panel__title">Today's Agenda</h2>
                        <p className="agenda-panel__date">{dateLabel}</p>

                        {/* Countdown to next event */}
                        {upcomingEvent && (
                            <CountdownCard event={upcomingEvent} now={now} />
                        )}

                        {/* Today's events list */}
                        <div className="agenda-list">
                            {todayEvents.length > 0 ? (
                                todayEvents.map(ev => (
                                    <AgendaItem key={ev.id} event={ev} now={now} />
                                ))
                            ) : (
                                /* Show upcoming month events */
                                EVENTS.slice(0, 3).map(ev => (
                                    <AgendaItem key={ev.id} event={ev} now={now} />
                                ))
                            )}
                        </div>

                        <button className="btn-schedule">
                            <CalendarCheck2 size={16} />
                            View Full Schedule
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}