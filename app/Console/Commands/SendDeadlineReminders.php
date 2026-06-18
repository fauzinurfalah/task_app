<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\Submission;
use App\Models\NotificationLog;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Carbon\Carbon;

#[Signature('notify:deadlines')]
#[Description('Send FCM notifications for tasks based on deadline proximity')]
class SendDeadlineReminders extends Command
{
    public function handle()
    {
        $now = Carbon::now();
        $this->info("Running deadline reminders at {$now->format('Y-m-d H:i:s')}");

        $tasks = Task::where('status', 'active')
            ->where('deadline', '>=', $now->format('Y-m-d'))
            ->get();

        if ($tasks->isEmpty()) {
            $this->info('No active tasks with upcoming deadlines.');
            return;
        }

        try {
            $factory = (new Factory)->withServiceAccount(base_path(env('FIREBASE_CREDENTIALS', 'firebase_credentials.json')));
            $messaging = $factory->createMessaging();
        } catch (\Exception $e) {
            $this->error('Firebase Setup Error: ' . $e->getMessage());
            return;
        }

        $count = 0;
        $currentHour = (int) $now->format('H');

        foreach ($tasks as $task) {
            $deadlineStr = is_string($task->deadline) ? $task->deadline : $task->deadline->format('Y-m-d');
            $deadlineDateTime = Carbon::parse($deadlineStr . ' ' . ($task->jam ?? '23:59:00'));
            $hoursUntilDeadline = $now->diffInMinutes($deadlineDateTime, false) / 60;

            if ($hoursUntilDeadline < 0) {
                continue; // Skip past deadlines
            }

            $daysUntilDeadline = $now->copy()->startOfDay()->diffInDays($deadlineDateTime->copy()->startOfDay(), false);

            $remindersToSend = [];

            // ── 1. H-14: 1× jam 8 malam ──
            if ($daysUntilDeadline === 14 && $currentHour === 20) {
                $remindersToSend[] = ['key' => '14d', 'label' => '2 minggu lagi'];
            }

            // ── 2. H-7: 1× jam 8 malam ──
            if ($daysUntilDeadline === 7 && $currentHour === 20) {
                $remindersToSend[] = ['key' => '7d', 'label' => '1 minggu lagi'];
            }

            // ── 3. H-3: 2× jam 8 pagi dan 8 malam ──
            if ($daysUntilDeadline === 3 && $currentHour === 8) {
                $remindersToSend[] = ['key' => '3d_08', 'label' => '3 hari lagi'];
            }
            if ($daysUntilDeadline === 3 && $currentHour === 20) {
                $remindersToSend[] = ['key' => '3d_20', 'label' => '3 hari lagi'];
            }

            // ── 4. H-2: 2× jam 8 pagi dan 8 malam ──
            if ($daysUntilDeadline === 2 && $currentHour === 8) {
                $remindersToSend[] = ['key' => '2d_08', 'label' => '2 hari lagi'];
            }
            if ($daysUntilDeadline === 2 && $currentHour === 20) {
                $remindersToSend[] = ['key' => '2d_20', 'label' => '2 hari lagi'];
            }

            // ── 5. H-1: 2× jam 8 pagi dan 8 malam ──
            if ($daysUntilDeadline === 1 && $currentHour === 8) {
                $remindersToSend[] = ['key' => '1d_08', 'label' => 'besok'];
            }
            if ($daysUntilDeadline === 1 && $currentHour === 20) {
                $remindersToSend[] = ['key' => '1d_20', 'label' => 'besok'];
            }

            // ── 6. HOUR-BASED: 12h, 3h, 1h (window ±30 menit) ──
            $hourTriggers = [
                ['hours' => 12, 'key' => '12h', 'label' => '12 jam lagi'],
                ['hours' => 3,  'key' => '3h',  'label' => '3 jam lagi'],
                ['hours' => 1,  'key' => '1h',  'label' => '1 jam lagi'],
            ];

            foreach ($hourTriggers as $trigger) {
                $lower = $trigger['hours'] - 0.5;
                $upper = $trigger['hours'] + 0.5;
                if ($hoursUntilDeadline >= $lower && $hoursUntilDeadline < $upper) {
                    $remindersToSend[] = ['key' => $trigger['key'], 'label' => $trigger['label']];
                }
            }

            if (empty($remindersToSend)) {
                continue;
            }

            // Get students with pending submissions
            $submissions = Submission::with('user')
                ->where('task_id', $task->id_task)
                ->where('status', 'pending')
                ->get();

            foreach ($submissions as $sub) {
                $user = $sub->user;
                if (!$user || !$user->fcm_token) {
                    continue;
                }

                foreach ($remindersToSend as $reminder) {
                    // Check if already sent (prevent duplicates)
                    $alreadySent = NotificationLog::where('task_id', $task->id_task)
                        ->where('user_id', $user->id)
                        ->where('reminder_key', $reminder['key'])
                        ->exists();

                    if ($alreadySent) {
                        continue;
                    }

                    $deadlineStrLabel = $deadlineDateTime->format('d M Y, H:i');

                    $message = CloudMessage::fromArray([
                        'token' => $user->fcm_token,
                        'notification' => [
                            'title' => '⏰ Pengingat Tugas: ' . $task->nama_tugas,
                            'body' => "Deadline {$reminder['label']} ({$deadlineStrLabel}). Mata kuliah: {$task->nama_matkul}. Segera kumpulkan!",
                        ]
                    ]);

                    try {
                        $messaging->send($message);
                        $count++;

                        NotificationLog::create([
                            'task_id' => $task->id_task,
                            'user_id' => $user->id,
                            'reminder_key' => $reminder['key'],
                        ]);

                        $this->info("✅ [{$reminder['key']}] Sent to {$user->name} for \"{$task->nama_tugas}\"");
                    } catch (\Exception $e) {
                        $this->error("❌ Failed [{$reminder['key']}] to {$user->name}: " . $e->getMessage());
                    }
                }
            }
        }

        $this->info("Finished. Total notifications sent: {$count}");
    }
}
