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
        Schema::create('form_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // 'condition_test', 'action_type_test', 'skill_assessment'
            $table->text('description')->nullable();
            $table->json('fields_config'); // JSON configuration of form fields
            $table->boolean('is_active')->default(false);
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            
            $table->index(['type', 'is_active']);
            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_templates');
    }
};