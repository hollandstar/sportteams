import React, { useState, useEffect } from 'react';
import { Calendar, Target, User } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface PlayerSkillsAssessmentFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  players: Array<{ id: string; name: string }>;
}

interface TechnicalSkills {
  balbeheersing: number;
  pasnauwkeurigheid: number;
  schieten: number;
  aanvallen: number;
  verdedigen: number;
}

const PlayerSkillsAssessmentForm: React.FC<PlayerSkillsAssessmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  players = []
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    player_id: initialData?.player_id || '',
    assessment_date: initialData?.assessment_date || new Date().toISOString().split('T')[0],
    responses: initialData?.responses || {}
  });

  const [technicalSkills, setTechnicalSkills] = useState<TechnicalSkills>({
    balbeheersing: initialData?.balbeheersing || 5,
    pasnauwkeurigheid: initialData?.pasnauwkeurigheid || 5,
    schieten: initialData?.schieten || 5,
    aanvallen: initialData?.aanvallen || 5,
    verdedigen: initialData?.verdedigen || 5
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const skillLabels = {
    balbeheersing: 'Balbeheersing',
    pasnauwkeurigheid: 'Pasnauwkeurigheid', 
    schieten: 'Schieten',
    aanvallen: 'Aanvallen',
    verdedigen: 'Verdedigen'
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.player_id) {
      newErrors.player_id = 'Verplicht';
    }
    if (!formData.assessment_date) {
      newErrors.assessment_date = 'Verplicht';
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
        ...technicalSkills,
        responses: {
          ...formData.responses,
          ...technicalSkills,
          assessment_date: formData.assessment_date
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

  const handleSkillChange = (skill: keyof TechnicalSkills, value: number) => {
    setTechnicalSkills(prev => ({ ...prev, [skill]: value }));
  };

  const renderSkillSlider = (skill: keyof TechnicalSkills, label: string) => {
    const value = technicalSkills[skill];
    return (
      <div key={skill} className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <span className="text-sm text-blue-600 font-semibold">{value}/10</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={value}
            onChange={(e) => handleSkillChange(skill, parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${value * 10}%, #e5e7eb ${value * 10}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="bg-orange-100 p-3 rounded-lg mr-4">
          <Target className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Speler Vaardigheden Beoordeling
          </h2>
          <p className="text-sm text-gray-600">
            Beoordeel een speler op verschillende vaardigheden en aspecten van het spel.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Player Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecteer Speler
          </label>
          <div className="relative">
            <select
              value={formData.player_id}
              onChange={(e) => handleInputChange('player_id', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.player_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Kies een speler om te beoordelen</option>
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

        {/* Test Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Datum
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.assessment_date}
              onChange={(e) => handleInputChange('assessment_date', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.assessment_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          {errors.assessment_date && (
            <p className="mt-1 text-sm text-red-600">{errors.assessment_date}</p>
          )}
        </div>

        {/* Technical Skills Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Technische Vaardigheden
          </h3>
          
          {Object.entries(skillLabels).map(([skill, label]) =>
            renderSkillSlider(skill as keyof TechnicalSkills, label)
          )}
        </div>

        {/* Physical & Mental Skills Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fysieke & Mentale Vaardigheden
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Deze sectie kan worden uitgebreid met aanvullende beoordelingscriteria.
          </p>
          
          {/* Placeholder for Physical Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fysieke sterkte (optioneel)
              </label>
              <select className="w-full p-3 border border-gray-300 rounded-lg">
                <option value="">Selecteer niveau</option>
                <option value="excellent">Uitstekend</option>
                <option value="good">Goed</option>
                <option value="average">Gemiddeld</option>
                <option value="needs_improvement">Verbetering nodig</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mentale focus (optioneel)
              </label>
              <select className="w-full p-3 border border-gray-300 rounded-lg">
                <option value="">Selecteer niveau</option>
                <option value="excellent">Uitstekend</option>
                <option value="good">Goed</option>
                <option value="average">Gemiddeld</option>
                <option value="needs_improvement">Verbetering nodig</option>
              </select>
            </div>
          </div>
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
            {isSubmitting ? 'Opslaan...' : 'Beoordeling Opslaan'}
          </button>
        </div>
      </form>

      {/* Custom CSS for slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default PlayerSkillsAssessmentForm;