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
        // Remove new policies
        DB::statement("DROP POLICY IF EXISTS \"Admins can manage all team admin assignments\" ON team_admins;");
        DB::statement("DROP POLICY IF EXISTS \"Team admins can view their own assignments\" ON team_admins;");
        
        DB::statement("DROP POLICY IF EXISTS \"Admins can manage all players\" ON players;");
        DB::statement("DROP POLICY IF EXISTS \"Team admins can manage players in their teams\" ON players;");
        DB::statement("DROP POLICY IF EXISTS \"Coaches can view players in their teams\" ON players;");
        DB::statement("DROP POLICY IF EXISTS \"Players can view their own data\" ON players;");
        
        DB::statement("DROP POLICY IF EXISTS \"Users can view their own profile\" ON profiles;");
        DB::statement("DROP POLICY IF EXISTS \"Admins can view all profiles\" ON profiles;");
        DB::statement("DROP POLICY IF EXISTS \"Team admins can view profiles of players in their teams\" ON profiles;");
        DB::statement("DROP POLICY IF EXISTS \"Coaches can view profiles of players in their teams\" ON profiles;");

        // Restore original policies
        DB::statement("
            CREATE POLICY \"Players are viewable by authenticated users\"
            ON players
            FOR SELECT
            USING (true);
        ");

        DB::statement("
            CREATE POLICY \"Profiles are viewable by authenticated users\"
            ON profiles
            FOR SELECT
            USING (true);
        ");

        DB::statement("ALTER TABLE team_admins DISABLE ROW LEVEL SECURITY;");
    }
};