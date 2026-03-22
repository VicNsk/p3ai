import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: number;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'cycle_start' | 'cycle_complete';
  user_id: number | null;
  timestamp: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  project_id: number;
}

interface AuditTimelineProps {
  projectId: number;
  limit?: number;
}

const actionLabels: Record<string, string> = {
  create: '📝 Создано',
  update: '✏️ Изменено',
  delete: '🗑️ Удалено',
  status_change: '🔄 Статус изменён',
  cycle_start: '🚀 Цикл начат',
  cycle_complete: '✅ Цикл завершён'
};

const entityLabels: Record<string, string> = {
  card: 'Карточка',
  project: 'Проект',
  cycle: 'Цикл',
  meta_card: 'Мета-карточка'
};

export function AuditTimeline({ projectId, limit = 50 }: AuditTimelineProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, [projectId, filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { entity_type: filter } : {};
      const response = await api.get(`/v1/audit/project/${projectId}`, {
        params: { ...params, limit }
      });
      setLogs(response.data.items);
    } catch (err: any) {
      console.error('Fetch audit logs error:', err);
    } finally {
      setLoading(false);
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
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка истории...</div>;
  }

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>📜 История изменений</h3>

      {/* Фильтры */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px' }}
        >
          <option value="all">Все события</option>
          <option value="card">Карточки</option>
          <option value="project">Проект</option>
          <option value="cycle">Циклы</option>
          <option value="meta_card">Мета-карточки</option>
        </select>
      </div>

      {/* Список событий */}
      {logs.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: '#999',
          padding: '40px',
          fontSize: '14px'
        }}>
          Нет записей в истории
        </div>
      ) : (
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid #e0e0e0',
          borderRadius: '8px'
        }}>
          {logs.map((log, index) => (
            <div
              key={log.id}
              style={{
                padding: '12px 16px',
                borderBottom: index < logs.length - 1 ? '1px solid #f0f0f0' : 'none',
                backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>
                  {actionLabels[log.action] || log.action}
                </span>
                <span style={{ fontSize: '11px', color: '#888' }}>
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#666' }}>
                <strong>{entityLabels[log.entity_type] || log.entity_type}</strong> #{log.entity_id}
                {log.field_name && (
                  <span> — поле «{log.field_name}»</span>
                )}
              </div>

              {(log.old_value || log.new_value) && (
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  marginTop: '4px',
                  fontFamily: 'monospace'
                }}>
                  {log.old_value && <div>← {log.old_value}</div>}
                  {log.new_value && <div style={{ color: '#4caf50' }}>→ {log.new_value}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
