<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\Submission;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;

#[Signature('notify:deadlines')]
#[Description('Send FCM notifications for tasks due soon')]
class SendDeadlineReminders extends Command
{
    public function handle()
    {
        // Get tasks that are due tomorrow
        $tomorrow = now()->addDay()->format('Y-m-d');
        $tasks = Task::where('deadline', $tomorrow)->get();

        if ($tasks->isEmpty()) {
            $this->info('No tasks due tomorrow.');
            return;
        }

        try {
            // Setup Firebase Messaging
            // Requires FIREBASE_CREDENTIALS in .env pointing to the JSON service account file
            $factory = (new Factory)->withServiceAccount(base_path(env('FIREBASE_CREDENTIALS', 'firebase_credentials.json')));
            $messaging = $factory->createMessaging();
        } catch (\Exception $e) {
            $this->error('Firebase Setup Error: ' . $e->getMessage() . '. Make sure you have downloaded the Service Account JSON and set FIREBASE_CREDENTIALS in .env');
            return;
        }

        $count = 0;
        foreach ($tasks as $task) {
            // Get all students assigned to this task (pending submissions)
            $submissions = Submission::with('user')
                ->where('task_id', $task->id_task)
                ->where('status', 'pending')
                ->get();

            foreach ($submissions as $sub) {
                $user = $sub->user;
                if ($user && $user->fcm_token) {
                    $message = CloudMessage::fromArray([
                        'token' => $user->fcm_token,
                        'notification' => [
                            'title' => 'Pengingat Tugas: ' . $task->nama_tugas,
                            'body' => 'Tugas ' . $task->nama_matkul . ' akan jatuh tempo besok (' . $task->deadline->format('d M Y') . ' jam ' . $task->jam . '). Segera kumpulkan!',
                        ]
                    ]);

                    try {
                        $messaging->send($message);
                        $count++;
                        $this->info("Sent reminder to {$user->name} for task {$task->nama_tugas}");
                    } catch (\Exception $e) {
                        $this->error("Failed to send to {$user->name}: " . $e->getMessage());
                    }
                }
            }
        }

        $this->info("Finished sending {$count} reminders.");
    }
}
