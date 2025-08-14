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
        Schema::create('audit_role_changes', function (Blueprint $table) {
            $table->id();
            $table->string('user_id'); // Keep as string for auth user ID
            $table->integer('profile_id'); // The profile that was changed  
            $table->string('old_role');
            $table->string('new_role');
            $table->string('changed_by'); // The user who made the change
            $table->integer('team_id')->nullable(); // Team context if applicable
            $table->text('notes')->nullable();
            $table->timestamp('created_at');

            // Indexes for performance and querying
            $table->index(['user_id'], 'idx_audit_user');
            $table->index(['profile_id'], 'idx_audit_profile');
            $table->index(['changed_by'], 'idx_audit_changed_by');
            $table->index(['team_id'], 'idx_audit_team');
            $table->index(['created_at'], 'idx_audit_timestamp');
        });

        // Note: RLS is disabled for Laravel implementation
        // Security is handled at the application level via Laravel's middleware and policies
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_role_changes');
    }
};