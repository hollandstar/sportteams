import React, { useState, useEffect } from 'react';
import { Calendar, Target, User } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface PlayerSkillsAssessmentFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  players: Array<{ id: string; name: string }>;
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
    
    // Technische vaardigheden (based on real database data)
    balbeheersing: initialData?.balbeheersing || 5,
    pasnauwkeurigheid: initialData?.pasnauwkeurigheid || 5,
    schieten: initialData?.schieten || 5,
    aanvallen: initialData?.aanvallen || 5,
    verdedigen: initialData?.verdedigen || 5,
    
    // Fysieke vaardigheden
    fysieke_conditie: initialData?.fysieke_conditie || 5,
    
    // Mentale vaardigheden
    spelinzicht: initialData?.spelinzicht || 5,
    teamwork: initialData?.teamwork || 5,
    houding_attitude: initialData?.houding_attitude || 6,
    
    // Overall score (calculated automatically)
    overall_score: initialData?.overall_score || 6,
    
    // Feedback sections
    sterke_punten: initialData?.sterke_punten || '',
    verbeterpunten: initialData?.verbeterpunten || '',
    coach_notities: initialData?.coach_notities || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const technicalSkillLabels = {
    balbeheersing: 'Balbeheersing',
    pasnauwkeurigheid: 'Passnauwkeurigheid', 
    schieten: 'Schieten',
    aanvallen: 'Aanvallen',
    verdedigen: 'Verdedigen'
  };

  // Auto-calculate overall score when skills change
  useEffect(() => {
    const technicalAvg = (formData.balbeheersing + formData.pasnauwkeurigheid + formData.schieten + 
                         formData.aanvallen + formData.verdedigen) / 5;
    const fysiekAvg = formData.fysieke_conditie;
    const mentalAvg = (formData.spelinzicht + formData.teamwork + formData.houding_attitude) / 3;
    
    const overallScore = Math.round((technicalAvg + fysiekAvg + mentalAvg) / 3);
    setFormData(prev => ({ ...prev, overall_score: overallScore }));
  }, [formData.balbeheersing, formData.pasnauwkeurigheid, formData.schieten, 
      formData.aanvallen, formData.verdedigen, formData.fysieke_conditie,
      formData.spelinzicht, formData.teamwork, formData.houding_attitude]);

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
        responses: formData
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

  const handleSkillChange = (skill: string, value: number) => {
    setFormData(prev => ({ ...prev, [skill]: value }));
  };

  const renderSkillSlider = (skill: string, label: string, value: number) => {
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
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="bg-orange-100 p-3 rounded-lg mr-4">
          <Target className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Vaardigheden (Techniek & Skills)
          </h2>
          <p className="text-sm text-gray-600">
            Complete speler beoordeling gebaseerd op technische, fysieke en mentale vaardigheden
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            Terug naar overzicht
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecteer Speler <span className="text-red-500">*</span>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Datum <span className="text-red-500">*</span>
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
        </div>

        {/* Technical Skills Section - Based on Real Database Structure */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Technische vaardigheden
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(technicalSkillLabels).map(([skill, label]) =>
              <div key={skill}>
                {renderSkillSlider(skill, label, formData[skill as keyof typeof formData] as number)}
              </div>
            )}
          </div>
        </div>

        {/* Physical Skills Section */}
        <div className="border rounded-lg p-6 bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fysieke vaardigheden
          </h3>
          
          {renderSkillSlider('fysieke_conditie', 'Fysieke conditie', formData.fysieke_conditie)}
        </div>

        {/* Mental Skills Section */}
        <div className="border rounded-lg p-6 bg-green-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Mentale vaardigheden
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSkillSlider('spelinzicht', 'Spelinzicht', formData.spelinzicht)}
            {renderSkillSlider('teamwork', 'Teamwork', formData.teamwork)}
            {renderSkillSlider('houding_attitude', 'Houding/Attitude', formData.houding_attitude)}
          </div>
        </div>

        {/* Overall Score Display */}
        <div className="border rounded-lg p-6 bg-yellow-50">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              OVERALL SCORE: {formData.overall_score}/10
            </h3>
            <p className="text-sm text-gray-600">Automatisch berekend uit alle vaardigheden</p>
          </div>
        </div>

        {/* Feedback Sections - Based on Real Database Structure */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              STERKE PUNTEN
            </label>
            <textarea
              value={formData.sterke_punten}
              onChange={(e) => handleInputChange('sterke_punten', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Beschrijf de sterke punten van de speler..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              VERBETERPUNTEN
            </label>
            <textarea
              value={formData.verbeterpunten}
              onChange={(e) => handleInputChange('verbeterpunten', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Beschrijf de verbeterpunten voor de speler..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              COACH NOTITIES
            </label>
            <textarea
              value={formData.coach_notities}
              onChange={(e) => handleInputChange('coach_notities', e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Aanvullende notities van de coach..."
            />
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