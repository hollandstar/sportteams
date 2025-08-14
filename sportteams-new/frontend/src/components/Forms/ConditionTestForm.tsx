import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, User } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface ConditionTestFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  players: Array<{ id: string; name: string }>;
  teams: Array<{ id: string; name: string }>;
}

const ConditionTestForm: React.FC<ConditionTestFormProps> = ({
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
    test_date: initialData?.test_date || new Date().toISOString().split('T')[0],
    
    // Real MSFT (20m beeptest) fields from database analysis
    leeftijd: initialData?.leeftijd || '',
    geslacht: initialData?.geslacht || '',
    level_behaald_niveau: initialData?.level_behaald_niveau || '',
    aantal_shuttles: initialData?.aantal_shuttles || '',
    totaal_afstand_m: initialData?.totaal_afstand_m || '',
    geschatte_vo2max: initialData?.geschatte_vo2max || '',
    classificatie: initialData?.classificatie || '',
    opmerkingen: initialData?.opmerkingen || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const geslachtOptions = ['', 'm', 'v'];
  const classificatieOptions = ['', 'uitstekend', 'goed', 'voldoende', 'onvoldoende'];

  // Auto-fill team when player is selected
  useEffect(() => {
    if (formData.player_id && players.length > 0) {
      const selectedPlayer = players.find(p => p.id === formData.player_id);
      if (selectedPlayer && teams.length > 0) {
        setFormData(prev => ({ ...prev, team_id: teams[0]?.id || '' }));
      }
    }
  }, [formData.player_id, players, teams]);

  // Calculate VO2max when level and shuttles change
  useEffect(() => {
    if (formData.level_behaald_niveau && formData.aantal_shuttles) {
      const level = parseInt(formData.level_behaald_niveau);
      const shuttles = parseInt(formData.aantal_shuttles);
      
      if (level && shuttles) {
        // Simplified VO2max calculation (real calculation would be more complex)
        const vo2max = 15.3 * level + 0.2 * shuttles - 0.5;
        setFormData(prev => ({ 
          ...prev, 
          geschatte_vo2max: vo2max.toFixed(2),
          totaal_afstand_m: ((level - 1) * 8 * 20 + shuttles * 20).toString()
        }));
      }
    }
  }, [formData.level_behaald_niveau, formData.aantal_shuttles]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.player_id) {
      newErrors.player_id = 'Verplicht';
    }
    if (!formData.team_id) {
      newErrors.team_id = 'Verplicht';
    }
    if (!formData.test_date) {
      newErrors.test_date = 'Verplicht';
    }
    if (!formData.leeftijd || parseInt(formData.leeftijd) < 5 || parseInt(formData.leeftijd) > 100) {
      newErrors.leeftijd = 'Geldige leeftijd vereist (5-100)';
    }
    if (!formData.geslacht) {
      newErrors.geslacht = 'Verplicht';
    }
    if (!formData.level_behaald_niveau || parseInt(formData.level_behaald_niveau) < 1) {
      newErrors.level_behaald_niveau = 'Level moet minimaal 1 zijn';
    }
    if (!formData.aantal_shuttles || parseInt(formData.aantal_shuttles) < 1) {
      newErrors.aantal_shuttles = 'Aantal shuttles moet minimaal 1 zijn';
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

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="bg-red-100 p-3 rounded-lg mr-4">
          <TrendingUp className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">MSFT (20m beeptest)</h2>
          <p className="text-sm text-gray-600">
            Multi-Stage Fitness Test - 20 meter beeptest evaluatie
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speler naam <span className="text-red-500">*</span>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.team_id}
              onChange={(e) => handleInputChange('team_id', e.target.value)}
              className={`w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.team_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Auto-ingevuld</option>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Datum <span className="text-red-500">*</span>
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
        </div>

        {/* MSFT Specific Fields - Based on Real Database Data */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            MSFT (20m BEEPTEST) RESULTATEN
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leeftijd <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={formData.leeftijd}
                onChange={(e) => handleInputChange('leeftijd', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.leeftijd ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Bijv. 15"
              />
              {errors.leeftijd && (
                <p className="mt-1 text-sm text-red-600">{errors.leeftijd}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geslacht <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.geslacht}
                onChange={(e) => handleInputChange('geslacht', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.geslacht ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecteer</option>
                <option value="m">Man</option>
                <option value="v">Vrouw</option>
              </select>
              {errors.geslacht && (
                <p className="mt-1 text-sm text-red-600">{errors.geslacht}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level (behaald niveau) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="25"
                value={formData.level_behaald_niveau}
                onChange={(e) => handleInputChange('level_behaald_niveau', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.level_behaald_niveau ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Bijv. 12"
              />
              {errors.level_behaald_niveau && (
                <p className="mt-1 text-sm text-red-600">{errors.level_behaald_niveau}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aantal Shuttles <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={formData.aantal_shuttles}
                onChange={(e) => handleInputChange('aantal_shuttles', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.aantal_shuttles ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Bijv. 24"
              />
              {errors.aantal_shuttles && (
                <p className="mt-1 text-sm text-red-600">{errors.aantal_shuttles}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Totaal Afstand (m)
              </label>
              <input
                type="number"
                value={formData.totaal_afstand_m}
                onChange={(e) => handleInputChange('totaal_afstand_m', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Automatisch berekend"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geschatte VO₂max (ml/kg/min)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.geschatte_vo2max}
                onChange={(e) => handleInputChange('geschatte_vo2max', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Automatisch berekend"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classificatie
              </label>
              <select
                value={formData.classificatie}
                onChange={(e) => handleInputChange('classificatie', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {classificatieOptions.map((option) => (
                  <option key={option} value={option}>
                    {option || '—'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opmerkingen
            </label>
            <textarea
              value={formData.opmerkingen}
              onChange={(e) => handleInputChange('opmerkingen', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Aanvullende opmerkingen over de test..."
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
            {isSubmitting ? 'Opslaan...' : 'Test Resultaten Opslaan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConditionTestForm;