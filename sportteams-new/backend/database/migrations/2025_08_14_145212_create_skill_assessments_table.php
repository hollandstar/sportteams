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
        Schema::create('skill_assessments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('form_response_id');
            $table->unsignedBigInteger('player_id');
            $table->unsignedBigInteger('team_id');
            
            // Technical Skills (5/10 rating system)
            $table->integer('balbeheersing')->default(5); // Ball control
            $table->integer('pasnauwkeurigheid')->default(5); // Pass accuracy
            $table->integer('schieten')->default(5); // Shooting
            $table->integer('aanvallen')->default(5); // Attacking
            $table->integer('verdedigen')->default(5); // Defending
            
            // Physical & Mental Skills JSON
            $table->json('physical_skills')->nullable(); // Physical skills data
            $table->json('mental_skills')->nullable(); // Mental skills data
            
            $table->date('assessment_date');
            $table->unsignedBigInteger('assessed_by');
            $table->timestamps();
            
            $table->index(['player_id', 'assessment_date']);
            $table->index(['team_id', 'assessment_date']);
            $table->foreign('form_response_id')->references('id')->on('form_responses');
            $table->foreign('player_id')->references('id')->on('users');
            $table->foreign('team_id')->references('id')->on('teams');
            $table->foreign('assessed_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skill_assessments');
    }
};