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

        $tasks = Task::orderBy('created_at', 'desc')->get();
        $submissions = Submission::where('user_id', $user->id)->get()->keyBy('task_id');

        $result = $tasks->map(function ($task) use ($submissions) {
            $sub = $submissions->get($task->id_task);
            return [
                'task' => $task,
                'submission' => $sub,
                'status' => $sub ? $sub->status : 'pending',
            ];
        });

        return response()->json($result);
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
        $path = $request->file('file')->store('submissions', 'public');

        // Cek apakah sudah melewati deadline
        $deadlineDateTime = $task->deadline->format('Y-m-d') . ' ' . $task->jam;
        $isLate = now()->gt($deadlineDateTime);

        $submission = Submission::updateOrCreate(
            ['task_id' => $id, 'user_id' => $user->id],
            [
                'file' => $path,
                'status' => $isLate ? 'late' : 'submitted',
                'submitted_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Tugas berhasil dikumpulkan',
            'submission' => $submission->load('task'),
        ]);
    }
}
