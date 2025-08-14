import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  ClipboardList, 
  Zap,
  TrendingUp,
  Target,
  Settings,
  BarChart3,
  Eye,
  Play,
  Pause
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface FormStats {
  totalUsers: number;
  activePlayers: number;
  skillAssessmentResults: number;
  actionTypeResults: number;
  conditionTestResults: number;
}

interface FormTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  is_active: boolean;
  responses_count?: number;
  created_at: string;
}

interface AdminDashboardProps {
  onCreateForm?: (type: string) => void;
  onViewForm?: (formId: string) => void;
  onToggleFormStatus?: (formId: string, isActive: boolean) => void;
  onViewResults?: (formId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onCreateForm,
  onViewForm,
  onToggleFormStatus,
  onViewResults
}) => {
  const { t } = useTranslation();
  
  const [stats, setStats] = useState<FormStats>({
    totalUsers: 46,
    activePlayers: 37,
    skillAssessmentResults: 21,
    actionTypeResults: 0,
    conditionTestResults: 4
  });

  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([
    {
      id: '1',
      name: 'Conditie Test - MSFT 20m beeptest',
      type: 'condition_test',
      description: 'MSFT (20m beeptest) en 30-15 IFT evaluatie',
      is_active: true,
      responses_count: 4,
      created_at: '2024-08-14'
    },
    {
      id: '2', 
      name: 'Action Type Test - Motorische testen',
      type: 'action_type_test',
      description: 'Action Type test evaluatie',
      is_active: true,
      responses_count: 0,
      created_at: '2024-08-14'
    },
    {
      id: '3',
      name: 'Speler Vaardigheden Beoordeling',
      type: 'skill_assessment',
      description: 'Beoordeel een speler op verschillende vaardigheden',
      is_active: true,
      responses_count: 21,
      created_at: '2024-08-14'
    }
  ]);

  const getFormIcon = (type: string) => {
    switch (type) {
      case 'condition_test':
        return <TrendingUp className="h-5 w-5" />;
      case 'action_type_test':
        return <Zap className="h-5 w-5" />;
      case 'skill_assessment':
        return <Target className="h-5 w-5" />;
      default:
        return <ClipboardList className="h-5 w-5" />;
    }
  };

  const getFormColor = (type: string) => {
    switch (type) {
      case 'condition_test':
        return 'text-red-600 bg-red-100';
      case 'action_type_test':
        return 'text-purple-600 bg-purple-100';
      case 'skill_assessment':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const handleToggleStatus = (formId: string) => {
    setFormTemplates(prev => 
      prev.map(form => 
        form.id === formId 
          ? { ...form, is_active: !form.is_active }
          : form
      )
    );
    
    const form = formTemplates.find(f => f.id === formId);
    if (form && onToggleFormStatus) {
      onToggleFormStatus(formId, !form.is_active);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Beheer formulieren en bekijk statistieken
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-6 mb-8 border-b border-gray-200">
        <button className="flex items-center space-x-2 pb-3 border-b-2 border-blue-500 text-blue-600">
          <BarChart3 className="h-4 w-4" />
          <span>Overzicht</span>
        </button>
        <button className="flex items-center space-x-2 pb-3 text-gray-500 hover:text-gray-700">
          <Settings className="h-4 w-4" />
          <span>Profiel</span>
        </button>
        <button className="flex items-center space-x-2 pb-3 text-gray-500 hover:text-gray-700">
          <Users className="h-4 w-4" />
          <span>Gebruikers</span>
        </button>
        <button className="flex items-center space-x-2 pb-3 text-gray-500 hover:text-gray-700">
          <UserCheck className="h-4 w-4" />
          <span>Spelers</span>
        </button>
        <button className="flex items-center space-x-2 pb-3 text-gray-500 hover:text-gray-700">
          <Users className="h-4 w-4" />
          <span>Teams</span>
        </button>
        <button className="flex items-center space-x-2 pb-3 text-gray-500 hover:text-gray-700">
          <Zap className="h-4 w-4" />
          <span>AT Codes</span>
        </button>
        <button className="flex items-center space-x-2 pb-3 text-gray-500 hover:text-gray-700">
          <ClipboardList className="h-4 w-4" />
          <span>Content</span>
        </button>
        <button className="flex items-center space-x-2 pb-3 text-gray-500 hover:text-gray-700">
          <Eye className="h-4 w-4" />
          <span>Demo's</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Players</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activePlayers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Skill Assessment Results</p>
              <p className="text-2xl font-bold text-gray-900">{stats.skillAssessmentResults}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Action Type Results</p>
              <p className="text-2xl font-bold text-gray-900">{stats.actionTypeResults}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Conditie Test Results</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conditionTestResults}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Player Skill Assessment */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Player Skill Assessment
                </h3>
                <p className="text-sm text-gray-600">21 responses</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Actief
              </span>
              <button
                onClick={() => handleToggleStatus('3')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Pause className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Beheer en bekijk skill assessments van spelers
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onViewForm?.('3')}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" />
              <span>Formulier Details</span>
            </button>
            <button
              onClick={() => onViewResults?.('3')}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Resultaten</span>
            </button>
          </div>
        </div>

        {/* Action Type Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Action Type Test
                </h3>
                <p className="text-sm text-gray-600">0 responses</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Actief formulier
              </span>
              <button
                onClick={() => handleToggleStatus('2')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Pause className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Beheer en bekijk action type tests
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onViewForm?.('2')}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" />
              <span>Formulier Details</span>
            </button>
            <button
              onClick={() => onViewResults?.('2')}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Resultaten</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Condition Test Card */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Conditie Test Results
                </h3>
                <p className="text-sm text-gray-600">4 responses</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Actief formulier
              </span>
              <button
                onClick={() => handleToggleStatus('1')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Pause className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Beheer en bekijk conditie test resultaten
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onViewForm?.('1')}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" />
              <span>Formulier Details</span>
            </button>
            <button
              onClick={() => onViewResults?.('1')}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Resultaten</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => onCreateForm?.('new')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Nieuw Formulier Aanmaken
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;