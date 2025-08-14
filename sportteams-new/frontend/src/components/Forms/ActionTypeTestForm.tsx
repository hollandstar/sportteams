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
    test_date: initialData?.test_date || new Date().toISOString().split('T')[0],
    
    // Core Action Type Test fields from real data
    linker_rechter_voorkeur: initialData?.linker_rechter_voorkeur || '',
    duwen_trekken_voorkeur: initialData?.duwen_trekken_voorkeur || '',
    roteren_lineair: initialData?.roteren_lineair || '',
    starthouding: initialData?.starthouding || '',
    snelheid_kracht: initialData?.snelheid_kracht || '',
    individueel_groep: initialData?.individueel_groep || '',
    stap_sprong: initialData?.stap_sprong || '',
    enkele_meerdere_sprongen: initialData?.enkele_meerdere_sprongen || '',
    explosief_gecontroleerd: initialData?.explosief_gecontroleerd || '',
    balans_beweging: initialData?.balans_beweging || '',
    
    // Extended fields from advanced version
    scharnierende_glijdende_gewrichten: initialData?.scharnierende_glijdende_gewrichten || '',
    continu_onderbroken_bewegingen: initialData?.continu_onderbroken_bewegingen || '',
    snelle_langzame_startreactie: initialData?.snelle_langzame_startreactie || '',
    verticale_horizontale_focus: initialData?.verticale_horizontale_focus || '',
    visuele_proprioceptieve_orientatie: initialData?.visuele_proprioceptieve_orientatie || '',
    externe_interne_focus: initialData?.externe_interne_focus || '',
    losse_gespannen_bewegingen: initialData?.losse_gespannen_bewegingen || '',
    motoroog_radaroog: initialData?.motoroog_radaroog || '',
    
    at_categorie: initialData?.at_categorie || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options based on real database values
  const fieldOptions = {
    linker_rechter_voorkeur: ['', 'Links', 'Rechts', 'Niet ingevuld'],
    duwen_trekken_voorkeur: ['', 'Duwen', 'Trekken', 'Niet ingevuld'],
    roteren_lineair: ['', 'Roteren', 'Lineair', 'Niet ingevuld'],
    starthouding: ['', 'Laag', 'Hoog', 'Niet ingevuld'],
    snelheid_kracht: ['', 'Snelheid', 'Kracht', 'Niet ingevuld'],
    individueel_groep: ['', 'Individueel', 'Groep', 'Niet ingevuld'],
    stap_sprong: ['', 'Stap', 'Sprong', 'Niet ingevuld'],
    enkele_meerdere_sprongen: ['', 'Enkele sprong', 'Meerdere sprongen', 'Niet ingevuld'],
    explosief_gecontroleerd: ['', 'Explosief', 'Gecontroleerd', 'Niet ingevuld'],
    balans_beweging: ['', 'Balans', 'Beweging', 'Niet ingevuld'],
    scharnierende_glijdende_gewrichten: ['', 'Scharnierende', 'Glijdende', 'Niet ingevuld'],
    continu_onderbroken_bewegingen: ['', 'Continu', 'Onderbroken', 'Niet ingevuld'],
    snelle_langzame_startreactie: ['', 'Snelle', 'Langzame', 'Niet ingevuld'],
    verticale_horizontale_focus: ['', 'Verticaal', 'Horizontaal', 'Niet ingevuld'],
    visuele_proprioceptieve_orientatie: ['', 'Visueel', 'Proprioceptief', 'Niet ingevuld'],
    externe_interne_focus: ['', 'Extern', 'Intern', 'Niet ingevuld'],
    losse_gespannen_bewegingen: ['', 'Los', 'Gespannen', 'Niet ingevuld'],
    motoroog_radaroog: ['', 'Sterk', 'Gemiddeld', 'Zwak', 'Niet ingevuld']
  };

  const atCategories = ['', 'GEEN', 'TEST', 'ISFP'];

  // Auto-fill team when player is selected
  useEffect(() => {
    if (formData.player_id && players.length > 0) {
      const selectedPlayer = players.find(p => p.id === formData.player_id);
      if (selectedPlayer && teams.length > 0) {
        setFormData(prev => ({ ...prev, team_id: teams[0]?.id || '' }));
      }
    }
  }, [formData.player_id, players, teams]);

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

  const renderSelectField = (fieldName: string, label: string, options: string[], required = false) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={formData[fieldName as keyof typeof formData] as string}
        onChange={(e) => handleInputChange(fieldName, e.target.value)}
        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          errors[fieldName] ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option || '—'}
          </option>
        ))}
      </select>
      {errors[fieldName] && (
        <p className="mt-1 text-sm text-red-600">{errors[fieldName]}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="bg-purple-100 p-3 rounded-lg mr-4">
          <Zap className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Action Type Test</h2>
          <p className="text-sm text-gray-600">
            Complete motorische test evaluatie gebaseerd op werkelijke database velden
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

        {/* Core Action Type Fields - Based on Real Database Data */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ACTION TYPE TEST RESULTATEN
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSelectField('linker_rechter_voorkeur', '1. Linker/Rechter voorkeur', fieldOptions.linker_rechter_voorkeur)}
            {renderSelectField('duwen_trekken_voorkeur', '2. Duwen/Trekken voorkeur', fieldOptions.duwen_trekken_voorkeur)}
            {renderSelectField('roteren_lineair', '3. Roteren/Lineair', fieldOptions.roteren_lineair)}
            {renderSelectField('starthouding', '4. Starthouding (Laag/Hoog)', fieldOptions.starthouding)}
            {renderSelectField('snelheid_kracht', '5. Snelheid/Kracht', fieldOptions.snelheid_kracht)}
            {renderSelectField('individueel_groep', '6. Individueel/Groep', fieldOptions.individueel_groep)}
            {renderSelectField('stap_sprong', '7. Stap/Sprong', fieldOptions.stap_sprong)}
            {renderSelectField('enkele_meerdere_sprongen', '8. Enkele/Meerdere sprongen', fieldOptions.enkele_meerdere_sprongen)}
            {renderSelectField('explosief_gecontroleerd', '9. Explosief/Gecontroleerd', fieldOptions.explosief_gecontroleerd)}
            {renderSelectField('balans_beweging', '10. Balans/Beweging', fieldOptions.balans_beweging)}
          </div>
        </div>

        {/* Extended Fields */}
        <div className="border rounded-lg p-6 bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Uitgebreide Analyse (Optioneel)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSelectField('scharnierende_glijdende_gewrichten', '5. Scharnierende/Glijdende gewrichten', fieldOptions.scharnierende_glijdende_gewrichten)}
            {renderSelectField('continu_onderbroken_bewegingen', '7. Continu/Onderbroken bewegingen', fieldOptions.continu_onderbroken_bewegingen)}
            {renderSelectField('snelle_langzame_startreactie', '8. Snelle/Langzame startreactie', fieldOptions.snelle_langzame_startreactie)}
            {renderSelectField('verticale_horizontale_focus', '9. Verticale/Horizontale focus', fieldOptions.verticale_horizontale_focus)}
            {renderSelectField('visuele_proprioceptieve_orientatie', '10. Visuele/Proprioceptieve oriëntatie', fieldOptions.visuele_proprioceptieve_orientatie)}
            {renderSelectField('externe_interne_focus', '11. Externe/Interne focus', fieldOptions.externe_interne_focus)}
            {renderSelectField('losse_gespannen_bewegingen', '12. Losse/Gespannen bewegingen', fieldOptions.losse_gespannen_bewegingen)}
            {renderSelectField('motoroog_radaroog', '21. Motoroog (radaroog)', fieldOptions.motoroog_radaroog)}
          </div>
        </div>

        {/* AT Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AT Categorie
          </label>
          <select
            value={formData.at_categorie}
            onChange={(e) => handleInputChange('at_categorie', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {atCategories.map((category) => (
              <option key={category} value={category}>
                {category || '—'}
              </option>
            ))}
          </select>
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