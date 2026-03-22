import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Comment {
  id: number;
  content: string;
  card_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface CommentsListProps {
  cardId: number;
  currentUserId: number;
}

export function CommentsList({ cardId, currentUserId }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cardId) {
      fetchComments();
    }
  }, [cardId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/comments/card/${cardId}`);
      setComments(response.data);
    } catch (err: any) {
      console.error('Fetch comments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/v1/comments/', {
        content: newComment,
        card_id: cardId,
        user_id: currentUserId
      });
      setNewComment('');
      fetchComments();
    } catch (err: any) {
      console.error('Create comment error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Удалить этот комментарий?')) return;

    try {
      await api.delete(`/v1/comments/${commentId}`);
      fetchComments();
    } catch (err: any) {
      console.error('Delete comment error:', err);
    }
  };

  const formatTimestamp = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div style={{ padding: '16px', textAlign: 'center' }}>Загрузка комментариев...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '300px' }}>
      {/* Список комментариев */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '16px',
        padding: '8px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px'
      }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px', fontSize: '13px' }}>
            Нет комментариев. Будьте первыми!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: comment.user_id === currentUserId ? '#e3f2fd' : 'white',
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#1976d2' }}>
                  {comment.user_id === currentUserId ? 'Вы' : `Пользователь #${comment.user_id}`}
                </span>
                <span style={{ fontSize: '11px', color: '#888' }}>
                  {formatTimestamp(comment.created_at)}
                </span>
              </div>
              <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', color: '#333' }}>
                {comment.content}
              </div>
              {comment.user_id === currentUserId && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  style={{
                    marginTop: '8px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  Удалить
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Форма отправки */}
      <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '8px' }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Напишите комментарий..."
          rows={2}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '13px',
            resize: 'none'
          }}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: submitting ? '#90a4ae' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '13px'
          }}
        >
          {submitting ? '...' : 'Отправить'}
        </button>
      </form>
    </div>
  );
}
