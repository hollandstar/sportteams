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
        Schema::create('team_admins', function (Blueprint $table) {
            $table->id();
            $table->integer('team_id');
            $table->integer('admin_profile_id');
            $table->string('admin_name');
            $table->string('team_name');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');
            $table->foreign('admin_profile_id')->references('id')->on('profiles')->onDelete('cascade');
            
            // Unique constraint to prevent duplicate assignments
            $table->unique(['team_id', 'admin_profile_id'], 'unique_team_admin_assignment');
            
            // Indexes for performance
            $table->index(['admin_profile_id'], 'idx_team_admins_profile');
            $table->index(['team_id'], 'idx_team_admins_team');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_admins');
    }
};