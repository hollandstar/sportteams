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
        'assessment_date',
        'assessed_by',
        
        // Technische vaardigheden (based on real database data)
        'balbeheersing',
        'pasnauwkeurigheid',
        'schieten',
        'aanvallen',
        'verdedigen',
        
        // Fysieke vaardigheden
        'fysieke_conditie',
        
        // Mentale vaardigheden
        'spelinzicht',
        'teamwork',
        'houding_attitude',
        
        // Overall score
        'overall_score',
        
        // Feedback sections
        'sterke_punten',
        'verbeterpunten',
        'coach_notities',
        
        // Legacy fields
        'physical_skills',
        'mental_skills',
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

    /**
     * Get formatted vaardigheden results as text (matching database format)
     */
    public function getFormattedResultsAttribute()
    {
        $results = "VAARDIGHEDEN BEOORDELING:\n\n";
        
        $results .= "Technische vaardigheden:\n";
        $results .= "- Balbeheersing: {$this->balbeheersing}/10\n";
        $results .= "- Passnauwkeurigheid: {$this->pasnauwkeurigheid}/10\n";
        $results .= "- Schieten: {$this->schieten}/10\n";
        $results .= "- Aanvallen: {$this->aanvallen}/10\n";
        $results .= "- Verdedigen: {$this->verdedigen}/10\n\n";
        
        $results .= "Fysieke vaardigheden:\n";
        $results .= "- Fysieke conditie: {$this->fysieke_conditie}/10\n\n";
        
        $results .= "Mentale vaardigheden:\n";
        $results .= "- Spelinzicht: {$this->spelinzicht}/10\n";
        $results .= "- Teamwork: {$this->teamwork}/10\n";
        $results .= "- Houding/Attitude: {$this->houding_attitude}/10\n\n";
        
        $results .= "OVERALL SCORE: {$this->overall_score}/10\n\n";
        
        if ($this->sterke_punten) {
            $results .= "STERKE PUNTEN:\n{$this->sterke_punten}\n\n";
        }
        
        if ($this->verbeterpunten) {
            $results .= "VERBETERPUNTEN:\n{$this->verbeterpunten}\n\n";
        }
        
        if ($this->coach_notities) {
            $results .= "COACH NOTITIES:\n{$this->coach_notities}\n\n";
        }
        
        $results .= "Datum: {$this->assessment_date->format('d-m-Y H:i')}\n";
        
        return $results;
    }
}