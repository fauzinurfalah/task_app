<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\Submission;
use App\Models\NotificationLog;
use App\Models\PersonalTask;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Carbon\Carbon;

#[Signature('notify:deadlines')]
#[Description('Send FCM notifications for tasks based on deadline proximity')]
class SendDeadlineReminders extends Command
{
    public function handle()
    {
        $now = Carbon::now('Asia/Jakarta');
        $this->info("Running deadline reminders at {$now->format('Y-m-d H:i:s')} WIB");

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

        // Process standard tasks
        foreach ($tasks as $task) {
            $deadlineStr = is_string($task->deadline) ? $task->deadline : $task->deadline->format('Y-m-d');
            $deadlineDateTime = Carbon::parse($deadlineStr . ' ' . ($task->jam ?? '23:59:00'));

            $remindersToSend = $this->getRemindersToSend($now, $deadlineDateTime);

            if (empty($remindersToSend)) {
                continue;
            }

            // Get all pending submissions, eager-load user's FCM tokens
            $submissions = Submission::with(['user.fcmTokens'])
                ->where('task_id', $task->id_task)
                ->where('status', 'pending')
                ->get();

            foreach ($submissions as $sub) {
                $user = $sub->user;
                if (!$user) continue;

                // All registered devices for this user
                $deviceTokens = $user->fcmTokens;
                if ($deviceTokens->isEmpty()) continue;

                foreach ($remindersToSend as $reminder) {
                    // Log is per-user (not per-device), so we only send each reminder once per user
                    $alreadySent = NotificationLog::where('task_id', $task->id_task)
                        ->where('user_id', $user->id)
                        ->where('reminder_key', $reminder['key'])
                        ->exists();

                    if ($alreadySent) continue;

                    $deadlineStrLabel = $deadlineDateTime->format('d M Y, H:i');
                    $successCount = 0;

                    // Send to every registered device of this user
                    foreach ($deviceTokens as $fcmToken) {
                        $message = CloudMessage::fromArray([
                            'token' => $fcmToken->token,
                            'notification' => [
                                'title' => 'Pengingat Tugas: ' . $task->nama_tugas,
                                'body'  => "Deadline {$reminder['label']} ({$deadlineStrLabel}). Mata kuliah: {$task->nama_matkul}. Segera kumpulkan!",
                            ],
                        ]);

                        try {
                            $messaging->send($message);
                            $successCount++;
                            $count++;
                        } catch (\Exception $e) {
                            $msg = $e->getMessage();
                            // Auto-clean stale / invalid tokens
                            if (str_contains($msg, 'registration-token-not-registered') ||
                                str_contains($msg, 'invalid-registration-token')) {
                                $fcmToken->delete();
                                $this->warn("Removed stale token for {$user->name}");
                            } else {
                                $this->error("Failed [{$reminder['key']}] to {$user->name} (device #{$fcmToken->id}): {$msg}");
                            }
                        }
                    }

                    if ($successCount > 0) {
                        // Record once per user per reminder key
                        NotificationLog::create([
                            'task_id'      => $task->id_task,
                            'user_id'      => $user->id,
                            'reminder_key' => $reminder['key'],
                        ]);
                        $this->info("[{$reminder['key']}] Sent to {$user->name} on {$successCount} device(s) for \"{$task->nama_tugas}\"");
                    }
                }
            }
        }

        // Process Personal Tasks
        $personalTasks = PersonalTask::with('user.fcmTokens')
            ->where('status', 'pending')
            ->where('due', '>=', $now->format('Y-m-d'))
            ->get();

        foreach ($personalTasks as $task) {
            $deadlineStr = is_string($task->due) ? $task->due : $task->due->format('Y-m-d');
            $deadlineDateTime = Carbon::parse($deadlineStr . ' ' . ($task->dueTime ?? '23:59:00'));

            $remindersToSend = $this->getRemindersToSend($now, $deadlineDateTime);
            if (empty($remindersToSend)) {
                continue;
            }

            $user = $task->user;
            if (!$user) continue;

            $deviceTokens = $user->fcmTokens;
            if ($deviceTokens->isEmpty()) continue;

            $notifiedKeys = $task->notified_keys ?? [];

            foreach ($remindersToSend as $reminder) {
                if (in_array($reminder['key'], $notifiedKeys)) {
                    continue;
                }

                $deadlineStrLabel = $deadlineDateTime->format('d M Y, H:i');
                $successCount = 0;

                foreach ($deviceTokens as $fcmToken) {
                    $message = CloudMessage::fromArray([
                        'token' => $fcmToken->token,
                        'notification' => [
                            'title' => 'Pengingat Tugas Mandiri: ' . $task->title,
                            'body'  => "Deadline {$reminder['label']} ({$deadlineStrLabel}). Segera selesaikan!",
                        ],
                    ]);

                    try {
                        $messaging->send($message);
                        $successCount++;
                        $count++;
                    } catch (\Exception $e) {
                        $msg = $e->getMessage();
                        if (str_contains($msg, 'registration-token-not-registered') ||
                            str_contains($msg, 'invalid-registration-token')) {
                            $fcmToken->delete();
                            $this->warn("Removed stale token for {$user->name}");
                        } else {
                            $this->error("Failed [{$reminder['key']}] to {$user->name} (device #{$fcmToken->id}): {$msg}");
                        }
                    }
                }

                if ($successCount > 0) {
                    $notifiedKeys[] = $reminder['key'];
                    $task->update(['notified_keys' => array_values(array_unique($notifiedKeys))]);
                    $this->info("[{$reminder['key']}] Sent to {$user->name} on {$successCount} device(s) for Mandiri \"{$task->title}\"");
                }
            }
        }

        $this->info("Finished. Total notifications sent: {$count}");
    }

    private function getRemindersToSend(Carbon $now, Carbon $deadlineDateTime)
    {
        $hoursUntilDeadline = $now->diffInMinutes($deadlineDateTime, false) / 60;
        if ($hoursUntilDeadline < 0) {
            return []; // Skip past deadlines
        }

        $currentHour = (int) $now->format('H');
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

        return $remindersToSend;
    }
}
