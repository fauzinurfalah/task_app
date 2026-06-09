<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id('id_task');
            $table->string('nama_tugas');
            $table->unsignedBigInteger('id_matkul');
            $table->text('deskripsi')->nullable();
            $table->string('tags')->nullable();
            $table->date('deadline');
            $table->time('jam')->default('23:59');
            $table->string('tipe')->default('individu');
            $table->string('prioritas')->default('sedang');
            $table->string('status')->default('active');
            $table->integer('points')->default(100);
            $table->json('rubric')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();

            $table->foreign('id_matkul')->references('id_matkul')->on('mata_kuliahs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
