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
        // Create helper function to check if user is team admin
        DB::statement("
            CREATE OR REPLACE FUNCTION is_team_admin(user_uuid UUID DEFAULT auth.uid())
            RETURNS BOOLEAN AS $$
            BEGIN
                RETURN EXISTS (
                    SELECT 1 
                    FROM profiles p
                    INNER JOIN team_admins ta ON p.id = ta.admin_profile_id
                    WHERE p.user_id = user_uuid::text
                    AND p.role = 'team_admin'
                );
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        ");

        // Create helper function to check if user is team admin for specific team
        DB::statement("
            CREATE OR REPLACE FUNCTION is_team_admin_for_team(team_int_id INTEGER, user_uuid UUID DEFAULT auth.uid())
            RETURNS BOOLEAN AS $$
            BEGIN
                RETURN EXISTS (
                    SELECT 1 
                    FROM profiles p
                    INNER JOIN team_admins ta ON p.id = ta.admin_profile_id
                    WHERE p.user_id = user_uuid::text
                    AND p.role = 'team_admin'
                    AND ta.team_id = team_int_id
                );
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        ");

        -- Create secure function to promote general user to player
        DB::statement("
            CREATE OR REPLACE FUNCTION promote_general_to_player(profile_int_id INTEGER, team_int_id INTEGER, admin_user_uuid UUID DEFAULT auth.uid())
            RETURNS JSON AS $$
            DECLARE
                target_profile RECORD;
                result JSON;
            BEGIN
                -- Verify admin is team admin for this team
                IF NOT is_team_admin_for_team(team_int_id, admin_user_uuid) AND NOT is_admin(admin_user_uuid) THEN
                    RETURN json_build_object('success', false, 'error', 'Insufficient permissions');
                END IF;

                -- Get target profile
                SELECT * INTO target_profile FROM profiles WHERE id = profile_int_id;
                
                IF NOT FOUND THEN
                    RETURN json_build_object('success', false, 'error', 'Profile not found');
                END IF;

                -- Check if profile is general role
                IF target_profile.role != 'general' THEN
                    RETURN json_build_object('success', false, 'error', 'Can only promote general users to player');
                END IF;

                -- Update profile role to player
                UPDATE profiles 
                SET role = 'player', updated_at = NOW()
                WHERE id = profile_int_id;

                -- Insert or update player record
                INSERT INTO players (profile_id, team_id, name, email, created_at, updated_at)
                VALUES (
                    profile_int_id,
                    team_int_id,
                    target_profile.name,
                    target_profile.email,
                    NOW(),
                    NOW()
                )
                ON CONFLICT (profile_id) 
                DO UPDATE SET 
                    team_id = team_int_id,
                    updated_at = NOW();

                -- Log the action
                INSERT INTO audit_role_changes (
                    user_id, profile_id, old_role, new_role, changed_by, team_id, created_at
                ) VALUES (
                    target_profile.user_id,
                    profile_int_id,
                    'general',
                    'player',
                    admin_user_uuid::text,
                    team_int_id,
                    NOW()
                );

                RETURN json_build_object(
                    'success', true, 
                    'message', 'Successfully promoted user to player',
                    'profile_id', profile_int_id,
                    'team_id', team_int_id
                );
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP FUNCTION IF EXISTS is_team_admin(UUID);");
        DB::statement("DROP FUNCTION IF EXISTS is_team_admin_for_team(INTEGER, UUID);");
        DB::statement("DROP FUNCTION IF EXISTS promote_general_to_player(INTEGER, INTEGER, UUID);");
    }
};