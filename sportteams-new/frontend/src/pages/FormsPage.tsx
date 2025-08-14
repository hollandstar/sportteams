import React, { useState, useEffect } from 'react';
import { 
  ConditionTestForm, 
  ActionTypeTestForm, 
  PlayerSkillsAssessmentForm,
  AdminDashboard,
  FormTemplate 
} from '../components/Forms';
import { apiService } from '../services/api';
import { useAppSelector } from '../hooks/redux';

type ActiveView = 'dashboard' | 'condition_test' | 'action_type_test' | 'skill_assessment';

const FormsPage: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
  const [selectedFormTemplate, setSelectedFormTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  // Mock data for players and teams - in real app, fetch from API
  const [players] = useState([
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
    { id: '4', name: 'Sarah Wilson' }
  ]);

  const [teams] = useState([
    { id: '1', name: 'Team A' },
    { id: '2', name: 'Team B' }
  ]);

  useEffect(() => {
    if (isAdmin) {
      loadFormTemplates();
    } else {
      loadActiveFormTemplates();
    }
  }, [isAdmin]);

  const loadFormTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getFormTemplates();
      if (response.status === 'success') {
        setFormTemplates(response.data);
      }
    } catch (err) {
      console.error('Failed to load form templates:', err);
      setError('Failed to load form templates');
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveFormTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getActiveFormTemplates();
      if (response.status === 'success') {
        setFormTemplates(response.data);
      }
    } catch (err) {
      console.error('Failed to load active form templates:', err);
      setError('Failed to load active form templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = {
        form_template_id: selectedFormTemplate?.id || '1',
        player_id: data.player_id,
        team_id: data.team_id || teams[0]?.id,
        responses: data.responses || data
      };

      const response = await apiService.submitFormResponse(formData);
      
      if (response.status === 'success') {
        alert('Form submitted successfully!');
        setActiveView('dashboard');
      } else {
        throw new Error(response.message || 'Failed to submit form');
      }
    } catch (err) {
      console.error('Failed to submit form:', err);
      setError('Failed to submit form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFormStatus = async (formId: string, isActive: boolean) => {
    try {
      const response = await apiService.toggleFormTemplateStatus(formId);
      if (response.status === 'success') {
        loadFormTemplates();
      }
    } catch (err) {
      console.error('Failed to toggle form status:', err);
      setError('Failed to update form status');
    }
  };

  const handleCreateForm = (type: string) => {
    alert('Create form feature will be implemented');
  };

  const handleViewForm = (formId: string) => {
    const template = formTemplates.find(t => t.id === formId);
    if (template) {
      setSelectedFormTemplate(template);
      setActiveView(template.type as ActiveView);
    }
  };

  const handleViewResults = (formId: string) => {
    alert('View results feature will be implemented');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'condition_test':
        return (
          <ConditionTestForm
            onSubmit={handleFormSubmit}
            onCancel={() => setActiveView('dashboard')}
            players={players}
            teams={teams}
          />
        );
      
      case 'action_type_test':
        return (
          <ActionTypeTestForm
            onSubmit={handleFormSubmit}
            onCancel={() => setActiveView('dashboard')}
            players={players}
            teams={teams}
          />
        );
      
      case 'skill_assessment':
        return (
          <PlayerSkillsAssessmentForm
            onSubmit={handleFormSubmit}
            onCancel={() => setActiveView('dashboard')}
            players={players}
          />
        );
      
      default:
        if (isAdmin) {
          return (
            <AdminDashboard
              onCreateForm={handleCreateForm}
              onViewForm={handleViewForm}
              onToggleFormStatus={handleToggleFormStatus}
              onViewResults={handleViewResults}
            />
          );
        } else {
          return (
            <div className="min-h-screen bg-gray-50 p-6">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Available Forms</h1>
                
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading forms...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                    <button 
                      onClick={() => loadActiveFormTemplates()}
                      className="mt-2 text-red-700 underline hover:text-red-800"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {formTemplates.map((template) => (
                      <div key={template.id} className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {template.description}
                        </p>
                        <button
                          onClick={() => handleViewForm(template.id)}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                        >
                          Fill Out Form
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderActiveView()}
    </div>
  );
};

export default FormsPage;