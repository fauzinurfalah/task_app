import React from "react";
import { Wrench } from "lucide-react";
import Sidebar from "../../components/Sidebar";

export default function Settings() {
    return (
        <div className="app-wrapper">
            <Sidebar />
            <main className="main-content" style={{ background: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                    <Wrench size={40} color="#94a3b8" />
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginBottom: 12, letterSpacing: "-1px" }}>Under Construction</h1>
                <p style={{ fontSize: 16, color: "#64748b", maxWidth: 400, textAlign: "center", lineHeight: 1.6 }}>
                    Halaman pengaturan sedang dalam tahap pengembangan. Silakan kembali lagi nanti untuk melihat pembaruan fitur ini.
                </p>
            </main>
        </div>
    );
}
