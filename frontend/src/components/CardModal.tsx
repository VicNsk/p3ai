import { useState, useEffect } from 'react';
import type { Card, CardPriority, CardStatus } from '../types/card';
import { CommentsList } from './CommentsList';
import { AttachmentsList } from './AttachmentsList';
import { AIGenerateButton } from './AIGenerateButton';

interface CardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Card) => Promise<void>;
  onDelete?: (cardId: number) => Promise<void>;
  currentUserId: number;
}

type TabType = 'details' | 'comments' | 'attachments';

export function CardModal({
  card,
  isOpen,
  onClose,
  onSave,
  onDelete,
  currentUserId
}: CardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<CardPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [generatingDescription, setGeneratingDescription] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setPriority(card.priority);
      setDueDate(card.due_date ? card.due_date.split('T')[0] : '');
    }
    setError('');
    setActiveTab('details');
    setGeneratingDescription(false);
  }, [card]);

  if (!isOpen || !card) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Заголовок обязателен');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave({
        ...card,
        title,
        description,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось сохранить');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Вы уверены, что хотите удалить эту задачу?') && onDelete) {
      try {
        await onDelete(card.id);
        onClose();
      } catch (err: any) {
        setError('Не удалось удалить');
      }
    }
  };

  const handleDescriptionGenerated = (content: string) => {
    setDescription(content);
    setGeneratingDescription(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>
          Редактирование задачи
        </h2>

        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        {/* Вкладки */}
        <div style={{ marginBottom: '16px', borderBottom: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('details')}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === 'details' ? '#1976d2' : 'transparent',
                color: activeTab === 'details' ? 'white' : '#333',
                border: 'none',
                borderBottom: activeTab === 'details' ? '2px solid #1976d2' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'details' ? 500 : 400,
                borderRadius: '4px 4px 0 0'
              }}
            >
              📝 Детали
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === 'comments' ? '#1976d2' : 'transparent',
                color: activeTab === 'comments' ? 'white' : '#333',
                border: 'none',
                borderBottom: activeTab === 'comments' ? '2px solid #1976d2' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'comments' ? 500 : 400,
                borderRadius: '4px 4px 0 0'
              }}
            >
              💬 Комментарии
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === 'attachments' ? '#1976d2' : 'transparent',
                color: activeTab === 'attachments' ? 'white' : '#333',
                border: 'none',
                borderBottom: activeTab === 'attachments' ? '2px solid #1976d2' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'attachments' ? 500 : 400,
                borderRadius: '4px 4px 0 0'
              }}
            >
              📎 Файлы
            </button>
          </div>
        </div>

        {/* Содержимое вкладок */}
        {activeTab === 'details' && (
          <form onSubmit={handleSubmit}>
            {/* Заголовок */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px' }}>
                Заголовок *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            {/* Описание с кнопкой генерации */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: 500, fontSize: '13px' }}>
                  Описание
                </label>
                <AIGenerateButton
                  prompt={`Создай подробное описание для задачи: "${title}". Включи цель задачи, шаги для выполнения и критерии готовности (Definition of Done).`}
                  systemPrompt="Ты опытный тимлид. Помогай формулировать задачи чётко и выполнимо. Отвечай структурированно, по-русски."
                  endpoint="/v1/ai/generate/card/description"
                  onGenerated={handleDescriptionGenerated}
                  variant="icon"
                  disabled={loading}
                />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Описание задачи... Используйте 🪄 для авто-генерации"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical', fontSize: '14px' }}
              />
            </div>

            {/* Приоритет */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px' }}>
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CardPriority)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>

            {/* Дедлайн */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px' }}>
                Дедлайн
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            {/* Кнопки действий */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Удалить
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e0e0e0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: loading ? '#90a4ae' : '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '13px'
                }}
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'comments' && (
          <CommentsList cardId={card.id} currentUserId={currentUserId} />
        )}

        {activeTab === 'attachments' && (
          <AttachmentsList cardId={card.id} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}
