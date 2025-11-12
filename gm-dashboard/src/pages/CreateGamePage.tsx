import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import { ScenarioSelector } from '../components/ScenarioSelector';
import { ArrowLeft, Save, Layers, Award } from 'lucide-react';

export const CreateGamePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Scenario fields
  const [archetypeId, setArchetypeId] = useState<string | null>(null);
  const [industryId, setIndustryId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [productDescription, setProductDescription] = useState('');

  // Pod competition fields
  const [enablePods, setEnablePods] = useState(false);
  const [podSize, setPodSize] = useState(4);
  const [podAssignmentMethod, setPodAssignmentMethod] = useState<'random' | 'manual' | 'balanced'>('random');
  const [enableCategoryAwards, setEnableCategoryAwards] = useState(true);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleScenarioSelect = (
    archetype: string,
    industry: string,
    company: string,
    product: string
  ) => {
    setArchetypeId(archetype);
    setIndustryId(industry);
    setCompanyName(company);
    setProductDescription(product);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await gameAPI.createGame({
        title,
        description: description || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        archetype_id: archetypeId || undefined,
        industry_id: industryId || undefined,
        company_name: companyName || undefined,
        product_description: productDescription || undefined,
        enable_pods: enablePods,
        pod_size: enablePods ? podSize : undefined,
        pod_assignment_method: enablePods ? podAssignmentMethod : undefined,
        enable_category_awards: enableCategoryAwards,
      });

      navigate(`/games/${response.data.game.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/games')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Game</h1>
          <p className="text-gray-600 mt-1">Set up a new business simulation</p>
        </div>
      </div>

      <div className="card">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="label">
                  Game Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Fall 2024 Business Simulation"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Give your game a descriptive title
                </p>
              </div>

              <div>
                <label htmlFor="description" className="label">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Describe the game objectives, context, or any special instructions for teams..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Provide additional context for teams
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="label">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: When teams can start
                  </p>
                </div>

                <div>
                  <label htmlFor="endDate" className="label">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field"
                    min={startDate || undefined}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: Deadline for completion
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Scenario Customization */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Scenario Customization (Optional)</h2>
            <ScenarioSelector
              onScenarioSelect={handleScenarioSelect}
              selectedArchetype={archetypeId}
              selectedIndustry={industryId}
            />
          </section>

          {/* Pod Competition Settings */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Layers className="w-6 h-6 mr-2 text-indigo-600" />
              Pod Competition (Optional)
            </h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  id="enablePods"
                  type="checkbox"
                  checked={enablePods}
                  onChange={(e) => setEnablePods(e.target.checked)}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="enablePods" className="ml-3">
                  <span className="text-sm font-medium text-gray-900">Enable Pod Competition</span>
                  <p className="text-sm text-gray-500">
                    Divide teams into smaller groups (pods) for more focused competition. Ideal for large classes.
                  </p>
                </label>
              </div>

              {enablePods && (
                <div className="ml-7 space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="podSize" className="label">
                        Pod Size
                      </label>
                      <input
                        id="podSize"
                        type="number"
                        min="3"
                        max="10"
                        value={podSize}
                        onChange={(e) => setPodSize(parseInt(e.target.value))}
                        className="input-field"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Number of teams per pod (3-10 recommended)
                      </p>
                    </div>

                    <div>
                      <label htmlFor="podAssignment" className="label">
                        Assignment Method
                      </label>
                      <select
                        id="podAssignment"
                        value={podAssignmentMethod}
                        onChange={(e) => setPodAssignmentMethod(e.target.value as 'random' | 'manual' | 'balanced')}
                        className="input-field"
                      >
                        <option value="random">Random (Default)</option>
                        <option value="manual">Manual Assignment</option>
                        <option value="balanced">Balanced (Beta)</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        How teams should be assigned to pods
                      </p>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <p className="text-sm text-indigo-800">
                      <strong>Pod Competition Benefits:</strong> Reduces leaderboard clustering in large classes,
                      increases engagement through focused rivalry, and provides multiple winners.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Category Awards Settings */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-indigo-600" />
              Category Awards
            </h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  id="enableCategoryAwards"
                  type="checkbox"
                  checked={enableCategoryAwards}
                  onChange={(e) => setEnableCategoryAwards(e.target.checked)}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="enableCategoryAwards" className="ml-3">
                  <span className="text-sm font-medium text-gray-900">Enable Category Awards</span>
                  <p className="text-sm text-gray-500">
                    Teams can win in multiple categories: Financial Excellence, Operations Leader, Marketing Champion, Best Employer, Customer Favorite, and Overall Winner.
                  </p>
                </label>
              </div>

              {enableCategoryAwards && (
                <div className="ml-7 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Award Categories:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <div>💰 Financial Excellence</div>
                    <div>⚙️ Operations Leader</div>
                    <div>📣 Marketing Champion</div>
                    <div>👥 Best Employer</div>
                    <div>😊 Customer Favorite</div>
                    <div>🏆 Overall Winner</div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 10 sessions will be automatically created (Monday-Friday, AM/PM)</li>
              <li>• Game will be created in "setup" status</li>
              <li>• You can customize sessions before starting</li>
              <li>• Teams can join once you provide them with the game details</li>
              {enablePods && <li>• You can assign teams to pods after they join</li>}
              {archetypeId && industryId && <li>• Teams will play within your chosen scenario</li>}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Creating...' : 'Create Game'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
