import { CardItem } from './CardItem';
import type { Card, CardStatus } from '../types/card';

interface BoardColumnProps {
  title: string;
  status: CardStatus;
  cards: Card[];
  onCardClick?: (card: Card) => void;
  onStatusChange?: (cardId: number, newStatus: CardStatus) => void;
}

const statusColors: Record<CardStatus, string> = {
  new: '#2196f3',
  process: '#ff9800',
  done: '#4caf50',
};

export function BoardColumn({
  title,
  status,
  cards,
  onCardClick,
  onStatusChange
}: BoardColumnProps) {

  const handleMove = (cardId: number, direction: 'prev' | 'next') => {
    const order: CardStatus[] = ['new', 'process', 'done'];
    const currentIndex = order.indexOf(status);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < order.length && onStatusChange) {
      onStatusChange(cardId, order[newIndex]);
    }
  };

  return (
    <div style={{
      minWidth: '280px',
      maxWidth: '280px',
      backgroundColor: '#f5f7fa',
      borderRadius: '8px',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Заголовок колонки */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: `2px solid ${statusColors[status]}`
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
          {title} <span style={{ color: '#888', fontSize: '12px' }}>({cards.length})</span>
        </h3>
      </div>

      {/* Список карточек */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: '200px' }}>
        {cards.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '12px',
            padding: '20px 0'
          }}>
            Нет задач
          </div>
        ) : (
          cards.map((card) => (
            <div key={card.id} style={{ position: 'relative' }}>
              <CardItem
                {...card}
                onClick={() => onCardClick?.(card)}
              />

              {/* Кнопки быстрого перемещения */}
              {onStatusChange && (
                <div style={{
                  position: 'absolute',
                  right: '4px',
                  top: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  {status !== 'new' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(card.id, 'prev');
                      }}
                      style={{
                        padding: '2px 6px',
                        fontSize: '10px',
                        backgroundColor: '#e0e0e0',
                        border: 'none',
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                      title="Переместить назад"
                    >
                      ←
                    </button>
                  )}
                  {status !== 'done' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(card.id, 'next');
                      }}
                      style={{
                        padding: '2px 6px',
                        fontSize: '10px',
                        backgroundColor: '#e0e0e0',
                        border: 'none',
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                      title="Переместить вперёд"
                    >
                      →
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
