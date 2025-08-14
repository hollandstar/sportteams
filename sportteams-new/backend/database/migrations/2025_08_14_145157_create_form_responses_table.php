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
        Schema::create('form_responses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('form_template_id');
            $table->unsignedBigInteger('player_id');
            $table->unsignedBigInteger('team_id');
            $table->json('responses'); // JSON data with all form responses
            $table->unsignedBigInteger('submitted_by');
            $table->timestamp('submitted_at');
            $table->timestamps();
            
            $table->index(['form_template_id', 'player_id']);
            $table->index(['team_id', 'submitted_at']);
            $table->foreign('form_template_id')->references('id')->on('form_templates');
            $table->foreign('player_id')->references('id')->on('users');
            $table->foreign('team_id')->references('id')->on('teams');
            $table->foreign('submitted_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_responses');
    }
};