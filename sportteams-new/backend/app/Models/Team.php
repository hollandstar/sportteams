<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get all form responses for this team
     */
    public function formResponses(): HasMany
    {
        return $this->hasMany(FormResponse::class);
    }

    /**
     * Get all condition tests for this team
     */
    public function conditionTests(): HasMany
    {
        return $this->hasMany(ConditionTest::class);
    }

    /**
     * Get all action type tests for this team
     */
    public function actionTypeTests(): HasMany
    {
        return $this->hasMany(ActionTypeTest::class);
    }

    /**
     * Get all skill assessments for this team
     */
    public function skillAssessments(): HasMany
    {
        return $this->hasMany(SkillAssessment::class);
    }
}
