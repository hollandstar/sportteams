<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Note: RLS policies are disabled for Laravel implementation
        // Security is handled at the application level via Laravel's middleware and policies
        
        // Enable RLS on team_admins table (for future use if needed)
        // DB::statement("ALTER TABLE team_admins ENABLE ROW LEVEL SECURITY;");

        // For now, we'll rely on Laravel's authorization policies
        // The RLS functions are available if needed in the future
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No RLS policies to remove in this Laravel implementation
    }
};