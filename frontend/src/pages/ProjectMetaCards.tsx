import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MetaCardEditor } from '../components/MetaCardEditor';
import type { MetaCardType } from '../components/MetaCardEditor';
interface MetaCardsData {
  why: any | null;
  requirements: any | null;
  stakeholders: any | null;
}

const metaCardConfig: Record<MetaCardType, { title: string; description: string }> = {
  why: {
    title: 'Зачем этот проект? (Why)',
    description: 'Обоснование, цели, ожидаемые выгоды. Почему проект стоит делать именно сейчас?'
  },
  requirements: {
    title: 'Требования (Requirements)',
    description: 'Критерии успеха, функциональные и нефункциональные требования к результату.'
  },
  stakeholders: {
    title: 'Заинтересованные лица (Stakeholders)',
    description: 'Кто влияет на проект и кто зависит от его результата? Их роли и ожидания.'
  }
};

export function ProjectMetaCards() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [metaCards, setMetaCards] = useState<MetaCardsData>({
    why: null,
    requirements: null,
    stakeholders: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchMetaCards();
    }
  }, [projectId]);

  const fetchMetaCards = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/meta-cards/project/${projectId}`);
      setMetaCards(response.data);
      setError('');

      // Если карточки не созданы — инициализировать
      if (!response.data.why || !response.data.requirements || !response.data.stakeholders) {
        await api.post(`/v1/meta-cards/initialize?project_id=${projectId}`);
        // Перезагрузить данные после инициализации
        const refreshed = await api.get(`/v1/meta-cards/project/${projectId}`);
        setMetaCards(refreshed.data);
      }
    } catch (err: any) {
      setError('Не удалось загрузить мета-карточки');
      console.error('Fetch meta-cards error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Шапка */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>Мета-карточки проекта</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/projects/${projectId}/board`)}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: '#e0e0e0',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            ← Доска задач
          </button>
          <button
            onClick={() => navigate('/projects')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: '#e0e0e0',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Все проекты
          </button>
        </div>
      </div>

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

      {/* Инфо-блок */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        marginBottom: '24px',
        fontSize: '13px',
        color: '#1565c0'
      }}>
        <strong>💡 Подсказка:</strong> Мета-карточки помогают сфокусироваться на сути проекта.
        Заполните их перед началом активной работы над задачами.
      </div>

      {/* Редакторы мета-карточек */}
      {(['why', 'requirements', 'stakeholders'] as MetaCardType[]).map((type) => (
        <MetaCardEditor
          key={type}
          type={type}
          title={metaCardConfig[type].title}
          description={metaCardConfig[type].description}
          projectId={parseInt(projectId || '0')}
          initialContent={metaCards[type]?.content || ''}
          cardId={metaCards[type]?.id}
        />
      ))}
    </div>
  );
}
