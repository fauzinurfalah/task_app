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
    private function autoCloseExpiredTasks()
    {
        // 1. Auto close active tasks if deadline passed
        $activeTasks = Task::where('status', 'active')->get();
        foreach ($activeTasks as $task) {
            $deadlineDateTime = $task->deadline->format('Y-m-d') . ' ' . $task->jam;
            if (now()->gt($deadlineDateTime)) {
                $task->status = 'closed';
                $task->save();

                // 1a. Semua submission yang masih pending → ubah ke late
                //     (mahasiswa tidak mengumpulkan sampai deadline lewat)
                \App\Models\Submission::where('task_id', $task->id_task)
                    ->where('status', 'pending')
                    ->update(['status' => 'late']);
            }
        }

        // 2. Tugas yang sudah closed tapi masih ada pending → ubah pending ke late
        \App\Models\Submission::whereHas('task', fn($q) => $q->whereIn('status', ['closed', 'graded']))
            ->where('status', 'pending')
            ->update(['status' => 'late']);

        // 3. Auto grade tasks if all submissions are graded
        $closedTasks = Task::where('status', 'closed')->get();
        foreach ($closedTasks as $task) {
            $submittedCount = \App\Models\Submission::where('task_id', $task->id_task)
                ->whereIn('status', ['submitted', 'late'])
                ->count();
            
            if ($submittedCount > 0) {
                $gradedCount = \App\Models\Submission::where('task_id', $task->id_task)
                    ->whereNotNull('grade')
                    ->count();
                
                if ($gradedCount === $submittedCount) {
                    $task->status = 'graded';
                    $task->save();
                }
            }
        }
    }

    /**
     * Dashboard stats untuk dosen
     */
    public function dashboardStats(Request $request)
    {
        $this->autoCloseExpiredTasks();

        $totalMahasiswa = User::where('role', 'mahasiswa')->count();
        $tugasAktif     = Task::where('status', 'active')->count();
        $avgGrade       = Submission::whereNotNull('grade')->avg('grade') ?? 0;

        // Tugas dianggap "sudah dinilai" jika:
        // - Ada minimal 1 submission yang masuk (submitted/late)
        // - Semua submission tersebut sudah diberi nilai (grade not null)
        $semuaTugas = Task::withCount([
            'submissions as submitted_count' => fn($q) => $q->whereIn('status', ['submitted', 'late']),
            'submissions as graded_count'    => fn($q) => $q->whereIn('status', ['submitted', 'late'])->whereNotNull('grade'),
        ])->get();

        $tugasDinilai = $semuaTugas->filter(
            fn($t) => $t->submitted_count > 0 && $t->submitted_count === $t->graded_count
        )->count();

        return response()->json([
            'total_mahasiswa' => $totalMahasiswa,
            'tugas_aktif'     => $tugasAktif,
            'sudah_dinilai'   => $tugasDinilai,
            'rata_rata_nilai' => round($avgGrade, 1),
        ]);
    }

    /**
     * Notifikasi dosen: pengumpulan terbaru yang belum dinilai
     */
    public function notifications(Request $request)
    {
        $this->autoCloseExpiredTasks();

        // Recent submissions (last 20) as notifications
        $submissions = Submission::with(['user', 'task'])
            ->whereIn('status', ['submitted', 'late'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        $notifications = $submissions->map(function ($s) {
            $isLate = $s->status === 'late';
            $unread = $s->grade === null;

            return [
                'id'            => $s->id,
                'type'          => $isLate ? 'late' : 'submitted',
                'title'         => ($s->user?->name) . ($isLate ? ' mengumpulkan terlambat' : ' mengumpulkan tugas'),
                'body'          => $s->task?->nama_tugas ?? 'Tugas tidak dikenal',
                'time'          => $s->created_at->diffForHumans(),
                'unread'        => $unread,
                'task_id'       => $s->task_id,
                'submission_id' => $s->id,
            ];
        });

        return response()->json($notifications);
    }

    /**
     * List semua tugas (dengan statistik pengumpulan)
     */
    public function tasks(Request $request)
    {
        $this->autoCloseExpiredTasks();

        $totalMahasiswa = User::where('role', 'mahasiswa')->count();

        $tasks = Task::withCount([
                'submissions',
                'submissions as submitted_count' => function ($q) {
                    $q->whereIn('status', ['submitted', 'late']);
                },
                'submissions as graded_count' => function ($q) {
                    $q->whereIn('status', ['submitted', 'late'])->whereNotNull('grade');
                },
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        $tasks->each(function ($task) use ($totalMahasiswa) {
            $task->total_students = $totalMahasiswa;
            // Flag: tugas dianggap "dinilai" jika ada submission dan semua sudah dinilai
            $task->fully_graded = $task->submitted_count > 0
                && $task->submitted_count === $task->graded_count;
        });

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
            $file = $request->file('attachment');
            $filename = time() . '_' . $file->getClientOriginalName();
            $data['attachment'] = $file->storeAs('tasks', $filename, 'public');
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
        $this->autoCloseExpiredTasks();

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

        $task->total_students = User::where('role', 'mahasiswa')->count();

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
            $file = $request->file('attachment');
            $filename = time() . '_' . $file->getClientOriginalName();
            $data['attachment'] = $file->storeAs('tasks', $filename, 'public');
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

        if ($submission->grade !== null) {
            return response()->json([
                'message' => 'Tugas sudah dinilai dan tidak dapat diubah.'
            ], 403);
        }

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
