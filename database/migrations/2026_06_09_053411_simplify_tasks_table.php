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
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['id_matkul']);
            $table->dropColumn('id_matkul');
            
            $table->string('nama_matkul')->after('nama_tugas');
            $table->string('attachment')->nullable()->after('rubric');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('attachment');
            $table->dropColumn('nama_matkul');
            
            $table->unsignedBigInteger('id_matkul')->nullable();
            $table->foreign('id_matkul')->references('id_matkul')->on('mata_kuliahs')->onDelete('cascade');
        });
    }
};
