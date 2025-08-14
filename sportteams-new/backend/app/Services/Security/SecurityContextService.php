<?php

namespace App\Services\Security;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SecurityContextService
{
    private $db;
    private $cache;
    
    private $userId;
    private $profileId;
    private $role;
    private $teamScopes;
    private $permissions;
    
    public function __construct()
    {
        $this->cache = app('cache.store');
    }
    
    public function loadContext(int $userId): self
    {
        $this->userId = $userId;
        
        $cacheKey = "security_context:{$userId}";
        $context = $this->cache->get($cacheKey);
        
        if (!$context) {
            $context = $this->loadFromDatabase($userId);
            $this->cache->put($cacheKey, $context, 300); // 5 minutes
        }
        
        $this->profileId = $context['profile_id'];
        $this->role = $context['role'];
        $this->teamScopes = json_decode($context['team_scopes'] ?? '[]', true) ?: [];
        $this->permissions = json_decode($context['permissions'] ?? '{}', true) ?: [];
        
        return $this;
    }
    
    private function loadFromDatabase(int $userId): array
    {
        $db = $this->getDbConnection();
        
        // Get user profile and role
        $stmt = $db->prepare("
            SELECT 
                p.id as profile_id,
                p.role,
                p.name,
                p.is_active
            FROM profiles p
            WHERE p.user_id = ? AND p.is_active = true
        ");
        
        $stmt->execute([$userId]);
        $profile = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if (!$profile) {
            throw new \Exception('User profile not found or inactive');
        }
        
        // Get team scopes based on role
        $teamScopes = [];
        $permissions = $this->getDefaultPermissions($profile['role']);
        
        if ($profile['role'] !== 'admin') {
            // Get team memberships for non-admin users
            $stmt = $db->prepare("
                SELECT DISTINCT tm.team_id, tm.role as team_role, tm.permissions
                FROM team_memberships tm
                WHERE tm.user_id = ? AND tm.is_active = true
            ");
            
            $stmt->execute([$userId]);
            $memberships = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            foreach ($memberships as $membership) {
                $teamScopes[] = (int)$membership['team_id'];
                
                // Merge team-specific permissions
                if ($membership['permissions']) {
                    $teamPerms = json_decode($membership['permissions'], true);
                    $permissions = array_merge($permissions, $teamPerms);
                }
            }
            
            // If no team memberships and not admin, create basic player access
            if (empty($teamScopes) && $profile['role'] === 'player') {
                // Find player's team
                $stmt = $db->prepare("
                    SELECT pl.team_id 
                    FROM players pl 
                    WHERE pl.profile_id = ? AND pl.is_active = true
                ");
                $stmt->execute([$profile['profile_id']]);
                $playerTeam = $stmt->fetchColumn();
                
                if ($playerTeam) {
                    $teamScopes[] = (int)$playerTeam;
                    
                    // Create team membership for the player
                    $stmt = $db->prepare("
                        INSERT INTO team_memberships (user_id, team_id, profile_id, role, permissions, granted_at)
                        VALUES (?, ?, ?, 'player', ?, CURRENT_TIMESTAMP)
                        ON CONFLICT (user_id, team_id) DO NOTHING
                    ");
                    $stmt->execute([
                        $userId, 
                        $playerTeam, 
                        $profile['profile_id'], 
                        json_encode($permissions)
                    ]);
                }
            }
        }
        
        // Update/create security context
        $this->updateSecurityContext($userId, $profile['profile_id'], $profile['role'], $teamScopes, $permissions);
        
        return [
            'profile_id' => $profile['profile_id'],
            'role' => $profile['role'],
            'team_scopes' => json_encode($teamScopes),
            'permissions' => json_encode($permissions),
            'name' => $profile['name']
        ];
    }
    
    private function updateSecurityContext(int $userId, int $profileId, string $role, array $teamScopes, array $permissions): void
    {
        $db = $this->getDbConnection();
        
        $stmt = $db->prepare("
            INSERT INTO user_security_contexts (
                user_id, profile_id, role, team_scopes, permissions, last_activity, expires_at
            ) VALUES (
                ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '8 hours'
            )
            ON CONFLICT (user_id) 
            DO UPDATE SET
                profile_id = EXCLUDED.profile_id,
                role = EXCLUDED.role,
                team_scopes = EXCLUDED.team_scopes,
                permissions = EXCLUDED.permissions,
                last_activity = CURRENT_TIMESTAMP,
                expires_at = CURRENT_TIMESTAMP + INTERVAL '8 hours'
        ");
        
        $stmt->execute([
            $userId,
            $profileId,
            $role,
            json_encode($teamScopes),
            json_encode($permissions)
        ]);
    }
    
    private function getDefaultPermissions(string $role): array
    {
        $permissions = [
            'admin' => [
                'can_view_all_players' => true,
                'can_edit_all_players' => true,
                'can_delete_players' => true,
                'can_manage_teams' => true,
                'can_manage_users' => true,
                'can_create_evaluations' => true,
                'can_view_all_evaluations' => true,
                'can_manage_settings' => true
            ],
            'coach' => [
                'can_view_team_players' => true,
                'can_edit_team_players' => true,
                'can_create_evaluations' => true,
                'can_view_team_evaluations' => true,
                'can_manage_team_goals' => true,
                'can_view_team_reports' => true
            ],
            'head_coach' => [
                'can_view_team_players' => true,
                'can_edit_team_players' => true,
                'can_create_evaluations' => true,
                'can_view_team_evaluations' => true,
                'can_manage_team_goals' => true,
                'can_view_team_reports' => true,
                'can_manage_team_coaches' => true
            ],
            'player' => [
                'can_view_own_data' => true,
                'can_edit_own_profile' => true,
                'can_view_own_evaluations' => true,
                'can_view_own_goals' => true,
                'can_view_teammates' => true
            ]
        ];
        
        return $permissions[$role] ?? $permissions['player'];
    }
    
    public function canViewPlayer(int $playerId): bool
    {
        if ($this->isAdmin()) return true;
        
        // Get player's team
        $db = $this->getDbConnection();
        $stmt = $db->prepare("SELECT team_id FROM players WHERE id = ?");
        $stmt->execute([$playerId]);
        $playerTeam = $stmt->fetchColumn();
        
        if ($this->isPlayer()) {
            // Players can only view themselves and teammates
            $stmt = $db->prepare("
                SELECT 1 FROM players 
                WHERE id = ? AND profile_id = ?
            ");
            $stmt->execute([$playerId, $this->profileId]);
            $isOwnProfile = (bool) $stmt->fetchColumn();
            
            return $isOwnProfile || ($playerTeam && in_array($playerTeam, $this->teamScopes));
        }
        
        return $playerTeam && in_array($playerTeam, $this->teamScopes);
    }
    
    public function canEditPlayer(int $playerId): bool
    {
        if ($this->isAdmin()) return true;
        
        if ($this->isPlayer()) {
            // Players can only edit themselves
            $db = $this->getDbConnection();
            $stmt = $db->prepare("
                SELECT 1 FROM players WHERE id = ? AND profile_id = ?
            ");
            $stmt->execute([$playerId, $this->profileId]);
            return (bool) $stmt->fetchColumn();
        }
        
        return $this->canViewPlayer($playerId) && 
               ($this->permissions['can_edit_team_players'] ?? false);
    }
    
    public function getSecurePlayerQuery(): string
    {
        if ($this->isAdmin()) {
            return "SELECT * FROM player_team_summary WHERE is_active = true";
        }
        
        if ($this->isPlayer()) {
            return "SELECT * FROM player_team_summary WHERE profile_id = {$this->profileId} OR team_id IN (" . implode(',', $this->teamScopes ?: [0]) . ")";
        }
        
        if ($this->isCoach() && !empty($this->teamScopes)) {
            $teamIds = implode(',', array_map('intval', $this->teamScopes));
            return "SELECT * FROM player_team_summary WHERE team_id IN ({$teamIds}) AND is_active = true";
        }
        
        return "SELECT * FROM player_team_summary WHERE 1=0"; // No access
    }
    
    public function isAdmin(): bool { return $this->role === 'admin'; }
    public function isCoach(): bool { return in_array($this->role, ['coach', 'head_coach', 'assistant_coach']); }
    public function isPlayer(): bool { return $this->role === 'player'; }
    public function getTeamScopes(): array { return $this->teamScopes; }
    public function getProfileId(): int { return $this->profileId; }
    public function getRole(): string { return $this->role; }
    public function getUserId(): int { return $this->userId; }
    public function getPermissions(): array { return $this->permissions; }
    
    private function getDbConnection(): \PDO
    {
        return new \PDO(
            sprintf(
                'pgsql:host=%s;port=%s;dbname=%s',
                env('DB_HOST'),
                env('DB_PORT'),
                env('DB_DATABASE')
            ),
            env('DB_USERNAME'),
            env('DB_PASSWORD')
        );
    }
}