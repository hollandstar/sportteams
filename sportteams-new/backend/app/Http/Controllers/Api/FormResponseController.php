<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormTemplate;
use App\Models\FormResponse;
use App\Models\ConditionTest;
use App\Models\ActionTypeTest;
use App\Models\SkillAssessment;
use App\Models\User;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class FormResponseController extends Controller
{
    /**
     * Display a listing of form responses
     */
    public function index(Request $request): JsonResponse
    {
        $query = FormResponse::with(['template', 'player', 'team', 'submittedBy']);

        // Role-based filtering
        $userRole = $request->get('user_role');
        $userId = $request->get('user_id');
        
        if ($userRole === 'admin') {
            // Admins can see all responses
        } elseif ($userRole === 'team_admin') {
            // Team admins can only see responses from their teams
            // For now, we'll allow all since we don't have team admin relationships set up
        } elseif ($userRole === 'coach') {
            // Coaches can see responses for teams they coach
        } else {
            // Players can only see their own responses
            $query->where('player_id', $userId);
        }

        // Filter by form template if specified
        if ($request->has('form_template_id')) {
            $query->where('form_template_id', $request->form_template_id);
        }

        // Filter by player if specified
        if ($request->has('player_id') && $userRole !== 'player') {
            $query->where('player_id', $request->player_id);
        }

        // Filter by team if specified
        if ($request->has('team_id') && $userRole === 'admin') {
            $query->where('team_id', $request->team_id);
        }

        $responses = $query->orderBy('submitted_at', 'desc')->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $responses
        ]);
    }

    /**
     * Store a newly created form response
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'form_template_id' => 'required|exists:form_templates,id',
            'player_id' => 'required|exists:users,id',
            'team_id' => 'required|exists:teams,id',
            'responses' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if form template is active
        $formTemplate = FormTemplate::find($request->form_template_id);
        if (!$formTemplate->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Form is not currently active'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Create form response
            $formResponse = FormResponse::create([
                'form_template_id' => $request->form_template_id,
                'player_id' => $request->player_id,
                'team_id' => $request->team_id,
                'responses' => $request->responses,
                'submitted_by' => $request->get('user_id'),
                'submitted_at' => now(),
            ]);

            // Create specific test record based on form type
            $this->createSpecificTestRecord($formTemplate, $formResponse, $request->responses);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'data' => $formResponse->load(['template', 'player', 'team', 'submittedBy']),
                'message' => 'Form submitted successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'status' => 'error',
                'message' => 'Error submitting form: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified form response
     */
    public function show(FormResponse $formResponse): JsonResponse
    {
        // Check permissions
        if (!$this->canViewResponse($formResponse)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $formResponse->load(['template', 'player', 'team', 'submittedBy', 'conditionTest', 'actionTypeTest', 'skillAssessment']);

        return response()->json([
            'status' => 'success',
            'data' => $formResponse
        ]);
    }

    /**
     * Update the specified form response
     */
    public function update(Request $request, FormResponse $formResponse): JsonResponse
    {
        // Only allow updates within 24 hours and by admin or the submitter
        if (
            $formResponse->submitted_at->diffInHours(now()) > 24 &&
            Auth::user()->role !== 'admin'
        ) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot update form response after 24 hours'
            ], 400);
        }

        if (
            Auth::id() !== $formResponse->submitted_by &&
            Auth::user()->role !== 'admin'
        ) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'responses' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $formResponse->update(['responses' => $request->responses]);

            // Update specific test record
            $this->updateSpecificTestRecord($formResponse, $request->responses);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'data' => $formResponse->load(['template', 'player', 'team', 'submittedBy']),
                'message' => 'Form updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'status' => 'error',
                'message' => 'Error updating form: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified form response
     */
    public function destroy(FormResponse $formResponse): JsonResponse
    {
        // Only admin can delete form responses
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            DB::beginTransaction();

            // Delete specific test records first
            $formResponse->conditionTest()?->delete();
            $formResponse->actionTypeTest()?->delete();
            $formResponse->skillAssessment()?->delete();

            $formResponse->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Form response deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'status' => 'error',
                'message' => 'Error deleting form response: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create specific test record based on form type
     */
    private function createSpecificTestRecord(FormTemplate $template, FormResponse $response, array $responses): void
    {
        switch ($template->type) {
            case 'condition_test':
                ConditionTest::create([
                    'form_response_id' => $response->id,
                    'player_id' => $response->player_id,
                    'team_id' => $response->team_id,
                    'test_type' => $responses['test_type'] ?? '30-15 IFT',
                    'test_results' => $responses,
                    'test_date' => $responses['test_date'] ?? now()->toDateString(),
                    'tested_by' => $response->submitted_by,
                ]);
                break;

            case 'action_type_test':
                ActionTypeTest::create([
                    'form_response_id' => $response->id,
                    'player_id' => $response->player_id,
                    'team_id' => $response->team_id,
                    'at_category' => $responses['at_category'] ?? '',
                    'test_results' => $responses,
                    'test_date' => $responses['test_date'] ?? now()->toDateString(),
                    'tested_by' => $response->submitted_by,
                ]);
                break;

            case 'skill_assessment':
                SkillAssessment::create([
                    'form_response_id' => $response->id,
                    'player_id' => $response->player_id,
                    'team_id' => $response->team_id,
                    'balbeheersing' => $responses['balbeheersing'] ?? 5,
                    'pasnauwkeurigheid' => $responses['pasnauwkeurigheid'] ?? 5,
                    'schieten' => $responses['schieten'] ?? 5,
                    'aanvallen' => $responses['aanvallen'] ?? 5,
                    'verdedigen' => $responses['verdedigen'] ?? 5,
                    'physical_skills' => $responses['physical_skills'] ?? null,
                    'mental_skills' => $responses['mental_skills'] ?? null,
                    'assessment_date' => $responses['assessment_date'] ?? now()->toDateString(),
                    'assessed_by' => $response->submitted_by,
                ]);
                break;
        }
    }

    /**
     * Update specific test record
     */
    private function updateSpecificTestRecord(FormResponse $response, array $responses): void
    {
        switch ($response->template->type) {
            case 'condition_test':
                $response->conditionTest?->update([
                    'test_type' => $responses['test_type'] ?? '30-15 IFT',
                    'test_results' => $responses,
                    'test_date' => $responses['test_date'] ?? $response->conditionTest->test_date,
                ]);
                break;

            case 'action_type_test':
                $response->actionTypeTest?->update([
                    'at_category' => $responses['at_category'] ?? '',
                    'test_results' => $responses,
                    'test_date' => $responses['test_date'] ?? $response->actionTypeTest->test_date,
                ]);
                break;

            case 'skill_assessment':
                $response->skillAssessment?->update([
                    'balbeheersing' => $responses['balbeheersing'] ?? 5,
                    'pasnauwkeurigheid' => $responses['pasnauwkeurigheid'] ?? 5,
                    'schieten' => $responses['schieten'] ?? 5,
                    'aanvallen' => $responses['aanvallen'] ?? 5,
                    'verdedigen' => $responses['verdedigen'] ?? 5,
                    'physical_skills' => $responses['physical_skills'] ?? null,
                    'mental_skills' => $responses['mental_skills'] ?? null,
                    'assessment_date' => $responses['assessment_date'] ?? $response->skillAssessment->assessment_date,
                ]);
                break;
        }
    }

    /**
     * Check if user can view response
     */
    private function canViewResponse(FormResponse $response): bool
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'team_admin') {
            $managedTeamIds = $user->managedTeams()->pluck('teams.id');
            return $managedTeamIds->contains($response->team_id);
        }

        if ($user->role === 'player') {
            return $user->id === $response->player_id;
        }

        // Coaches - implement based on your team structure
        return true;
    }
}