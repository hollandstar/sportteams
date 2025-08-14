<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class FormTemplateController extends Controller
{
    /**
     * Display a listing of form templates (Admin only)
     */
    public function index(Request $request): JsonResponse
    {
        // Only admins can view all form templates
        if ($request->get('user_role') !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $forms = FormTemplate::with('creator')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $forms
        ]);
    }

    /**
     * Get active forms (accessible by all authenticated users)
     */
    public function getActiveForms(): JsonResponse
    {
        $forms = FormTemplate::active()->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data' => $forms
        ]);
    }

    /**
     * Store a newly created form template (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        // Only admins can create form templates
        if ($request->get('user_role') !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:condition_test,action_type_test,skill_assessment',
            'description' => 'nullable|string',
            'fields_config' => 'required|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $formTemplate = FormTemplate::create([
            'name' => $request->name,
            'type' => $request->type,
            'description' => $request->description,
            'fields_config' => $request->fields_config,
            'is_active' => $request->is_active ?? false,
            'created_by' => $request->get('user_id'),
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $formTemplate->load('creator')
        ], 201);
    }

    /**
     * Display the specified form template
     */
    public function show(Request $request, FormTemplate $formTemplate): JsonResponse
    {
        // Admins can see all forms, others can only see active forms
        if ($request->get('user_role') !== 'admin' && !$formTemplate->is_active) {
            return response()->json(['error' => 'Form not found or not active'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $formTemplate->load('creator')
        ]);
    }

    /**
     * Update the specified form template (Admin only)
     */
    public function update(Request $request, FormTemplate $formTemplate): JsonResponse
    {
        // Only admins can update form templates
        if ($request->get('user_role') !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'type' => 'string|in:condition_test,action_type_test,skill_assessment',
            'description' => 'nullable|string',
            'fields_config' => 'array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $formTemplate->update($request->only(['name', 'type', 'description', 'fields_config', 'is_active']));

        return response()->json([
            'status' => 'success',
            'data' => $formTemplate->load('creator')
        ]);
    }

    /**
     * Toggle form active status (Admin only)
     */
    public function toggleActive(Request $request, FormTemplate $formTemplate): JsonResponse
    {
        // Only admins can toggle form status
        if ($request->get('user_role') !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $formTemplate->update(['is_active' => !$formTemplate->is_active]);

        return response()->json([
            'status' => 'success',
            'data' => $formTemplate,
            'message' => 'Form status updated successfully'
        ]);
    }

    /**
     * Remove the specified form template (Admin only)
     */
    public function destroy(Request $request, FormTemplate $formTemplate): JsonResponse
    {
        // Only admins can delete form templates
        if ($request->get('user_role') !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if form has any responses
        if ($formTemplate->responses()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot delete form template with existing responses'
            ], 400);
        }

        $formTemplate->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Form template deleted successfully'
        ]);
    }

    /**
     * Get form statistics (Admin only)
     */
    public function getStatistics(Request $request): JsonResponse
    {
        if ($request->get('user_role') !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $stats = [
            'total_forms' => FormTemplate::count(),
            'active_forms' => FormTemplate::where('is_active', true)->count(),
            'condition_test_responses' => \DB::table('form_responses')
                ->join('form_templates', 'form_responses.form_template_id', '=', 'form_templates.id')
                ->where('form_templates.type', 'condition_test')
                ->count(),
            'action_type_test_responses' => \DB::table('form_responses')
                ->join('form_templates', 'form_responses.form_template_id', '=', 'form_templates.id')
                ->where('form_templates.type', 'action_type_test')
                ->count(),
            'skill_assessment_responses' => \DB::table('form_responses')
                ->join('form_templates', 'form_responses.form_template_id', '=', 'form_templates.id')
                ->where('form_templates.type', 'skill_assessment')
                ->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }
}