import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, HelpCircle, X } from 'lucide-react';
import { demoMode } from '../services/demo-mode';

export default function DemoModeToggle() {
  const [isDemo, setIsDemo] = useState(demoMode.isEnabled());
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleDemoModeChange = (event: CustomEvent) => {
      setIsDemo(event.detail.enabled);
    };

    window.addEventListener('demo-mode-changed', handleDemoModeChange as EventListener);

    return () => {
      window.removeEventListener('demo-mode-changed', handleDemoModeChange as EventListener);
    };
  }, []);

  const handleToggle = () => {
    demoMode.toggle();
    // Reload page to apply changes
    window.location.reload();
  };

  const credentials = demoMode.getDemoCredentials();

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2">
          {/* Help Button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
            title="Demo Mode Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Demo Mode Toggle */}
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-lg transition-all ${
              isDemo
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
            title={isDemo ? 'Switch to Real Mode' : 'Switch to Demo Mode'}
          >
            {isDemo ? (
              <>
                <Eye className="w-5 h-5" />
                <span>Demo Mode</span>
              </>
            ) : (
              <>
                <EyeOff className="w-5 h-5" />
                <span>Real Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Demo Mode Guide</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* What is Demo Mode */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">What is Demo Mode?</h3>
                <p className="text-gray-600">
                  Demo Mode lets you test the complete BusinessCaise application without setting up a backend
                  server or database. All data is simulated in the browser using mock services.
                </p>
              </div>

              {/* Status Indicator */}
              <div className={`p-4 rounded-lg ${isDemo ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                <p className="font-semibold text-gray-900 mb-1">Current Mode:</p>
                <p className={`text-lg font-bold ${isDemo ? 'text-green-700' : 'text-gray-700'}`}>
                  {isDemo ? '🟢 Demo Mode (Mock Data)' : '⚫ Real Mode (Backend Required)'}
                </p>
              </div>

              {/* Demo Credentials */}
              {isDemo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">Demo Credentials</h3>

                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-blue-900">Game Master Account:</p>
                      <div className="mt-1 font-mono text-sm bg-white p-2 rounded border border-blue-200">
                        <p>Email: {credentials.gameMaster.email}</p>
                        <p>Password: {credentials.gameMaster.password}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-blue-900">Player Account 1:</p>
                      <div className="mt-1 font-mono text-sm bg-white p-2 rounded border border-blue-200">
                        <p>Email: {credentials.player1.email}</p>
                        <p>Password: {credentials.player1.password}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-blue-900">Player Account 2:</p>
                      <div className="mt-1 font-mono text-sm bg-white p-2 rounded border border-blue-200">
                        <p>Email: {credentials.player2.email}</p>
                        <p>Password: {credentials.player2.password}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* What's Pre-loaded */}
              {isDemo && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Pre-loaded Demo Data</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>1 active game: "Demo Business Simulation - Winter 2025"</li>
                    <li>3 teams: Alpha Innovators, Beta Strategists, Gamma Disruptors</li>
                    <li>10 sessions (Monday-Friday AM/PM), Session 1 is active</li>
                    <li>3 submissions: 1 scored, 2 pending review</li>
                    <li>Real-time WebSocket simulation with automatic updates</li>
                  </ul>
                </div>
              )}

              {/* How to Test */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">How to Test</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>
                    <strong>Game Master Flow:</strong>
                    <ul className="list-disc list-inside ml-5 mt-1">
                      <li>Login with GM credentials</li>
                      <li>View dashboard with existing game</li>
                      <li>Unlock sessions</li>
                      <li>Review and score submissions</li>
                      <li>Monitor leaderboard</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Player Flow:</strong>
                    <ul className="list-disc list-inside ml-5 mt-1">
                      <li>Login with player credentials</li>
                      <li>Join the demo game (ID: game-demo-001)</li>
                      <li>Create or join a team</li>
                      <li>Submit decisions with file uploads</li>
                      <li>View real-time metrics updates</li>
                      <li>Check leaderboard rankings</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Multi-User Testing:</strong>
                    <ul className="list-disc list-inside ml-5 mt-1">
                      <li>Open multiple browser windows</li>
                      <li>Login as GM in one window</li>
                      <li>Login as different players in other windows</li>
                      <li>Test real-time synchronization</li>
                    </ul>
                  </li>
                </ol>
              </div>

              {/* Features Available */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Available Features in Demo Mode</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="text-sm">Authentication</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="text-sm">Game creation</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="text-sm">Team management</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="text-sm">Session unlocking</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="text-sm">Decision submission</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="text-sm">File uploads (simulated)</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="text-sm">Scoring system</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="text-sm">Real-time updates</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="text-sm">Leaderboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="text-sm">Metrics calculation</span>
                  </div>
                </div>
              </div>

              {/* Limitations */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-yellow-900 mb-2">Limitations</h3>
                <ul className="list-disc list-inside space-y-1 text-yellow-800 text-sm">
                  <li>Data resets on page refresh</li>
                  <li>Files not actually saved to disk</li>
                  <li>No persistence across browser sessions</li>
                  <li>Network delays are simulated (300-1000ms)</li>
                  <li>Real-time events have slight delay (100ms)</li>
                </ul>
              </div>

              {/* Switching Modes */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Switching Modes</h3>
                <p className="text-gray-600 mb-2">
                  Click the mode toggle button to switch between Demo and Real modes. The page will reload to apply changes.
                </p>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> Real Mode requires backend server and database setup. See TESTING_GUIDE.md for full setup instructions.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
