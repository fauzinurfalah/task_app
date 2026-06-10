<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\MataKuliah;
use App\Models\Submission;
use App\Models\User;

class DosenController extends Controller
{
    /**
     * Dashboard stats untuk dosen
     */
    public function dashboardStats(Request $request)
    {
        $totalMahasiswa = User::where('role', 'mahasiswa')->count();
        $tugasAktif = Task::where('status', 'active')->count();
        $totalSubmissions = Submission::whereNotNull('grade')->count();
        $avgGrade = Submission::whereNotNull('grade')->avg('grade') ?? 0;

        return response()->json([
            'total_mahasiswa' => $totalMahasiswa,
            'tugas_aktif' => $tugasAktif,
            'sudah_dinilai' => $totalSubmissions,
            'rata_rata_nilai' => round($avgGrade, 1),
        ]);
    }

    /**
     * List semua tugas (dengan statistik pengumpulan)
     */
    public function tasks(Request $request)
    {
        $tasks = Task::withCount([
                'submissions',
                'submissions as submitted_count' => function ($q) {
                    $q->whereIn('status', ['submitted', 'late']);
                },
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tasks);
    }

    /**
     * Buat tugas baru
     */
    public function storeTask(Request $request)
    {
        $request->validate([
            'nama_tugas' => 'required|string',
            'nama_matkul' => 'required|string',
            'deadline' => 'required|date',
            'jam' => 'nullable|string',
            'deskripsi' => 'nullable|string',
            'tags' => 'nullable|string',
            'tipe' => 'nullable|in:individu,kelompok',
            'prioritas' => 'nullable|in:rendah,sedang,tinggi',
            'points' => 'nullable|integer',
            'attachment' => 'nullable|file|max:10240',
        ]);

        $data = $request->except('attachment');
        
        $data['kode_tugas'] = strtoupper(\Illuminate\Support\Str::random(6));

        if ($request->hasFile('attachment')) {
            $data['attachment'] = $request->file('attachment')->store('tasks', 'public');
        }

        $task = Task::create($data);

        return response()->json([
            'message' => 'Tugas berhasil dibuat',
            'task' => $task,
        ], 201);
    }

    /**
     * Detail tugas
     */
    public function showTask($id)
    {
        $task = Task::with(['submissions.user'])
            ->withCount([
                'submissions',
                'submissions as submitted_count' => function ($q) {
                    $q->whereIn('status', ['submitted', 'late']);
                },
                'submissions as graded_count' => function ($q) {
                    $q->whereNotNull('grade');
                },
            ])
            ->findOrFail($id);

        return response()->json($task);
    }

    /**
     * Update tugas
     */
    public function updateTask(Request $request, $id)
    {
        \Illuminate\Support\Facades\Log::info('updateTask called', ['all' => $request->all(), 'files' => $request->allFiles()]);
        $task = Task::findOrFail($id);

        $request->validate([
            'nama_tugas' => 'nullable|string',
            'nama_matkul' => 'nullable|string',
            'deadline' => 'nullable|date',
            'jam' => 'nullable|string',
            'deskripsi' => 'nullable|string',
            'tags' => 'nullable|string',
            'tipe' => 'nullable|in:individu,kelompok',
            'prioritas' => 'nullable|in:rendah,sedang,tinggi',
            'status' => 'nullable|in:active,closed,graded',
            'points' => 'nullable|integer',
            'attachment' => 'nullable|file|max:10240',
        ]);

        $data = $request->except('attachment');

        if ($request->hasFile('attachment')) {
            $data['attachment'] = $request->file('attachment')->store('tasks', 'public');
        }

        $task->update($data);

        return response()->json([
            'message' => 'Tugas berhasil diupdate',
            'task' => $task,
        ]);
    }

    /**
     * Hapus tugas
     */
    public function deleteTask($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json([
            'message' => 'Tugas berhasil dihapus',
        ]);
    }

    /**
     * List pengumpulan (submissions)
     */
    public function submissions(Request $request)
    {
        $query = Submission::with(['task', 'user']);

        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $submissions = $query->orderBy('created_at', 'desc')->get();

        return response()->json($submissions);
    }

    /**
     * Beri nilai & feedback pada pengumpulan
     */
    public function gradeSubmission(Request $request, $id)
    {
        $request->validate([
            'grade' => 'required|integer|min:0|max:100',
            'feedback' => 'nullable|string',
        ]);

        $submission = Submission::findOrFail($id);
        $submission->update([
            'grade' => $request->grade,
            'feedback' => $request->feedback,
        ]);

        return response()->json([
            'message' => 'Nilai berhasil disimpan',
            'submission' => $submission->load(['task', 'user']),
        ]);
    }

    /**
     * List data mahasiswa
     */
    public function students(Request $request)
    {
        $students = User::where('role', 'mahasiswa')
            ->with('courses')
            ->withCount([
                'submissions as submitted_count' => function ($q) {
                    $q->whereIn('status', ['submitted', 'late']);
                },
                'submissions as pending_count' => function ($q) {
                    $q->where('status', 'pending');
                },
            ])
            ->withAvg('submissions', 'grade')
            ->get();

        return response()->json($students);
    }

    /**
     * List mata kuliah
     */
    public function mataKuliah()
    {
        $mataKuliah = MataKuliah::withCount('tasks')->get();
        return response()->json($mataKuliah);
    }

    /**
     * Buat mata kuliah baru
     */
    public function storeMataKuliah(Request $request)
    {
        $request->validate([
            'nama_matkul' => 'required|string',
            'kode_mk' => 'required|string|unique:mata_kuliahs',
            'nama_dosen' => 'required|string',
        ]);

        $mk = MataKuliah::create($request->all());

        return response()->json([
            'message' => 'Mata kuliah berhasil dibuat',
            'mata_kuliah' => $mk,
        ], 201);
    }
}
