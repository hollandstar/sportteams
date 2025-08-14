<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActionTypeTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_response_id',
        'player_id',
        'team_id',
        'test_date',
        'tested_by',
        
        // Real Action Type Test fields from database analysis
        'linker_rechter_voorkeur',
        'duwen_trekken_voorkeur',
        'roteren_lineair',
        'starthouding',
        'snelheid_kracht',
        'individueel_groep',
        'stap_sprong',
        'enkele_meerdere_sprongen',
        'explosief_gecontroleerd',
        'balans_beweging',
        
        // Extended fields from advanced version
        'scharnierende_glijdende_gewrichten',
        'continu_onderbroken_bewegingen',
        'snelle_langzame_startreactie',
        'verticale_horizontale_focus',
        'visuele_proprioceptieve_orientatie',
        'externe_interne_focus',
        'losse_gespannen_bewegingen',
        'motoroog_radaroog',
        
        'at_categorie',
    ];

    protected $casts = [
        'test_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the form response this action type test belongs to
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
     * Get all action type test results as formatted text
     */
    public function getFormattedResultsAttribute()
    {
        $results = "ACTION TYPE TEST RESULTATEN:\n\n";
        
        if ($this->linker_rechter_voorkeur) 
            $results .= "1. Linker/Rechter voorkeur: {$this->linker_rechter_voorkeur}\n";
        if ($this->duwen_trekken_voorkeur) 
            $results .= "2. Duwen/Trekken voorkeur: {$this->duwen_trekken_voorkeur}\n";
        if ($this->roteren_lineair) 
            $results .= "3. Roteren/Lineair: {$this->roteren_lineair}\n";
        if ($this->starthouding) 
            $results .= "4. Starthouding (Laag/Hoog): {$this->starthouding}\n";
        if ($this->snelheid_kracht) 
            $results .= "5. Snelheid/Kracht: {$this->snelheid_kracht}\n";
        if ($this->individueel_groep) 
            $results .= "6. Individueel/Groep: {$this->individueel_groep}\n";
        if ($this->stap_sprong) 
            $results .= "7. Stap/Sprong: {$this->stap_sprong}\n";
        if ($this->enkele_meerdere_sprongen) 
            $results .= "8. Enkele/Meerdere sprongen: {$this->enkele_meerdere_sprongen}\n";
        if ($this->explosief_gecontroleerd) 
            $results .= "9. Explosief/Gecontroleerd: {$this->explosief_gecontroleerd}\n";
        if ($this->balans_beweging) 
            $results .= "10. Balans/Beweging: {$this->balans_beweging}\n";
        
        if ($this->at_categorie) 
            $results .= "\nAT Categorie: {$this->at_categorie}\n";
        
        $results .= "Test datum: {$this->test_date->format('Y-m-d')}\n";
        
        return $results;
    }
}