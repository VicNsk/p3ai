import type { CardStatus, CardPriority } from '../types/card';

interface CardItemProps {
  id: number;
  title: string;
  description?: string;
  priority: CardPriority;
  status: CardStatus;
  due_date?: string;
  onClick?: () => void;
}

const priorityColors: Record<CardPriority, string> = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
};

const statusLabels: Record<CardStatus, string> = {
  new: 'Новая',
  process: 'В работе',
  done: 'Готово',
};

export function CardItem({
  id,
  title,
  description,
  priority,
  status,
  due_date,
  onClick
}: CardItemProps) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px',
        marginBottom: '8px',
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderLeft: `4px solid ${priorityColors[priority]}`,
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>
        {title}
      </div>

      {description && (
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '8px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {description}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        color: '#888'
      }}>
        <span style={{
          padding: '2px 6px',
          backgroundColor: '#f5f5f5',
          borderRadius: '3px'
        }}>
          {statusLabels[status]}
        </span>

        {due_date && (
          <span>
            📅 {new Date(due_date).toLocaleDateString('ru-RU')}
          </span>
        )}
      </div>
    </div>
  );
}
