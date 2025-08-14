<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class TeamAdmin extends Model
{
    use HasUuids;

    protected $fillable = [
        'team_id',
        'admin_profile_id',
        'admin_name',
        'team_name',
    ];

    protected $casts = [
        'team_id' => 'string',
        'admin_profile_id' => 'string',
    ];

    /**
     * Get the team that this admin manages
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    /**
     * Get the profile of the team admin
     */
    public function adminProfile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'admin_profile_id');
    }

    /**
     * Check if a user is team admin for a specific team
     */
    public static function isTeamAdminForTeam(string $teamId, string $userId): bool
    {
        return self::whereHas('adminProfile', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->where('team_id', $teamId)->exists();
    }

    /**
     * Get teams managed by a user
     */
    public static function getTeamsForUser(string $userId): array
    {
        return self::whereHas('adminProfile', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->pluck('team_id')->toArray();
    }
}