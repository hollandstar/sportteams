<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class FormResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_template_id',
        'player_id',
        'team_id',
        'responses',
        'submitted_by',
        'submitted_at',
    ];

    protected $casts = [
        'responses' => 'array',
        'submitted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the form template this response belongs to
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(FormTemplate::class, 'form_template_id');
    }

    /**
     * Get the player this response is for
     */
    public function player(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player_id');
    }

    /**
     * Get the team this response belongs to
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    /**
     * Get the user who submitted this response
     */
    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /**
     * Get the condition test data if this is a condition test response
     */
    public function conditionTest(): HasOne
    {
        return $this->hasOne(ConditionTest::class);
    }

    /**
     * Get the action type test data if this is an action type test response
     */
    public function actionTypeTest(): HasOne
    {
        return $this->hasOne(ActionTypeTest::class);
    }

    /**
     * Get the skill assessment data if this is a skill assessment response
     */
    public function skillAssessment(): HasOne
    {
        return $this->hasOne(SkillAssessment::class);
    }
}