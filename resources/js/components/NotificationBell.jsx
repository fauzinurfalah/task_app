import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle2, Clock, ChevronRight, X } from "lucide-react";
import axiosClient from "../axiosClient";

export default function NotificationBell() {
    const [open, setOpen]                 = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]           = useState(false);
    const dropdownRef                     = useRef(null);
    const navigate                        = useNavigate();

    const unreadCount = notifications.filter(n => n.unread).length;

    // Fetch notifications
    const fetchNotifications = () => {
        setLoading(true);
        axiosClient.get('/dosen/notifications')
            .then(({ data }) => setNotifications(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    // Auto-poll every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleNotifClick = (notif) => {
        navigate(`/dosen/grading?submission=${notif.submission_id}`);
        setOpen(false);
    };

    return (
        <div ref={dropdownRef} style={{ position: "relative" }}>
            {/* Bell Button */}
            <button
                className="icon-btn"
                onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
                style={{ position: "relative" }}
            >
                <Bell size={18} color="#4b5563" />
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute", top: -3, right: -3,
                        width: 18, height: 18, borderRadius: "50%",
                        background: "#ef4444", color: "white",
                        fontSize: 10, fontWeight: 900,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "2px solid white",
                        animation: "notif-pulse 2s infinite",
                    }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 10px)", right: 0,
                    width: 360, background: "white", borderRadius: 20,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                    border: "1px solid #f1f5f9", zIndex: 1000,
                    animation: "dropdown-in 0.15s ease",
                }}>
                    {/* Header */}
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "16px 20px", borderBottom: "1px solid #f1f5f9",
                    }}>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                                Notifikasi
                            </h3>
                            {unreadCount > 0 && (
                                <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
                                    {unreadCount} belum dinilai
                                </p>
                            )}
                        </div>
                        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                            <X size={16} color="#94a3b8" />
                        </button>
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: 380, overflowY: "auto" }}>
                        {loading ? (
                            <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                                Memuat notifikasi...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: "40px 20px", textAlign: "center" }}>
                                <CheckCircle2 size={36} color="#d1d5db" style={{ marginBottom: 12 }} />
                                <p style={{ fontSize: 14, fontWeight: 700, color: "#374151", margin: "0 0 4px" }}>Semua beres!</p>
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Tidak ada pengumpulan yang perlu dinilai.</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotifClick(n)}
                                    style={{
                                        display: "flex", alignItems: "flex-start", gap: 12,
                                        padding: "14px 20px", cursor: "pointer",
                                        borderBottom: "1px solid #f8fafc",
                                        background: n.unread ? "#fafbff" : "white",
                                        transition: "background 0.15s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                                    onMouseLeave={e => e.currentTarget.style.background = n.unread ? "#fafbff" : "white"}
                                >
                                    {/* Icon */}
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        background: n.type === "late" ? "#fee2e2" : "#eef2ff",
                                    }}>
                                        {n.type === "late"
                                            ? <Clock size={16} color="#dc2626" />
                                            : <CheckCircle2 size={16} color="#4f46e5" />
                                        }
                                    </div>

                                    {/* Text */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>
                                            {n.title}
                                        </p>
                                        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {n.body}
                                        </p>
                                        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{n.time}</p>
                                    </div>

                                    {/* Unread dot + arrow */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                        {n.unread && (
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4f46e5" }} />
                                        )}
                                        <ChevronRight size={14} color="#d1d5db" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
                            <button
                                onClick={() => { navigate('/dosen/submissions'); setOpen(false); }}
                                style={{
                                    background: "none", border: "none", color: "#4f46e5",
                                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 4, margin: "0 auto",
                                }}
                            >
                                Lihat Semua Pengumpulan <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes notif-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                }
                @keyframes dropdown-in {
                    from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
