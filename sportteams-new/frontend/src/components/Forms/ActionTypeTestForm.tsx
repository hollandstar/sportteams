import React, { useState, useEffect } from 'react';
import { Calendar, Zap, User } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface ActionTypeTestFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  players: Array<{ id: string; name: string }>;
  teams: Array<{ id: string; name: string }>;
}

const ActionTypeTestForm: React.FC<ActionTypeTestFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  players = [],
  teams = []
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    player_id: initialData?.player_id || '',
    team_id: initialData?.team_id || '',
    at_category: initialData?.at_category || '',
    test_date: initialData?.test_date || new Date().toISOString().split('T')[0],
    responses: initialData?.responses || {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const atCategories = [
    'Motorische testen A',
    'Motorische testen B',
    'Motorische testen C',
    'Agility Tests',
    'Speed Tests',
    'Coordination Tests'
  ];

  // Auto-fill team when player is selected
  useEffect(() => {
    if (formData.player_id && players.length > 0) {
      const selectedPlayer = players.find(p => p.id === formData.player_id);
      if (selectedPlayer && teams.length > 0) {
        // For now, default to first team - in real app, get player's team
        setFormData(prev => ({ ...prev, team_id: teams[0]?.id || '' }));
      }
    }
  }, [formData.player_id, players, teams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.player_id) {
      newErrors.player_id = 'Required';
    }
    if (!formData.team_id) {
      newErrors.team_id = 'Required';
    }
    if (!formData.test_date) {
      newErrors.test_date = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        responses: {
          ...formData.responses,
          at_category: formData.at_category,
          test_date: formData.test_date
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="bg-purple-100 p-3 rounded-lg mr-4">
          <Zap className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Action Type Test</h2>
          <p className="text-sm text-gray-600">
            Configureer en beheer action type tests
          </p>
        </div>
        <button
          onClick={onCancel}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          Terug naar overzicht
        </button>
      </div>

      {/* Motorische testen illustration */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6 flex items-center">
        <div className="flex space-x-1 mr-4">
          <div className="w-8 h-12 bg-blue-400 rounded"></div>
          <div className="w-8 h-12 bg-red-400 rounded"></div>
          <div className="w-8 h-12 bg-yellow-400 rounded"></div>
          <div className="w-8 h-12 bg-green-400 rounded"></div>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Motorische testen</h3>
          <p className="text-sm text-gray-600">Action Type test evaluatie</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Player Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Player name
          </label>
          <div className="relative">
            <select
              value={formData.player_id}
              onChange={(e) => handleInputChange('player_id', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.player_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecteer speler</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
            <User className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          {errors.player_id && (
            <p className="mt-1 text-sm text-red-600">{errors.player_id}</p>
          )}
        </div>

        {/* Team */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team
          </label>
          <select
            value={formData.team_id}
            onChange={(e) => handleInputChange('team_id', e.target.value)}
            className={`w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.team_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Wordt automatisch ingevuld bij speler selectie</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          {errors.team_id && (
            <p className="mt-1 text-sm text-red-600">{errors.team_id}</p>
          )}
        </div>

        {/* AT Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AT categorie
          </label>
          <select
            value={formData.at_category}
            onChange={(e) => handleInputChange('at_category', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">—</option>
            {atCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Test Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Datum
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.test_date}
              onChange={(e) => handleInputChange('test_date', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.test_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          {errors.test_date && (
            <p className="mt-1 text-sm text-red-600">{errors.test_date}</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Annuleren
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Opslaan...' : 'Test Opslaan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActionTypeTestForm;