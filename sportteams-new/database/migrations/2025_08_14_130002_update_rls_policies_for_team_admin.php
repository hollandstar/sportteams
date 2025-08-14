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
        // Enable RLS on team_admins table
        DB::statement("ALTER TABLE team_admins ENABLE ROW LEVEL SECURITY;");

        // RLS Policies for team_admins table
        DB::statement("
            CREATE POLICY \"Admins can manage all team admin assignments\"
            ON team_admins
            FOR ALL
            USING (is_admin())
            WITH CHECK (is_admin());
        ");

        DB::statement("
            CREATE POLICY \"Team admins can view their own assignments\"
            ON team_admins
            FOR SELECT
            USING (admin_profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            ));
        ");

        // Update Players table RLS policies (remove blanket SELECT true)
        DB::statement("DROP POLICY IF EXISTS \"Players are viewable by authenticated users\" ON players;");
        
        DB::statement("
            CREATE POLICY \"Admins can manage all players\"
            ON players
            FOR ALL
            USING (is_admin())
            WITH CHECK (is_admin());
        ");

        DB::statement("
            CREATE POLICY \"Team admins can manage players in their teams\"
            ON players
            FOR ALL
            USING (is_team_admin_for_team(team_id))
            WITH CHECK (is_team_admin_for_team(team_id));
        ");

        DB::statement("
            CREATE POLICY \"Coaches can view players in their teams\"
            ON players
            FOR SELECT
            USING (is_coach() AND team_id IN (
                SELECT tc.team_id 
                FROM team_coaches tc
                INNER JOIN profiles p ON p.id = tc.coach_profile_id
                WHERE p.user_id = auth.uid()
            ));
        ");

        DB::statement("
            CREATE POLICY \"Players can view their own data\"
            ON players
            FOR SELECT
            USING (profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            ));
        ");

        // Update Profiles table RLS policies for team-scoped access
        DB::statement("DROP POLICY IF EXISTS \"Profiles are viewable by authenticated users\" ON profiles;");

        DB::statement("
            CREATE POLICY \"Users can view their own profile\"
            ON profiles
            FOR SELECT
            USING (user_id = auth.uid());
        ");

        DB::statement("
            CREATE POLICY \"Admins can view all profiles\"
            ON profiles
            FOR SELECT
            USING (is_admin());
        ");

        DB::statement("
            CREATE POLICY \"Team admins can view profiles of players in their teams\"
            ON profiles
            FOR SELECT
            USING (is_team_admin() AND id IN (
                SELECT p.profile_id 
                FROM players p
                INNER JOIN team_admins ta ON ta.team_id = p.team_id
                INNER JOIN profiles pr ON pr.id = ta.admin_profile_id
                WHERE pr.user_id = auth.uid()
            ));
        ");

        DB::statement("
            CREATE POLICY \"Coaches can view profiles of players in their teams\"
            ON profiles
            FOR SELECT
            USING (is_coach() AND id IN (
                SELECT p.profile_id 
                FROM players p
                INNER JOIN team_coaches tc ON tc.team_id = p.team_id
                INNER JOIN profiles pr ON pr.id = tc.coach_profile_id
                WHERE pr.user_id = auth.uid()
            ));
        ");
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