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
        
        // Ambil task yang HANYA sudah di-join oleh user
        $taskIds = $submissions->keys();
        $tasks = Task::whereIn('id_task', $taskIds)->orderBy('created_at', 'desc')->get();

        $result = $tasks->map(function ($task) use ($submissions) {
            $sub = $submissions->get($task->id_task);
            return [
                'task' => $task,
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
