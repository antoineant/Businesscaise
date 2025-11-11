import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GamesListPage } from './pages/GamesListPage';
import { CreateGamePage } from './pages/CreateGamePage';
import { GameDetailsPage } from './pages/GameDetailsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TeamDetailsPage } from './pages/TeamDetailsPage';
import { SessionEditPage } from './pages/SessionEditPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { SubmissionDetailsPage } from './pages/SubmissionDetailsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/games" replace />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <Layout>
                  <GamesListPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateGamePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/:gameId"
            element={
              <ProtectedRoute>
                <Layout>
                  <GameDetailsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/:gameId/leaderboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <LeaderboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/:gameId/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <AnalyticsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/:gameId/teams/:teamId"
            element={
              <ProtectedRoute>
                <Layout>
                  <TeamDetailsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/:gameId/sessions/:sessionId/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <SessionEditPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/:gameId/submissions"
            element={
              <ProtectedRoute>
                <Layout>
                  <SubmissionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/:gameId/submissions/:submissionId"
            element={
              <ProtectedRoute>
                <Layout>
                  <SubmissionDetailsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/games" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
