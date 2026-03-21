import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { BoardColumn } from '../components/BoardColumn';
import { Card, CardStatus } from '../types/card';

export function Board() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCardTitle, setNewCardTitle] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchCards();
    }
  }, [projectId]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/cards/?project_id=${projectId}`);
      setCards(response.data);
    } catch (err: any) {
      setError('Не удалось загрузить задачи');
      console.error('Fetch cards error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (cardId: number, newStatus: CardStatus) => {
    try {
      await api.patch(`/v1/cards/${cardId}`, { status: newStatus });
      // Оптимистичное обновление локального состояния
      setCards(prev => prev.map(c =>
        c.id === cardId ? { ...c, status: newStatus } : c
      ));
    } catch (err: any) {
      setError('Не удалось обновить статус');
      fetchCards(); // Откат при ошибке
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim() || !projectId) return;

    try {
      await api.post('/v1/cards/', {
        title: newCardTitle,
        project_id: parseInt(projectId),
        priority: 'medium',
        status: 'new'
      });
      setNewCardTitle('');
      fetchCards();
    } catch (err: any) {
      setError('Не удалось создать задачу');
    }
  };

  if (loading && cards.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка доски...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Шапка */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ margin: 0 }}>Доска проекта</h1>
        <button
          onClick={() => navigate('/projects')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          ← Назад к проектам
        </button>
      </div>

      {/* Форма создания карточки */}
      <form onSubmit={handleCreateCard} style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <input
          type="text"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
          placeholder="Название новой задачи..."
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Добавить
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

      {/* Доска с колонками */}
      <div style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '24px'
      }}>
        <BoardColumn
          title="Новые"
          status="new"
          cards={cards.filter(c => c.status === 'new')}
          onStatusChange={handleStatusChange}
        />
        <BoardColumn
          title="В работе"
          status="process"
          cards={cards.filter(c => c.status === 'process')}
          onStatusChange={handleStatusChange}
        />
        <BoardColumn
          title="Готово"
          status="done"
          cards={cards.filter(c => c.status === 'done')}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
