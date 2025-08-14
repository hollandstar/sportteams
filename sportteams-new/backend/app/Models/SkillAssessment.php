<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SkillAssessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_response_id',
        'player_id',
        'team_id',
        'balbeheersing',
        'pasnauwkeurigheid',
        'schieten',
        'aanvallen',
        'verdedigen',
        'physical_skills',
        'mental_skills',
        'assessment_date',
        'assessed_by',
    ];

    protected $casts = [
        'physical_skills' => 'array',
        'mental_skills' => 'array',
        'assessment_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the form response this skill assessment belongs to
     */
    public function formResponse(): BelongsTo
    {
        return $this->belongsTo(FormResponse::class);
    }

    /**
     * Get the player this assessment is for
     */
    public function player(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player_id');
    }

    /**
     * Get the team this assessment belongs to
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    /**
     * Get the user who conducted this assessment
     */
    public function assessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assessed_by');
    }

    /**
     * Get all technical skills as an array
     */
    public function getTechnicalSkillsAttribute()
    {
        return [
            'balbeheersing' => $this->balbeheersing,
            'pasnauwkeurigheid' => $this->pasnauwkeurigheid,
            'schieten' => $this->schieten,
            'aanvallen' => $this->aanvallen,
            'verdedigen' => $this->verdedigen,
        ];
    }

    /**
     * Get the average technical skills score
     */
    public function getAverageTechnicalSkillsAttribute()
    {
        $skills = $this->technical_skills;
        return array_sum($skills) / count($skills);
    }
}