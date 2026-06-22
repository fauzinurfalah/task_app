<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PersonalTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PersonalTaskController extends Controller
{
    public function index()
    {
        $tasks = PersonalTask::where('user_id', Auth::id())
            ->orderBy('due', 'asc')
            ->get();

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'due' => 'required|date',
            'dueTime' => 'nullable',
        ]);

        $task = PersonalTask::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'course' => $request->course ?? '',
            'description' => $request->description ?? '',
            'due' => $request->due,
            'dueTime' => $request->dueTime ?? '23:59:00',
            'priority' => $request->priority ?? 'medium',
            'status' => $request->status ?? 'pending',
            'progress' => $request->progress ?? 0,
            'subtasks' => $request->subtasks ?? [],
        ]);

        return response()->json($task, 201);
    }

    public function show($id)
    {
        $task = PersonalTask::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        return response()->json($task);
    }

    public function update(Request $request, $id)
    {
        $task = PersonalTask::where('id', $id)->where('user_id', Auth::id())->firstOrFail();

        $task->update($request->only([
            'title', 'course', 'description', 'due', 'dueTime', 'priority', 'status', 'progress', 'subtasks'
        ]));

        return response()->json($task);
    }

    public function destroy($id)
    {
        $task = PersonalTask::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }
}
