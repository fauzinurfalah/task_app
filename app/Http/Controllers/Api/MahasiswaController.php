<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\Submission;

class MahasiswaController extends Controller
{
    /**
     * Dashboard stats untuk mahasiswa
     */
    public function dashboardStats(Request $request)
    {
        $user = $request->user();

        $totalTugas = Submission::where('user_id', $user->id)->count();
        $sudahDikumpulkan = Submission::where('user_id', $user->id)
            ->whereIn('status', ['submitted', 'late'])->count();
        $belum = Submission::where('user_id', $user->id)
            ->where('status', 'pending')->count();
        $avgGrade = Submission::where('user_id', $user->id)
            ->whereNotNull('grade')->avg('grade') ?? 0;

        $progress = $totalTugas > 0 ? round(($sudahDikumpulkan / $totalTugas) * 100) : 0;

        return response()->json([
            'total_tugas'       => $totalTugas,
            'tugas_selesai'     => $sudahDikumpulkan,
            'tugas_aktif'       => $belum,
            'sudah_dikumpulkan' => $sudahDikumpulkan,
            'belum_dikumpulkan' => $belum,
            'rata_nilai'        => round($avgGrade, 1),
            'rata_rata_nilai'   => round($avgGrade, 1),
            'progress'          => $progress,
        ]);
    }

    /**
     * List tugas yang harus dikerjakan mahasiswa
     */
    public function tasks(Request $request)
    {
        $user = $request->user();

        // Ambil semua submission user ini
        $submissions = Submission::where('user_id', $user->id)->get()->keyBy('task_id');
        
        // Ambil task yang sudah di-join oleh user (termasuk tugas mandiri yang otomatis ter-join)
        $taskIds = $submissions->keys();
        $tasks = Task::whereIn('id_task', $taskIds)->orderBy('created_at', 'desc')->get();

        $result = $tasks->map(function ($task) use ($submissions, $user) {
            $sub = $submissions->get($task->id_task);
            $taskData = $task->toArray();
            // Tandai apakah ini tugas mandiri milik mahasiswa
            $taskData['is_mandiri'] = $task->user_id === $user->id;
            return [
                'task' => $taskData,
                'submission' => $sub,
                'status' => $sub ? $sub->status : 'pending',
            ];
        });

        return response()->json($result->values());
    }

    /**
     * Detail tugas & status pengumpulan
     */
    public function showTask(Request $request, $id)
    {
        $user = $request->user();

        $task = Task::findOrFail($id);

        $submission = Submission::where('task_id', $id)
            ->where('user_id', $user->id)
            ->first();

        return response()->json([
            'task' => $task,
            'submission' => $submission,
        ]);
    }

    /**
     * Mengunggah file tugas (submit)
     */
    public function submitTask(Request $request, $id)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $user = $request->user();
        $task = Task::findOrFail($id);

        // Simpan file
        $file = $request->file('file');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('submissions', $filename, 'public');

        // Cek apakah sudah melewati deadline
        $deadlineDateTime = $task->deadline->format('Y-m-d') . ' ' . $task->jam;
        $isLate = now()->gt($deadlineDateTime);

        if ($isLate) {
            return response()->json([
                'message' => 'Gagal mengumpulkan: Tugas ini sudah melewati batas waktu (deadline).'
            ], 403);
        }

