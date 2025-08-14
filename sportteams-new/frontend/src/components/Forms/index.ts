// Form Components
export { default as ConditionTestForm } from './ConditionTestForm';
export { default as ActionTypeTestForm } from './ActionTypeTestForm';
export { default as PlayerSkillsAssessmentForm } from './PlayerSkillsAssessmentForm';
export { default as AdminDashboard } from './AdminDashboard';

// Form Types
export interface FormSubmissionData {
  form_template_id: string;
  player_id: string;
  team_id: string;
  responses: Record<string, any>;
}

export interface FormTemplate {
  id: string;
  name: string;
  type: 'condition_test' | 'action_type_test' | 'skill_assessment';
  description: string;
  fields_config: Record<string, any>;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FormResponse {
  id: string;
  form_template_id: string;
  player_id: string;
  team_id: string;
  responses: Record<string, any>;
  submitted_by: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}