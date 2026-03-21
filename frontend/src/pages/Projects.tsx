import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Project {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const { logout } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/v1/projects/');
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/v1/projects/', { name: newProjectName });
      setNewProjectName('');
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Projects</h1>
        <button onClick={logout} style={{ padding: '8px 16px' }}>Logout</button>
      </div>

      <form onSubmit={createProject} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="New project name"
          style={{ padding: '8px', marginRight: '10px', width: '300px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Create</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {projects.map((project) => (
          <li key={project.id} style={{ padding: '10px', border: '1px solid #ddd', marginBottom: '10px' }}>
            <strong>{project.name}</strong>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Created: {new Date(project.created_at).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
