import { useState, useEffect } from 'react';
import { api } from '../services/api';

export type MetaCardType = 'why' | 'requirements' | 'stakeholders';

interface MetaCard {
  id: number;
  type: MetaCardType;
  content: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}

interface MetaCardEditorProps {
  type: MetaCardType;
  title: string;
  description: string;
  projectId: number;
  initialContent?: string;
  cardId?: number;
}

const typeColors: Record<MetaCardType, string> = {
  why: '#2196f3',
  requirements: '#ff9800',
  stakeholders: '#4caf50',
};

const typeIcons: Record<MetaCardType, string> = {
  why: '❓',
  requirements: '📋',
  stakeholders: '👥',
};

export function MetaCardEditor({
  type,
  title,
  description,
  projectId,
  initialContent = '',
  cardId
}: MetaCardEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Содержимое не может быть пустым');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (cardId) {
        // Обновление существующей карточки
        await api.put(`/v1/meta-cards/${cardId}`, { content });
      } else {
        // Создание новой (если карточки ещё не было)
        await api.post('/v1/meta-cards/', {
          type,
          content,
          project_id: projectId
        });
      }
      setIsEditing(false);
      setLastSaved(new Date().toLocaleTimeString('ru-RU'));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось сохранить');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    setIsEditing(false);
    setError('');
  };

  return (
    <div style={{
      border: `2px solid ${typeColors[type]}`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      backgroundColor: '#fafafa'
    }}>
      {/* Заголовок карточки */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <span style={{ fontSize: '20px' }}>{typeIcons[type]}</span>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{title}</h3>
        {lastSaved && (
          <span style={{ fontSize: '11px', color: '#888', marginLeft: 'auto' }}>
            Сохранено: {lastSaved}
          </span>
        )}
      </div>

      <p style={{
        fontSize: '13px',
        color: '#666',
        marginBottom: '16px',
        fontStyle: 'italic'
      }}>
        {description}
      </p>

      {/* Отображение или редактирование */}
      {isEditing ? (
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Введите содержимое..."
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginBottom: '12px',
              fontFamily: 'inherit',
              fontSize: '14px',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />

          {error && (
            <div style={{
              padding: '8px 12px',
              marginBottom: '12px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '4px',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSave}
              disabled={isSaving || !content.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: isSaving ? '#90a4ae' : typeColors[type],
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e0e0e0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #e0e0e0',
            marginBottom: '12px',
            minHeight: '80px',
            whiteSpace: 'pre-wrap',
            fontSize: '14px',
            color: content ? '#333' : '#999'
          }}>
            {content || '〈Пусто〉 Нажмите «Редактировать», чтобы добавить содержимое'}
          </div>

          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '6px 12px',
              backgroundColor: 'transparent',
              border: `1px solid ${typeColors[type]}`,
              color: typeColors[type],
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            ✎ Редактировать
          </button>
        </div>
      )}
    </div>
  );
}
