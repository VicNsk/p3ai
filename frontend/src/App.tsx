import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Projects } from './pages/Projects';  // ← Добавить импорт

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
          <Route path="/" element={<Navigate to="/projects" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
