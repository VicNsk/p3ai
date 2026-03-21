import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/projects/');
      setProjects(response.data);
      setError('');
    } catch (err: any) {
      setError('Не удалось загрузить проекты');
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      await api.post('/v1/projects/', { name: newProjectName });
      setNewProjectName('');
      fetchProjects(); // Обновить список
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось создать проект');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && projects.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      {/* Шапка */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <h1 style={{ margin: 0 }}>Мои проекты</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Выйти
        </button>
      </div>

      {/* Форма создания */}
      <form onSubmit={createProject} style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="Название нового проекта"
          disabled={submitting}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button
          type="submit"
          disabled={submitting || !newProjectName.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: submitting ? '#90a4ae' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontWeight: 500
          }}
        >
          {submitting ? 'Создание...' : 'Создать'}
        </button>
      </form>

      {/* Сообщения об ошибках */}
      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {/* Список проектов */}
      {projects.length === 0 && !loading ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px'
        }}>
          <p>У вас пока нет проектов</p>
          <p style={{ fontSize: '14px' }}>Создайте первый проект, чтобы начать работу</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {projects.map((project) => (
            <li
              key={project.id}
              style={{
                padding: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '12px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              onClick={() => navigate(`/projects/${project.id}/board`)}
            >
              <div style={{ fontWeight: 600, fontSize: '18px', marginBottom: '4px' }}>
                {project.name}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                Создан: {new Date(project.created_at).toLocaleDateString('ru-RU')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
