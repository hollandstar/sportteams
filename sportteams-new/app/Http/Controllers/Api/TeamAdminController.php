<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamAdmin;
use App\Models\Team;
use App\Models\Profile;
use App\Models\Player;
use App\Services\TeamAdminService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TeamAdminController extends Controller
{
    protected TeamAdminService $teamAdminService;

    public function __construct(TeamAdminService $teamAdminService)
    {
        $this->teamAdminService = $teamAdminService;
    }

    /**
     * Get teams managed by current team admin
     */
    public function getManagedTeams(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }

            $teams = $this->teamAdminService->getManagedTeams($user->id);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'teams' => $teams,
                    'count' => count($teams)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch managed teams',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get players for teams managed by current team admin
     */
    public function getTeamPlayers(Request $request, string $teamId): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Verify team admin has access to this team
            if (!$this->teamAdminService->canManageTeam($user->id, $teamId)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient permissions for this team'
                ], 403);
            }

            $players = $this->teamAdminService->getTeamPlayers($teamId);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'players' => $players,
                    'team_id' => $teamId,
                    'count' => count($players)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch team players',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Promote a general user to player role for a specific team
     */
    public function promoteToPlayer(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'profile_id' => 'required|uuid|exists:profiles,id',
                'team_id' => 'required|uuid|exists:teams,id'
            ]);

            $user = $request->user();
            $profileId = $request->input('profile_id');
            $teamId = $request->input('team_id');

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Verify team admin has access to this team
            if (!$this->teamAdminService->canManageTeam($user->id, $teamId)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient permissions for this team'
                ], 403);
            }

            $result = $this->teamAdminService->promoteGeneralToPlayer($profileId, $teamId, $user->id);

            if ($result['success']) {
                return response()->json([
                    'status' => 'success',
                    'message' => $result['message'],
                    'data' => $result
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['error']
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to promote user to player',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new player for a team (team admin only)
     */
    public function createPlayer(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'team_id' => 'required|uuid|exists:teams,id',
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:profiles,email',
                'birth_date' => 'nullable|date',
                'position' => 'nullable|string|max:100',
                'jersey_number' => 'nullable|integer|min:1|max:999'
            ]);

            $user = $request->user();
            $teamId = $request->input('team_id');

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Verify team admin has access to this team
            if (!$this->teamAdminService->canManageTeam($user->id, $teamId)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient permissions for this team'
                ], 403);
            }

            $playerData = $request->only([
                'team_id', 'name', 'email', 'birth_date', 'position', 'jersey_number'
            ]);

            $result = $this->teamAdminService->createPlayer($playerData, $user->id);

            if ($result['success']) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Player created successfully',
                    'data' => $result['data']
                ], 201);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['error']
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create player',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update player information (team admin only)
     */
    public function updatePlayer(Request $request, string $playerId): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'sometimes|string|max:255',
                'birth_date' => 'sometimes|nullable|date',
                'position' => 'sometimes|nullable|string|max:100',
                'jersey_number' => 'sometimes|nullable|integer|min:1|max:999'
            ]);

            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get player to verify team access
            $player = Player::find($playerId);
            if (!$player) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Player not found'
                ], 404);
            }

            // Verify team admin has access to this team
            if (!$this->teamAdminService->canManageTeam($user->id, $player->team_id)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient permissions for this team'
                ], 403);
            }

            $updateData = $request->only([
                'name', 'birth_date', 'position', 'jersey_number'
            ]);

            $result = $this->teamAdminService->updatePlayer($playerId, $updateData, $user->id);

            if ($result['success']) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Player updated successfully',
                    'data' => $result['data']
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['error']
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update player',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get audit log for team admin actions
     */
    public function getAuditLog(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }

            $auditLog = $this->teamAdminService->getAuditLog($user->id);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'audit_log' => $auditLog,
                    'count' => count($auditLog)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch audit log',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}