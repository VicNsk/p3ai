import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Projects } from './pages/Projects';
import { Board } from './pages/Board';
import { ProjectMetaCards } from './pages/ProjectMetaCards';
import { ProjectHistory } from './pages/ProjectHistory';
import { AISettings } from './pages/AISettings';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';

function App() {
  const { isAuthenticated, token, userId } = useAuth();
  // Отладка: логировать состояние авторизации
  useEffect(() => {
    console.log('🔐 App: auth state changed', {
      isAuthenticated,
      tokenPreview: token ? `${token.slice(0, 20)}...` : null,
      userId
    });
  }, [isAuthenticated, token, userId]);

  return (
    <AuthProvider>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />  // ← Заменить заглушку на компонент
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/board"
            element={
              <ProtectedRoute>
                <Board />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/meta"
            element={
              <ProtectedRoute>
                <ProjectMetaCards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/history"
            element={
              <ProtectedRoute>
                <ProjectHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/ai"
            element={
              <ProtectedRoute>
                <AISettings />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/projects" />} />
        </Routes>

    </AuthProvider>
  );
}

export default App;
