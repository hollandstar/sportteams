<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FormTemplate;
use App\Models\User;

class FormTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user via profile relationship
        $adminProfile = \DB::table('profiles')->where('role', 'admin')->first();
        if (!$adminProfile) {
            $this->command->error('No admin profile found. Please create an admin user first.');
            return;
        }
        
        $adminUser = User::find($adminProfile->user_id);
        if (!$adminUser) {
            $this->command->error('Admin user not found for admin profile.');
            return;
        }

        // Create Condition Test Form Template
        FormTemplate::create([
            'name' => 'Conditie Test - MSFT 20m beeptest',
            'type' => 'condition_test',
            'description' => 'Configureer en beheer conditie tests - MSFT (20m beeptest) en 30-15 IFT evaluatie',
            'fields_config' => [
                'player_name' => [
                    'type' => 'select',
                    'label' => 'Speler naam',
                    'required' => true,
                    'validation' => 'required'
                ],
                'team' => [
                    'type' => 'text',
                    'label' => 'Team',
                    'required' => true,
                    'auto_fill' => true,
                    'validation' => 'required'
                ],
                'condition_test' => [
                    'type' => 'select',
                    'label' => 'Conditie test',
                    'options' => [
                        '30-15 IFT',
                        'Yo-Yo Test Level 1',
                        'Yo-Yo Test Level 2',
                        'Cooper Test',
                        'MSFT 20m beeptest'
                    ],
                    'required' => true,
                    'validation' => 'required'
                ],
                'test_date' => [
                    'type' => 'date',
                    'label' => 'Test Datum',
                    'required' => true,
                    'validation' => 'required|date'
                ]
            ],
            'is_active' => true,
            'created_by' => $adminUser->id,
        ]);

        // Create Action Type Test Form Template
        FormTemplate::create([
            'name' => 'Action Type Test - Motorische testen',
            'type' => 'action_type_test',
            'description' => 'Configureer en beheer action type tests - Motorische test evaluatie',
            'fields_config' => [
                'player_name' => [
                    'type' => 'select',
                    'label' => 'Player name',
                    'required' => true,
                    'validation' => 'required'
                ],
                'team' => [
                    'type' => 'text',
                    'label' => 'Team',
                    'required' => true,
                    'auto_fill' => true,
                    'validation' => 'required'
                ],
                'at_category' => [
                    'type' => 'select',
                    'label' => 'AT categorie',
                    'options' => [
                        'Motorische testen A',
                        'Motorische testen B',
                        'Motorische testen C',
                        'Agility Tests',
                        'Speed Tests'
                    ],
                    'required' => false
                ],
                'test_date' => [
                    'type' => 'date',
                    'label' => 'Test Datum',
                    'required' => true,
                    'validation' => 'required|date'
                ]
            ],
            'is_active' => true,
            'created_by' => $adminUser->id,
        ]);

        // Create Player Skills Assessment Form Template
        FormTemplate::create([
            'name' => 'Speler Vaardigheden Beoordeling',
            'type' => 'skill_assessment',
            'description' => 'Beoordeel een speler op verschillende vaardigheden en aspecten van het spel',
            'fields_config' => [
                'player_selection' => [
                    'type' => 'select',
                    'label' => 'Selecteer Speler',
                    'required' => true,
                    'validation' => 'required'
                ],
                'test_date' => [
                    'type' => 'date',
                    'label' => 'Test Datum',
                    'required' => true,
                    'validation' => 'required|date'
                ],
                'technical_skills' => [
                    'type' => 'section',
                    'label' => 'Technische Vaardigheden',
                    'fields' => [
                        'balbeheersing' => [
                            'type' => 'range',
                            'label' => 'Balbeheersing',
                            'min' => 0,
                            'max' => 10,
                            'default' => 5,
                            'validation' => 'integer|min:0|max:10'
                        ],
                        'pasnauwkeurigheid' => [
                            'type' => 'range',
                            'label' => 'Pasnauwkeurigheid',
                            'min' => 0,
                            'max' => 10,
                            'default' => 5,
                            'validation' => 'integer|min:0|max:10'
                        ],
                        'schieten' => [
                            'type' => 'range',
                            'label' => 'Schieten',
                            'min' => 0,
                            'max' => 10,
                            'default' => 5,
                            'validation' => 'integer|min:0|max:10'
                        ],
                        'aanvallen' => [
                            'type' => 'range',
                            'label' => 'Aanvallen',
                            'min' => 0,
                            'max' => 10,
                            'default' => 5,
                            'validation' => 'integer|min:0|max:10'
                        ],
                        'verdedigen' => [
                            'type' => 'range',
                            'label' => 'Verdedigen',
                            'min' => 0,
                            'max' => 10,
                            'default' => 5,
                            'validation' => 'integer|min:0|max:10'
                        ]
                    ]
                ],
                'physical_mental_skills' => [
                    'type' => 'section',
                    'label' => 'Fysieke & Mentale Vaardigheden',
                    'fields' => [
                        'physical_skills' => [
                            'type' => 'json',
                            'label' => 'Physical Skills',
                            'validation' => 'json'
                        ],
                        'mental_skills' => [
                            'type' => 'json',
                            'label' => 'Mental Skills',
                            'validation' => 'json'
                        ]
                    ]
                ]
            ],
            'is_active' => true,
            'created_by' => $adminUser->id,
        ]);

        $this->command->info('Created 3 form templates successfully');
    }
}
