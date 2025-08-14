<?php

namespace App\Services;

use App\Models\TeamAdmin;
use App\Models\Team;
use App\Models\Profile;
use App\Models\Player;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TeamAdminService
{
    /**
     * Check if user can manage a specific team
     */
    public function canManageTeam(string $userId, string $teamId): bool
    {
        return TeamAdmin::whereHas('adminProfile', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->where('team_id', $teamId)->exists();
    }

    /**
     * Get teams managed by a user
     */
    public function getManagedTeams(string $userId): array
    {
        return TeamAdmin::with(['team', 'adminProfile'])
            ->whereHas('adminProfile', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->get()
            ->map(function ($teamAdmin) {
                return [
                    'id' => $teamAdmin->team->id,
                    'name' => $teamAdmin->team->name,
                    'description' => $teamAdmin->team->description,
                    'sport' => $teamAdmin->team->sport,
                    'season' => $teamAdmin->team->season,
                    'assigned_at' => $teamAdmin->created_at,
                    'player_count' => Player::where('team_id', $teamAdmin->team->id)->count()
                ];
            })
            ->toArray();
    }

    /**
     * Get players for a specific team
     */
    public function getTeamPlayers(string $teamId): array
    {
        return Player::with(['profile'])
            ->where('team_id', $teamId)
            ->get()
            ->map(function ($player) {
                return [
                    'id' => $player->id,
                    'profile_id' => $player->profile_id,
                    'name' => $player->name,
                    'email' => $player->email,
                    'birth_date' => $player->birth_date,
                    'position' => $player->position,
                    'jersey_number' => $player->jersey_number,
                    'profile' => $player->profile ? [
                        'id' => $player->profile->id,
                        'user_id' => $player->profile->user_id,
                        'role' => $player->profile->role,
                        'is_active' => $player->profile->is_active,
                        'preferred_language' => $player->profile->preferred_language
                    ] : null,
                    'created_at' => $player->created_at,
                    'updated_at' => $player->updated_at
                ];
            })
            ->toArray();
    }

    /**
     * Promote a general user to player using secure database function
     */
    public function promoteGeneralToPlayer(string $profileId, string $teamId, string $adminUserId): array
    {
        try {
            $result = DB::selectOne(
                "SELECT promote_general_to_player(?, ?, ?) as result",
                [$profileId, $teamId, $adminUserId]
            );

            return json_decode($result->result, true);

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Database error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create a new player for a team
     */
    public function createPlayer(array $playerData, string $adminUserId): array
    {
        try {
            DB::beginTransaction();

            // Generate a temporary password for the new user
            $tempPassword = Str::random(12);
            
            // Create auth user (this would typically be done via your auth system)
            // For now, we'll create the profile and player directly
            
            // Create profile
            $profile = Profile::create([
                'id' => Str::uuid(),
                'user_id' => Str::uuid(), // This should be the actual auth user ID
                'name' => $playerData['name'],
                'email' => $playerData['email'],
                'role' => 'player',
                'is_active' => true,
                'preferred_language' => 'nl'
            ]);

            // Create player
            $player = Player::create([
                'id' => Str::uuid(),
                'profile_id' => $profile->id,
                'team_id' => $playerData['team_id'],
                'name' => $playerData['name'],
                'email' => $playerData['email'],
                'birth_date' => $playerData['birth_date'] ?? null,
                'position' => $playerData['position'] ?? null,
                'jersey_number' => $playerData['jersey_number'] ?? null
            ]);

            // Log the creation
            DB::table('audit_role_changes')->insert([
                'id' => Str::uuid(),
                'user_id' => $profile->user_id,
                'profile_id' => $profile->id,
                'old_role' => 'none',
                'new_role' => 'player',
                'changed_by' => $adminUserId,
                'team_id' => $playerData['team_id'],
                'notes' => 'Player created by team admin',
                'created_at' => now()
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Player created successfully',
                'data' => [
                    'player_id' => $player->id,
                    'profile_id' => $profile->id,
                    'temp_password' => $tempPassword // In production, send this via email
                ]
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'error' => 'Failed to create player: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Update player information
     */
    public function updatePlayer(string $playerId, array $updateData, string $adminUserId): array
    {
        try {
            $player = Player::find($playerId);
            
            if (!$player) {
                return [
                    'success' => false,
                    'error' => 'Player not found'
                ];
            }

            // Update player data
            $player->update(array_filter($updateData));

            // If name changed, also update profile
            if (isset($updateData['name']) && $player->profile) {
                $player->profile->update(['name' => $updateData['name']]);
            }

            return [
                'success' => true,
                'message' => 'Player updated successfully',
                'data' => [
                    'player_id' => $player->id,
                    'updated_fields' => array_keys(array_filter($updateData))
                ]
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to update player: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get audit log for team admin actions
     */
    public function getAuditLog(string $userId): array
    {
        return DB::table('audit_role_changes')
            ->select([
                'id',
                'user_id',
                'profile_id', 
                'old_role',
                'new_role',
                'team_id',
                'notes',
                'created_at'
            ])
            ->where('changed_by', $userId)
            ->orWhereIn('team_id', function ($query) use ($userId) {
                $query->select('team_id')
                    ->from('team_admins')
                    ->join('profiles', 'profiles.id', '=', 'team_admins.admin_profile_id')
                    ->where('profiles.user_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get()
            ->toArray();
    }

    /**
     * Assign team admin role to a user for specific teams
     */
    public function assignTeamAdmin(string $profileId, array $teamIds, string $adminUserId): array
    {
        try {
            DB::beginTransaction();

            $profile = Profile::find($profileId);
            if (!$profile) {
                return [
                    'success' => false,
                    'error' => 'Profile not found'
                ];
            }

            // Update profile role to team_admin
            $oldRole = $profile->role;
            $profile->update(['role' => 'team_admin']);

            // Create team admin assignments
            foreach ($teamIds as $teamId) {
                $team = Team::find($teamId);
                if ($team) {
                    TeamAdmin::create([
                        'team_id' => $teamId,
                        'admin_profile_id' => $profileId,
                        'admin_name' => $profile->name,
                        'team_name' => $team->name
                    ]);
                }
            }

            // Log the role change
            DB::table('audit_role_changes')->insert([
                'id' => Str::uuid(),
                'user_id' => $profile->user_id,
                'profile_id' => $profileId,
                'old_role' => $oldRole,
                'new_role' => 'team_admin',
                'changed_by' => $adminUserId,
                'team_id' => $teamIds[0] ?? null, // Primary team
                'notes' => 'Assigned team admin role for ' . count($teamIds) . ' team(s)',
                'created_at' => now()
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Team admin assigned successfully',
                'data' => [
                    'profile_id' => $profileId,
                    'teams_assigned' => count($teamIds)
                ]
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'error' => 'Failed to assign team admin: ' . $e->getMessage()
            ];
        }
    }
}