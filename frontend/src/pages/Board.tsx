import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext } from '@hello-pangea/dnd';
import { api } from '../services/api';
import { BoardColumn } from '../components/BoardColumn';
import { CardModal } from '../components/CardModal';
import type { Card, CardStatus } from '../types/card';

export function Board() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCardTitle, setNewCardTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Состояние для модального окна
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setError('');
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
      setCards(prev => prev.map(c =>
        c.id === cardId ? { ...c, status: newStatus } : c
      ));
    } catch (err: any) {
      setError('Не удалось обновить статус');
      fetchCards();
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as CardStatus;
    const cardId = parseInt(draggableId);

    // Оптимистичное обновление UI
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, status: newStatus } : c
    ));

    // Отправка изменения на сервер
    try {
      await api.patch(`/v1/cards/${cardId}`, { status: newStatus });
    } catch (err: any) {
      setError('Не удалось обновить статус');
      fetchCards();
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim() || !projectId) return;

    setSubmitting(true);
    setError('');

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
      setError(err.response?.data?.detail || 'Не удалось создать задачу');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleSaveCard = async (updatedCard: Card) => {
    await api.patch(`/v1/cards/${updatedCard.id}`, {
      title: updatedCard.title,
      description: updatedCard.description,
      priority: updatedCard.priority,
      due_date: updatedCard.due_date,
    });
    fetchCards();
  };

  const handleDeleteCard = async (cardId: number) => {
    await api.delete(`/v1/cards/${cardId}`);
    fetchCards();
  };

  if (loading && cards.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка доски...</div>;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
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
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: '#e0e0e0',
              border: 'none',
              borderRadius: '4px'
            }}
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
            disabled={submitting || !newCardTitle.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: submitting ? '#90a4ae' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Добавление...' : 'Добавить'}
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
            onCardClick={handleCardClick}
            onStatusChange={handleStatusChange}
          />
          <BoardColumn
            title="В работе"
            status="process"
            cards={cards.filter(c => c.status === 'process')}
            onCardClick={handleCardClick}
            onStatusChange={handleStatusChange}
          />
          <BoardColumn
            title="Готово"
            status="done"
            cards={cards.filter(c => c.status === 'done')}
            onCardClick={handleCardClick}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Модальное окно редактирования */}
        <CardModal
          card={selectedCard}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCard(null);
          }}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
        />
      </div>
    </DragDropContext>
  );
}
