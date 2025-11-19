import React, { useState, useEffect } from 'react';
import { scenarioAPI } from '../services/api';
import type { Archetype, Industry, ScenarioPreview } from '../types';
import { Loader2, Building2, Factory, Info } from 'lucide-react';

interface ScenarioSelectorProps {
  onScenarioSelect: (archetypeId: string, industryId: string, companyName: string, productDescription: string) => void;
  selectedArchetype: string | null;
  selectedIndustry: string | null;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  onScenarioSelect,
  selectedArchetype,
  selectedIndustry,
}) => {
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [preview, setPreview] = useState<ScenarioPreview | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [_previewLoading, _setPreviewLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadScenarioData();
  }, []);

  useEffect(() => {
    if (selectedArchetype && selectedIndustry) {
      loadPreview(selectedArchetype, selectedIndustry);
    } else {
      setPreview(null);
    }
  }, [selectedArchetype, selectedIndustry]);

  const loadScenarioData = async () => {
    try {
      setLoading(true);
      const [archetypesRes, industriesRes] = await Promise.all([
        scenarioAPI.getArchetypes(),
        scenarioAPI.getIndustries(),
      ]);

      setArchetypes(archetypesRes.data.archetypes || []);
      setIndustries(industriesRes.data.industries || []);
      setError('');
    } catch (err: any) {
      setError('Failed to load scenario options');
      console.error('Error loading scenario data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async (archetypeId: string, industryId: string) => {
    try {
      _setPreviewLoading(true);
      const response = await scenarioAPI.getPreview(archetypeId, industryId);
      setPreview(response.data.scenario);
    } catch (err: any) {
      console.error('Error loading preview:', err);
    } finally {
      _setPreviewLoading(false);
    }
  };

  const handleSelect = (archetypeId: string, industryId: string) => {
    onScenarioSelect(archetypeId, industryId, companyName, productDescription);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Scenario Customization</h4>
            <p className="text-sm text-blue-800">
              Choose a company archetype and industry to create a unique game world. All teams will play within your chosen scenario.
            </p>
          </div>
        </div>
      </div>

      {/* Archetype Selection */}
      <div>
        <label className="label mb-3">
          <Building2 className="w-5 h-5 inline mr-2" />
          Company Archetype
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {archetypes.map((archetype) => (
            <button
              key={archetype.id}
              type="button"
              onClick={() => handleSelect(archetype.id, selectedIndustry || industries[0]?.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedArchetype === archetype.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 bg-white'
              }`}
            >
              <div className="text-3xl mb-2">{archetype.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-1">{archetype.name}</h4>
              <p className="text-sm text-gray-600">{archetype.description}</p>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100">
                  Starting: ${archetype.starting_cash.toLocaleString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Industry Selection */}
      <div>
        <label className="label mb-3">
          <Factory className="w-5 h-5 inline mr-2" />
          Industry Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {industries.map((industry) => (
            <button
              key={industry.id}
              type="button"
              onClick={() => handleSelect(selectedArchetype || archetypes[0]?.id, industry.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedIndustry === industry.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 bg-white'
              }`}
            >
              <div className="text-3xl mb-2">{industry.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-1">{industry.name}</h4>
              <p className="text-xs text-gray-600 line-clamp-2">{industry.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Company Details */}
      {selectedArchetype && selectedIndustry && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="companyName" className="label">
              Company Name (Optional)
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                handleSelect(selectedArchetype, selectedIndustry);
              }}
              className="input-field"
              placeholder="e.g., TechVenture Inc."
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave blank to let teams choose their own company names
            </p>
          </div>

          <div>
            <label htmlFor="productDescription" className="label">
              Product Description (Optional)
            </label>
            <input
              id="productDescription"
              type="text"
              value={productDescription}
              onChange={(e) => {
                setProductDescription(e.target.value);
                handleSelect(selectedArchetype, selectedIndustry);
              }}
              className="input-field"
              placeholder="e.g., AI-powered productivity tools"
            />
            <p className="text-sm text-gray-500 mt-1">
              Describe what the company produces or offers
            </p>
          </div>
        </div>
      )}

      {/* Scenario Preview */}
      {preview && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-indigo-900 mb-4">
            Scenario Preview: {preview.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Starting Conditions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Starting Cash:</span>
                  <span className="font-medium text-gray-900">
                    ${preview.starting_conditions.cash.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Team Size:</span>
                  <span className="font-medium text-gray-900">
                    {preview.starting_conditions.team_size} employees
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium text-gray-900">
                    {preview.archetype.difficulty_modifier}x
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Focus Areas</h4>
              <div className="flex flex-wrap gap-2">
                {preview.focus_areas.map((area, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {area}
                  </span>
                ))}
              </div>

              {preview.example_products.length > 0 && (
                <>
                  <h4 className="font-semibold text-gray-900 mt-4 mb-2">Example Products</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {preview.example_products.slice(0, 3).map((product, index) => (
                      <li key={index}>• {product}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-indigo-800 mt-4 italic">{preview.description}</p>
        </div>
      )}
    </div>
  );
};
