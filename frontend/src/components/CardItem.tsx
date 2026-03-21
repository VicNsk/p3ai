import { Draggable } from '@hello-pangea/dnd';
import type { CardStatus, CardPriority } from '../types/card';

interface CardItemProps {
  id: number;
  title: string;
  description?: string;
  priority: CardPriority;
  status: CardStatus;
  due_date?: string;
  index: number;
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
  index,
  onClick
}: CardItemProps) {

  const content = (
    <div
      onClick={onClick}
      style={{
        padding: '12px',
        marginBottom: '8px',
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderLeft: `4px solid ${priorityColors[priority]}`,
        borderRadius: '4px',
        cursor: 'grab',
        transition: 'box-shadow 0.2s, transform 0.2s',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
      }}
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

  return (
    <Draggable draggableId={String(id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1,
            transform: snapshot.isDragging
              ? provided.draggableProps.style?.transform + ' rotate(2deg)'
              : provided.draggableProps.style?.transform,
          }}
        >
          {content}
        </div>
      )}
    </Draggable>
  );
}