        $submission = Submission::updateOrCreate(
            ['task_id' => $id, 'user_id' => $user->id],
            [
                'file' => $path,
                'status' => 'submitted',
                'submitted_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Tugas berhasil dikumpulkan',
            'submission' => $submission->load('task'),
        ]);
    }

    /**
     * Dapatkan tugas berdasarkan kode tugas (QR Code)
     */
    public function getTaskByCode(Request $request)
    {
        $request->validate(['kode_tugas' => 'required|string']);
        $user = $request->user();
        
        $task = Task::where('kode_tugas', $request->kode_tugas)->first();

        if (!$task) {
            return response()->json(['message' => 'Kode Tugas tidak ditemukan'], 404);
        }

        // Daftarkan mahasiswa ke tugas ini jika belum ada
        Submission::firstOrCreate(
            ['task_id' => $task->id_task, 'user_id' => $user->id],
            ['status' => 'pending']
        );

        return response()->json(['task' => $task]);
    }

    /**
     * Buat tugas mandiri (mahasiswa)
     */
    public function storeTask(Request $request)
    {
        $request->validate([
            'nama_tugas'  => 'required|string',
            'nama_matkul' => 'required|string',
            'deadline'    => 'required|date',
            'jam'         => 'nullable|string',
            'deskripsi'   => 'nullable|string',
            'tags'        => 'nullable|string',
            'tipe'        => 'nullable|in:individu,kelompok',
            'prioritas'   => 'nullable|in:rendah,sedang,tinggi',
        ]);

        $user = $request->user();

        $task = Task::create([
            'user_id'     => $user->id,
            'nama_tugas'  => $request->nama_tugas,
            'nama_matkul' => $request->nama_matkul,
            'deskripsi'   => $request->deskripsi ?? '',
            'tags'        => $request->tags ?? '',
            'deadline'    => $request->deadline,
            'jam'         => $request->jam ?? '23:59',
            'tipe'        => $request->tipe ?? 'individu',
            'prioritas'   => $request->prioritas ?? 'sedang',
            'status'      => 'active',
        ]);

        // Otomatis buat submission (assign ke diri sendiri)
        Submission::create([
            'task_id' => $task->id_task,
            'user_id' => $user->id,
            'status'  => 'pending',
        ]);

        return response()->json([
            'message' => 'Tugas mandiri berhasil dibuat',
            'task'    => $task,
        ], 201);
    }

    /**
     * Update tugas mandiri (hanya pemilik)
     */
    public function updateTask(Request $request, $id)
    {
        $user = $request->user();
        $task = Task::where('id_task', $id)->where('user_id', $user->id)->first();

        if (!$task) {
            return response()->json(['message' => 'Tugas tidak ditemukan atau bukan milik Anda.'], 404);
        }

        $request->validate([
            'nama_tugas'  => 'nullable|string',
            'nama_matkul' => 'nullable|string',
            'deadline'    => 'nullable|date',
            'jam'         => 'nullable|string',
            'deskripsi'   => 'nullable|string',
            'tags'        => 'nullable|string',
            'tipe'        => 'nullable|in:individu,kelompok',
            'prioritas'   => 'nullable|in:rendah,sedang,tinggi',
        ]);

        $task->update($request->only([
            'nama_tugas', 'nama_matkul', 'deadline', 'jam',
            'deskripsi', 'tags', 'tipe', 'prioritas',
        ]));

        return response()->json([
            'message' => 'Tugas berhasil diupdate',
            'task'    => $task,
        ]);
    }

    /**
     * Hapus tugas mandiri (hanya pemilik)
     */
    public function deleteTask(Request $request, $id)
    {
        $user = $request->user();
        $task = Task::where('id_task', $id)->where('user_id', $user->id)->first();

        if (!$task) {
            return response()->json(['message' => 'Tugas tidak ditemukan atau bukan milik Anda.'], 404);
        }

        $task->delete();

        return response()->json(['message' => 'Tugas mandiri berhasil dihapus']);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string'
        ]);

        $submission = Submission::where('task_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$submission) {
            return response()->json(['message' => 'Tugas belum di-join.'], 404);
        }

        $newStatus = $request->status;

        if (in_array($newStatus, ['completed', 'submitted'])) {
            if (!$submission->file) {
                return response()->json(['message' => 'Tugas tidak dapat ditandai selesai karena belum ada file yang diunggah.'], 403);
            }
            
            $newStatus = 'submitted';
            $task = \App\Models\Task::find($id);
            if ($task) {
                $deadlineDateTime = $task->deadline->format('Y-m-d') . ' ' . $task->jam;
                if (now()->gt($deadlineDateTime)) {
                    $newStatus = 'late';
                }
            }
        }

        $submission->status = $newStatus;
        $submission->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'submission' => $submission
        ]);
    }
}
