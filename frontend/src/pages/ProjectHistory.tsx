import { useParams, useNavigate } from 'react-router-dom';
import { AuditTimeline } from '../components/AuditTimeline';

export function ProjectHistory() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

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
        <h1 style={{ margin: 0, fontSize: '20px' }}>История проекта</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/projects/${projectId}/board`)}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px' }}
          >
            ← Доска задач
          </button>
          <button
            onClick={() => navigate(`/projects/${projectId}/meta`)}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px' }}
          >
            Мета-карточки
          </button>
        </div>
      </div>

      {/* Временная шкала */}
      <AuditTimeline projectId={parseInt(projectId || '0')} limit={100} />
    </div>
  );
}
