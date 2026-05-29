import Sidebar from "../../components/Sidebar";

export default function MahasiswaTasks() {
    return (
        <div className="app-wrapper">
            <Sidebar role="mahasiswa" />
            <main className="main-content">
                <h1 className="topbar__title">Tugas Saya</h1>
                <p className="topbar__subtitle">Daftar semua tugas yang diberikan dosen.</p>
            </main>
        </div>
    );
}
