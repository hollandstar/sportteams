<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update action_type_tests table with real fields from database
        Schema::table('action_type_tests', function (Blueprint $table) {
            $table->dropColumn('at_category');
            $table->dropColumn('test_results');
            
            // Real Action Type Test fields based on database analysis
            $table->string('linker_rechter_voorkeur')->nullable(); // Links/Rechts/Niet ingevuld
            $table->string('duwen_trekken_voorkeur')->nullable(); // Duwen/Trekken/Niet ingevuld
            $table->string('roteren_lineair')->nullable(); // Roteren/Lineair/Niet ingevuld
            $table->string('starthouding')->nullable(); // Laag/Hoog/Niet ingevuld
            $table->string('snelheid_kracht')->nullable(); // Snelheid/Kracht/Niet ingevuld
            $table->string('individueel_groep')->nullable(); // Individueel/Groep/Niet ingevuld
            $table->string('stap_sprong')->nullable(); // Stap/Sprong/Niet ingevuld
            $table->string('enkele_meerdere_sprongen')->nullable(); // Enkele sprong/Meerdere sprongen/Niet ingevuld
            $table->string('explosief_gecontroleerd')->nullable(); // Explosief/Gecontroleerd/Niet ingevuld
            $table->string('balans_beweging')->nullable(); // Balans/Beweging/Niet ingevuld
            
            // Additional fields found in extended version
            $table->string('scharnierende_glijdende_gewrichten')->nullable();
            $table->string('continu_onderbroken_bewegingen')->nullable();
            $table->string('snelle_langzame_startreactie')->nullable();
            $table->string('verticale_horizontale_focus')->nullable();
            $table->string('visuele_proprioceptieve_orientatie')->nullable();
            $table->string('externe_interne_focus')->nullable();
            $table->string('losse_gespannen_bewegingen')->nullable();
            $table->string('motoroog_radaroog')->nullable();
            
            $table->string('at_categorie')->nullable(); // GEEN/TEST/ISFP etc.
        });

        // Update condition_tests table with real MSFT fields
        Schema::table('condition_tests', function (Blueprint $table) {
            $table->dropColumn('test_results');
            
            // Real MSFT Beeptest fields from database
            $table->integer('leeftijd')->nullable();
            $table->string('geslacht')->nullable(); // m/v
            $table->integer('level_behaald_niveau')->nullable();
            $table->integer('aantal_shuttles')->nullable();
            $table->integer('totaal_afstand_m')->nullable();
            $table->decimal('geschatte_vo2max', 5, 2)->nullable(); // ml/kg/min
            $table->string('classificatie')->nullable(); // goed/voldoende etc.
            $table->text('opmerkingen')->nullable();
        });

        // Update skill_assessments table with real fields
        Schema::table('skill_assessments', function (Blueprint $table) {
            // The existing technical skills fields are correct based on database analysis
            // Add the missing overall score and feedback fields
            $table->integer('overall_score')->default(6); // Overall score out of 10
            
            // Fysieke vaardigheden (keep existing physical_skills JSON but add specific field)
            $table->integer('fysieke_conditie')->default(5); // 5/10
            
            // Mentale vaardigheden (update mental_skills JSON with specific fields)  
            $table->integer('spelinzicht')->default(5); // 5/10
            $table->integer('teamwork')->default(5); // 5/10
            $table->integer('houding_attitude')->default(6); // 6/10
            
            // Feedback sections
            $table->text('sterke_punten')->nullable(); // Strong points
            $table->text('verbeterpunten')->nullable(); // Areas for improvement
            $table->text('coach_notities')->nullable(); // Coach notes
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('action_type_tests', function (Blueprint $table) {
            $table->dropColumn([
                'linker_rechter_voorkeur', 'duwen_trekken_voorkeur', 'roteren_lineair',
                'starthouding', 'snelheid_kracht', 'individueel_groep', 'stap_sprong',
                'enkele_meerdere_sprongen', 'explosief_gecontroleerd', 'balans_beweging',
                'scharnierende_glijdende_gewrichten', 'continu_onderbroken_bewegingen',
                'snelle_langzame_startreactie', 'verticale_horizontale_focus',
                'visuele_proprioceptieve_orientatie', 'externe_interne_focus',
                'losse_gespannen_bewegingen', 'motoroog_radaroog', 'at_categorie'
            ]);
            
            $table->string('at_category');
            $table->json('test_results');
        });

        Schema::table('condition_tests', function (Blueprint $table) {
            $table->dropColumn([
                'leeftijd', 'geslacht', 'level_behaald_niveau', 'aantal_shuttles',
                'totaal_afstand_m', 'geschatte_vo2max', 'classificatie', 'opmerkingen'
            ]);
            
            $table->json('test_results');
        });

        Schema::table('skill_assessments', function (Blueprint $table) {
            $table->dropColumn([
                'overall_score', 'fysieke_conditie', 'spelinzicht', 'teamwork',
                'houding_attitude', 'sterke_punten', 'verbeterpunten', 'coach_notities'
            ]);
        });
    }
};