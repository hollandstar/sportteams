<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConditionTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_response_id',
        'player_id',
        'team_id',
        'test_type',
        'test_date',
        'tested_by',
        
        // Real MSFT (20m beeptest) fields from database analysis
        'leeftijd',
        'geslacht',
        'level_behaald_niveau',
        'aantal_shuttles',
        'totaal_afstand_m',
        'geschatte_vo2max',
        'classificatie',
        'opmerkingen',
    ];

    protected $casts = [
        'test_date' => 'date',
        'geschatte_vo2max' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the form response this condition test belongs to
     */
    public function formResponse(): BelongsTo
    {
        return $this->belongsTo(FormResponse::class);
    }

    /**
     * Get the player this test is for
     */
    public function player(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player_id');
    }

    /**
     * Get the team this test belongs to
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    /**
     * Get the user who conducted this test
     */
    public function tester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tested_by');
    }

    /**
     * Get formatted MSFT results as text
     */
    public function getFormattedResultsAttribute()
    {
        $results = "MSFT (20m BEEPTEST) RESULTATEN:\n\n";
        
        if ($this->leeftijd) $results .= "Leeftijd: {$this->leeftijd}\n";
        if ($this->geslacht) $results .= "Geslacht: {$this->geslacht}\n";
        if ($this->level_behaald_niveau) $results .= "Level (behaald niveau): {$this->level_behaald_niveau}\n";
        if ($this->aantal_shuttles) $results .= "Aantal Shuttles: {$this->aantal_shuttles}\n";
        if ($this->totaal_afstand_m) $results .= "Totaal Afstand (m): {$this->totaal_afstand_m}\n";
        if ($this->geschatte_vo2max) $results .= "Geschatte VO₂max (ml/kg/min): {$this->geschatte_vo2max}\n";
        if ($this->classificatie) $results .= "Classificatie: {$this->classificatie}\n";
        if ($this->opmerkingen) $results .= "Opmerkingen: {$this->opmerkingen}\n";
        
        $results .= "\nTest datum: {$this->test_date->format('Y-m-d')}\n";
        
        return $results;
    }
}