<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\MataKuliah;
use App\Models\Task;
use App\Models\Submission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Dosen ────────────────────────────────────────────────────────────
        $dosen = User::create([
            'name' => 'Dr. Budi Santoso',
            'email' => 'dosen@mail.com',
            'password' => Hash::make('password'),
            'nim' => null,
            'role' => 'dosen',
        ]);

        // ─── Mahasiswa ────────────────────────────────────────────────────────
        $mahasiswaData = [
            ['name' => 'Andi Saputra',    'email' => 'andi@mail.com',    'nim' => '2021001'],
            ['name' => 'Sari Dewi',       'email' => 'sari@mail.com',    'nim' => '2021015'],
            ['name' => 'Rizky Maulana',   'email' => 'rizky@mail.com',   'nim' => '2021032'],
            ['name' => 'Dewi Lestari',    'email' => 'dewi@mail.com',    'nim' => '2021007'],
            ['name' => 'Budi Pratama',    'email' => 'budi@mail.com',    'nim' => '2021044'],
            ['name' => 'Rina Suryani',    'email' => 'rina@mail.com',    'nim' => '2021020'],
            ['name' => 'Hendra Wijaya',   'email' => 'hendra@mail.com',  'nim' => '2021055'],
            ['name' => 'Laila Fitriani',  'email' => 'laila@mail.com',   'nim' => '2021011'],
            ['name' => 'Yoga Pratama',    'email' => 'yoga@mail.com',    'nim' => '2021060'],
            ['name' => 'Mega Wulandari',  'email' => 'mega@mail.com',    'nim' => '2021033'],
        ];

        $mahasiswas = [];
        foreach ($mahasiswaData as $m) {
            $mahasiswas[] = User::create([
                'name' => $m['name'],
                'email' => $m['email'],
                'password' => Hash::make('password'),
                'nim' => $m['nim'],
                'role' => 'mahasiswa',
            ]);
        }

        // ─── Mata Kuliah ──────────────────────────────────────────────────────
        $mk1 = MataKuliah::create([
            'nama_matkul' => 'Algoritma & Pemrograman',
            'kode_mk' => 'IF201',
            'nama_dosen' => 'Dr. Budi Santoso',
        ]);

        $mk2 = MataKuliah::create([
            'nama_matkul' => 'Jaringan Komputer',
            'kode_mk' => 'IF302',
            'nama_dosen' => 'Dr. Budi Santoso',
        ]);

        $mk3 = MataKuliah::create([
            'nama_matkul' => 'Kecerdasan Buatan',
            'kode_mk' => 'IF401',
            'nama_dosen' => 'Dr. Budi Santoso',
        ]);

        // ─── Assign mahasiswa ke mata kuliah (course_user) ────────────────────
        // Semua mahasiswa ikut Algoritma
        foreach ($mahasiswas as $m) {
            DB::table('course_user')->insert([
                'user_id' => $m->id,
                'id_matkul' => $mk1->id_matkul,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 7 mahasiswa pertama ikut Jaringan
        for ($i = 0; $i < 7; $i++) {
            DB::table('course_user')->insert([
                'user_id' => $mahasiswas[$i]->id,
                'id_matkul' => $mk2->id_matkul,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 5 mahasiswa terakhir ikut AI
        for ($i = 5; $i < 10; $i++) {
            DB::table('course_user')->insert([
                'user_id' => $mahasiswas[$i]->id,
                'id_matkul' => $mk3->id_matkul,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ─── Tasks ────────────────────────────────────────────────────────────
        $task1 = Task::create([
            'nama_tugas' => 'Implementasi Algoritma Sorting',
            'id_matkul' => $mk1->id_matkul,
            'deskripsi' => 'Implementasikan 3 algoritma sorting (Bubble, Merge, Quick) menggunakan bahasa C++. Program harus bisa menerima input array dari user dan menampilkan hasil sorting beserta perbandingan waktu eksekusi.',
            'tags' => 'sorting,c++,algoritma',
            'deadline' => '2026-06-15',
            'jam' => '23:59',
            'tipe' => 'individu',
            'prioritas' => 'tinggi',
            'status' => 'active',
            'points' => 100,
            'rubric' => [
                ['item' => 'Implementasi Bubble Sort', 'poin' => 25],
                ['item' => 'Implementasi Merge Sort', 'poin' => 35],
                ['item' => 'Implementasi Quick Sort', 'poin' => 30],
                ['item' => 'Dokumentasi & Kerapian', 'poin' => 10],
            ],
            'attachments' => ['soal_sorting.pdf', 'template_kode.zip'],
        ]);

        $task2 = Task::create([
            'nama_tugas' => 'Laporan Praktikum Jaringan',
            'id_matkul' => $mk2->id_matkul,
            'deskripsi' => 'Buat laporan praktikum konfigurasi routing statis dan dinamis (OSPF, RIP).',
            'tags' => 'jaringan,laporan,routing',
            'deadline' => '2026-06-20',
            'jam' => '12:00',
            'tipe' => 'individu',
            'prioritas' => 'sedang',
            'status' => 'active',
            'points' => 100,
            'rubric' => [
                ['item' => 'Konfigurasi Routing Statis', 'poin' => 30],
                ['item' => 'Konfigurasi OSPF', 'poin' => 35],
                ['item' => 'Konfigurasi RIP', 'poin' => 25],
                ['item' => 'Dokumentasi', 'poin' => 10],
            ],
            'attachments' => ['panduan_praktikum.pdf'],
        ]);

        $task3 = Task::create([
            'nama_tugas' => 'Proyek Akhir - Machine Learning',
            'id_matkul' => $mk3->id_matkul,
            'deskripsi' => 'Bangun model klasifikasi menggunakan dataset pilihan, minimal akurasi 80%.',
            'tags' => 'machine-learning,proyek,python',
            'deadline' => '2026-06-25',
            'jam' => '23:59',
            'tipe' => 'kelompok',
            'prioritas' => 'tinggi',
            'status' => 'active',
            'points' => 100,
            'rubric' => [
                ['item' => 'Preprocessing Data', 'poin' => 20],
                ['item' => 'Model Training', 'poin' => 30],
                ['item' => 'Evaluasi Model', 'poin' => 30],
                ['item' => 'Dokumentasi & Presentasi', 'poin' => 20],
            ],
            'attachments' => [],
        ]);

        // ─── Submissions ──────────────────────────────────────────────────────
        // Task 1 - beberapa mahasiswa sudah mengumpulkan
        Submission::create(['task_id' => $task1->id_task, 'user_id' => $mahasiswas[0]->id, 'file' => 'andi_sorting.zip',  'status' => 'submitted', 'grade' => null,  'feedback' => null, 'submitted_at' => now()->subHours(2)]);
        Submission::create(['task_id' => $task1->id_task, 'user_id' => $mahasiswas[1]->id, 'file' => 'sari_sorting.zip',  'status' => 'late',      'grade' => null,  'feedback' => null, 'submitted_at' => now()->subHours(1)]);
        Submission::create(['task_id' => $task1->id_task, 'user_id' => $mahasiswas[2]->id, 'file' => 'rizky_sorting.zip', 'status' => 'submitted', 'grade' => 88,    'feedback' => 'Kerjaan bagus, merge sort sudah optimal.', 'submitted_at' => now()->subHours(5)]);
        Submission::create(['task_id' => $task1->id_task, 'user_id' => $mahasiswas[3]->id, 'file' => null,                'status' => 'pending',   'grade' => null,  'feedback' => null, 'submitted_at' => null]);
        Submission::create(['task_id' => $task1->id_task, 'user_id' => $mahasiswas[4]->id, 'file' => 'budi_sorting.zip',  'status' => 'submitted', 'grade' => 92,    'feedback' => 'Excellent! Semua algoritma benar dan terdokumentasi.', 'submitted_at' => now()->subHours(8)]);
        Submission::create(['task_id' => $task1->id_task, 'user_id' => $mahasiswas[5]->id, 'file' => 'rina_sorting.zip',  'status' => 'submitted', 'grade' => 75,    'feedback' => 'Quick sort ada bug di edge case.', 'submitted_at' => now()->subHours(4)]);
        Submission::create(['task_id' => $task1->id_task, 'user_id' => $mahasiswas[6]->id, 'file' => null,                'status' => 'pending',   'grade' => null,  'feedback' => null, 'submitted_at' => null]);
        Submission::create(['task_id' => $task1->id_task, 'user_id' => $mahasiswas[7]->id, 'file' => 'laila_sorting.zip', 'status' => 'late',      'grade' => null,  'feedback' => null, 'submitted_at' => now()->subHours(3)]);

        // Task 2 - beberapa mahasiswa
        Submission::create(['task_id' => $task2->id_task, 'user_id' => $mahasiswas[0]->id, 'file' => 'andi_jaringan.pdf', 'status' => 'submitted', 'grade' => null, 'feedback' => null, 'submitted_at' => now()->subDay()]);
        Submission::create(['task_id' => $task2->id_task, 'user_id' => $mahasiswas[1]->id, 'file' => null,                'status' => 'pending',   'grade' => null, 'feedback' => null, 'submitted_at' => null]);

        // Task 3 - beberapa mahasiswa
        Submission::create(['task_id' => $task3->id_task, 'user_id' => $mahasiswas[5]->id, 'file' => 'rina_ml.zip',  'status' => 'submitted', 'grade' => null, 'feedback' => null, 'submitted_at' => now()->subHours(6)]);
        Submission::create(['task_id' => $task3->id_task, 'user_id' => $mahasiswas[8]->id, 'file' => null,            'status' => 'pending',   'grade' => null, 'feedback' => null, 'submitted_at' => null]);
    }
}
