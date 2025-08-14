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

        // Enable RLS on audit table
        DB::statement("ALTER TABLE audit_role_changes ENABLE ROW LEVEL SECURITY;");

        // RLS Policies for audit table
        DB::statement("
            CREATE POLICY \"Admins can view all audit logs\"
            ON audit_role_changes
            FOR SELECT
            USING (is_admin());
        ");

        DB::statement("
            CREATE POLICY \"Team admins can view audit logs for their teams\"
            ON audit_role_changes
            FOR SELECT
            USING (is_team_admin() AND (
                team_id IN (
                    SELECT ta.team_id 
                    FROM team_admins ta
                    INNER JOIN profiles p ON p.id = ta.admin_profile_id
                    WHERE p.user_id = auth.uid()
                ) OR changed_by = auth.uid()
            ));
        ");

        DB::statement("
            CREATE POLICY \"Users can view their own role change history\"
            ON audit_role_changes
            FOR SELECT
            USING (user_id = auth.uid());
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_role_changes');
    }
};