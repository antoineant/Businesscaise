import { useState, useEffect } from 'react';
import { GameState, Team, DepartmentImpact } from './types/game';
import { gameDecisions } from './data/gameData';
import { applyImpacts, calculateTeamScore } from './utils/gameEngine';
import TeamSetup from './components/TeamSetup';
import DepartmentDashboard from './components/DepartmentDashboard';
import DecisionView from './components/DecisionView';
import Leaderboard from './components/Leaderboard';

const STORAGE_KEY = 'businesscaise-game-state';

function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved game state');
      }
    }

    // Default state
    return {
      currentWeek: 1,
      teams: [],
      decisions: gameDecisions,
      gameStarted: false,
      gameEnded: false,
    };
  });

  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'setup' | 'game' | 'leaderboard'>('setup');

  // Save to localStorage whenever game state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const currentTeam = gameState.teams.find(t => t.id === currentTeamId);
  const currentDecision = gameState.decisions.find(d => d.week === gameState.currentWeek);

  const handleCreateTeam = (team: Team) => {
    setGameState(prev => ({
      ...prev,
      teams: [...prev.teams, team],
    }));
    setCurrentTeamId(team.id);
  };

  const handleSelectTeam = (teamId: string) => {
    setCurrentTeamId(teamId);
    setCurrentView('game');
  };

  const handleSubmitDecision = (subDecisionId: string, value: any, fileData?: any) => {
    if (!currentTeamId) return;

    const subDecision = currentDecision?.subDecisions.find(sd => sd.id === subDecisionId);
    if (!subDecision) return;

    // Calculate impacts
    let impacts: DepartmentImpact[] = [];

    if (subDecision.type === 'numeric' && subDecision.numericConfig) {
      impacts = subDecision.numericConfig.impactCalculator(value);
    } else if (subDecision.type === 'multiple-choice' && subDecision.options) {
      const option = subDecision.options.find(opt => opt.value === value);
      if (option) {
        impacts = option.impacts;
      }
    }

    setGameState(prev => {
      const updatedTeams = prev.teams.map(team => {
        if (team.id === currentTeamId) {
          // Add submission
          const newSubmission = {
            teamId: team.id,
            decisionId: currentDecision!.id,
            subDecisionId,
            timestamp: new Date().toISOString(),
            value,
            fileData,
          };

          // Apply impacts to metrics
          const newMetrics = applyImpacts(team.metrics, impacts);

          // Apply minimum impacts if this is the first sub-decision
          const isFirstSubmission = team.submissions.filter(
            s => s.decisionId === currentDecision!.id
          ).length === 0;

          const finalMetrics = isFirstSubmission
            ? applyImpacts(newMetrics, currentDecision!.minimumImpact)
            : newMetrics;

          return {
            ...team,
            submissions: [...team.submissions, newSubmission],
            metrics: finalMetrics,
            overallScore: calculateTeamScore(finalMetrics),
          };
        }
        return team;
      });

      return {
        ...prev,
        teams: updatedTeams,
      };
    });
  };

  const handleNextWeek = () => {
    if (gameState.currentWeek < 5) {
      setGameState(prev => ({
        ...prev,
        currentWeek: prev.currentWeek + 1,
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        gameEnded: true,
      }));
    }
  };

  const handleResetGame = () => {
    if (confirm('Are you sure you want to reset the entire game? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">BusinessCaise</h1>
              <p className="text-sm text-gray-600 mt-1">Strategic Business Simulation Game</p>
            </div>

            {gameState.teams.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Week</div>
                  <div className="text-2xl font-bold text-primary-600">
                    {gameState.currentWeek} / 5
                  </div>
                </div>

                {currentTeam && (
                  <div className="text-right border-l pl-4">
                    <div className="text-sm text-gray-600">Your Score</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {calculateTeamScore(currentTeam.metrics)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      {currentTeamId && (
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentView('game')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  currentView === 'game'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 Current Decision
              </button>
              <button
                onClick={() => setCurrentView('leaderboard')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  currentView === 'leaderboard'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏆 Leaderboard
              </button>
              <button
                onClick={() => setCurrentView('setup')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  currentView === 'setup'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👥 Teams
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'setup' && (
          <div className="space-y-8">
            <TeamSetup
              teams={gameState.teams}
              onCreateTeam={handleCreateTeam}
              onSelectTeam={handleSelectTeam}
              currentTeamId={currentTeamId || undefined}
            />

            {gameState.teams.length > 0 && (
              <div className="card bg-blue-50 border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-gray-800 mb-3">🎮 How to Play</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• <strong>5 Week Challenge:</strong> Make strategic decisions over 5 weeks</p>
                  <p>• <strong>5 Departments:</strong> Every decision affects Marketing, Sales, R&D, Finance, and HR</p>
                  <p>• <strong>Multiple Decision Types:</strong> Numeric inputs, PDF uploads for creative work, and strategic choices</p>
                  <p>• <strong>Team Competition:</strong> Compete with other teams for the highest overall score</p>
                  <p>• <strong>Real Consequences:</strong> Your choices have lasting impacts on your business metrics</p>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'game' && currentTeam && currentDecision && (
          <div className="space-y-8">
            {/* Department Dashboard */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Company Performance</h2>
              <DepartmentDashboard metrics={currentTeam.metrics} />
            </div>

            {/* Current Decision */}
            <DecisionView
              decision={currentDecision}
              team={currentTeam}
              onSubmit={handleSubmitDecision}
            />

            {/* Week Navigation */}
            {gameState.currentWeek < 5 && (
              <div className="card bg-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">Ready for Week {gameState.currentWeek + 1}?</h3>
                    <p className="text-sm text-gray-600">
                      Make sure your team has made all necessary decisions before advancing.
                    </p>
                  </div>
                  <button onClick={handleNextWeek} className="btn-primary">
                    Advance to Week {gameState.currentWeek + 1} →
                  </button>
                </div>
              </div>
            )}

            {gameState.currentWeek === 5 && (
              <div className="card bg-green-50 border-l-4 border-green-500">
                <h3 className="text-xl font-bold text-green-900 mb-2">🎉 Final Week Complete!</h3>
                <p className="text-green-800 mb-4">
                  You've completed all 5 weeks of the business simulation. Check the leaderboard to see how your team performed!
                </p>
                <button
                  onClick={() => setCurrentView('leaderboard')}
                  className="btn-primary"
                >
                  View Final Results
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'leaderboard' && (
          <div className="space-y-8">
            <Leaderboard teams={gameState.teams} currentTeamId={currentTeamId || undefined} />

            {currentTeam && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Final Metrics</h2>
                <DepartmentDashboard metrics={currentTeam.metrics} />
              </div>
            )}
          </div>
        )}

        {/* Admin Controls */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex gap-4">
            <button
              onClick={handleResetGame}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Reset Game (Admin)
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            BusinessCaise - A comprehensive business strategy simulation for students
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
