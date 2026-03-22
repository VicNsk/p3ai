import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MetaCardEditor } from '../components/MetaCardEditor';
import type { MetaCardType } from '../components/MetaCardEditor';
import { AIGenerateButton } from '../components/AIGenerateButton';
import { getErrorMessage } from '../utils/errorHandler';

interface MetaCardsData {
  why: any | null;
  requirements: any | null;
  stakeholders: any | null;
}

interface Project {
  id: number;
  name: string;
  description?: string;
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

  const [project, setProject] = useState<Project | null>(null);
  const [metaCards, setMetaCards] = useState<MetaCardsData>({
    why: null,
    requirements: null,
    stakeholders: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchMetaCards();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/v1/projects/${projectId}`);
      setProject(response.data);
    } catch (err: any) {
      console.error('Fetch project error:', err);
    }
  };

  const fetchMetaCards = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/meta-cards/project/${projectId}`);
      setMetaCards(response.data);
      setError('');

      // Если карточки не созданы — инициализировать
      if (!response.data.why || !response.data.requirements || !response.data.stakeholders) {
        await api.post(`/v1/meta-cards/initialize?project_id=${projectId}`);
        const refreshed = await api.get(`/v1/meta-cards/project/${projectId}`);
        setMetaCards(refreshed.data);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
      console.error('Fetch meta-cards error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContentGenerated = async (type: MetaCardType, content: string) => {
    const card = metaCards[type];
    try {
      if (card?.id) {
        // Обновление существующей карточки
        await api.put(`/v1/meta-cards/${card.id}`, { content });
      } else {
        // Создание новой карточки
        await api.post('/v1/meta-cards/', {
          type,
          content,
          project_id: parseInt(projectId || '0')
        });
      }
      // Перезагрузка данных
      fetchMetaCards();
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      console.error('Save meta-card error:', err);
    }
  };

  if (loading && !metaCards.why) {
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
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Мета-карточки проекта</h1>
          {project && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
              {project.name}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/projects/${projectId}/board`)}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px'
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
              borderRadius: '4px',
              fontSize: '13px'
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
        Используйте 🪄 для автоматической генерации контента с помощью ИИ.
      </div>

      {/* Редакторы мета-карточек с кнопками генерации */}
      {(['why', 'requirements', 'stakeholders'] as MetaCardType[]).map((type) => (
        <div key={type} style={{ marginBottom: '24px' }}>
          {/* Заголовок с кнопкой генерации */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              {metaCardConfig[type].title}
            </h3>
            <AIGenerateButton
              prompt={getMetaCardPrompt(type, project?.name)}
              systemPrompt={getMetaCardSystemPrompt(type)}
              endpoint={`/v1/ai/generate/meta-card/${type}`}
              onGenerated={(content) => handleContentGenerated(type, content)}
              variant="icon"
              disabled={loading}
            />
          </div>

          {/* Описание карточки */}
          <p style={{
            fontSize: '13px',
            color: '#666',
            marginBottom: '12px',
            fontStyle: 'italic'
          }}>
            {metaCardConfig[type].description}
          </p>

          {/* Редактор */}
          <MetaCardEditor
            type={type}
            title=""
            description=""
            projectId={parseInt(projectId || '0')}
            initialContent={metaCards[type]?.content || ''}
            cardId={metaCards[type]?.id}
          />
        </div>
      ))}
    </div>
  );
}

// === Вспомогательные функции для генерации промптов ===

function getMetaCardPrompt(type: MetaCardType, projectName?: string): string {
  const name = projectName || 'текущий проект';

  switch (type) {
    case 'why':
      return `Создай обоснование проекта "${name}". Опиши: 1) Какую проблему решает проект, 2) Какие выгоды принесёт, 3) Почему это важно сделать сейчас. Формат: краткий текст на 150-200 слов.`;
    case 'requirements':
      return `Создай требования к проекту "${name}". Опиши: 1) Функциональные требования (что система должна делать), 2) Нефункциональные требования (производительность, безопасность), 3) Критерии успеха проекта. Формат: структурированный список.`;
    case 'stakeholders':
      return `Опиши заинтересованные лица проекта "${name}". Кто влияет на проект и кто зависит от результата? Их роли, интересы и ожидания. Формат: список с кратким описанием каждого стейкхолдера.`;
    default:
      return `Создай контент для раздела проекта "${name}".`;
  }
}

function getMetaCardSystemPrompt(type: MetaCardType): string {
  switch (type) {
    case 'why':
      return 'Ты опытный продукт-менеджер. Помогай формулировать цели проектов ясно и убедительно. Отвечай структурированно, по-русски, без излишней воды.';
    case 'requirements':
      return 'Ты старший системный аналитик. Составляй полные и точные требования. Отвечай структурированно, по-русски, с чёткими формулировками.';
    case 'stakeholders':
      return 'Ты опытный бизнес-аналитик. Выявляй всех стейкхолдеров и их потребности. Отвечай структурированно, по-русски, с акцентом на практическую пользу.';
    default:
      return 'Ты полезный ассистент. Отвечай структурированно, по-русски.';
  }
}
