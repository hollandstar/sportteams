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
        Schema::create('action_type_tests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('form_response_id');
            $table->unsignedBigInteger('player_id');
            $table->unsignedBigInteger('team_id');
            $table->string('at_category'); // Action Type category
            $table->json('test_results'); // Motorische testen results
            $table->date('test_date');
            $table->unsignedBigInteger('tested_by');
            $table->timestamps();
            
            $table->index(['player_id', 'test_date']);
            $table->index(['team_id', 'at_category']);
            $table->foreign('form_response_id')->references('id')->on('form_responses');
            $table->foreign('player_id')->references('id')->on('users');
            $table->foreign('team_id')->references('id')->on('teams');
            $table->foreign('tested_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('action_type_tests');
    }
};