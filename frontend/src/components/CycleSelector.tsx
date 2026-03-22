import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Cycle {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_completed: boolean;
}

interface CycleSelectorProps {
  projectId: number;
  onCycleChange?: (cycleId: number | null) => void;
}

export function CycleSelector({ projectId, onCycleChange }: CycleSelectorProps) {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchCycles();
  }, [projectId]);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/cycles/project/${projectId}`);
      setCycles(response.data);

      // Найти активный цикл
      const activeCycle = response.data.find((c: Cycle) => c.is_active && !c.is_completed);
      if (activeCycle) {
        setSelectedCycleId(activeCycle.id);
      }
    } catch (err: any) {
      console.error('Fetch cycles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;
    const name = formData.get('name') as string;

    try {
      await api.post('/v1/cycles/', {
        name: name || `Неделя ${cycles.length + 1}`,
        project_id: projectId,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString()
      });
      setShowCreateForm(false);
      fetchCycles();
    } catch (err: any) {
      console.error('Create cycle error:', err);
    }
  };

  const handleCompleteCycle = async (cycleId: number) => {
    if (!confirm('Завершить этот цикл?')) return;

    try {
      await api.post(`/v1/cycles/${cycleId}/complete`);
      fetchCycles();
    } catch (err: any) {
      console.error('Complete cycle error:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return <div style={{ padding: '8px', fontSize: '12px' }}>Загрузка...</div>;
  }

  const activeCycle = cycles.find(c => c.is_active && !c.is_completed);

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#f5f7fa',
      borderRadius: '8px',
      marginBottom: '16px'
    }}>
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>📅 Циклы проекта</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Новый цикл
        </button>
      </div>

      {/* Форма создания цикла */}
      {showCreateForm && (
        <form onSubmit={handleCreateCycle} style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            name="name"
            placeholder="Название"
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px' }}
          />
          <input
            type="date"
            name="start_date"
            required
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px' }}
          />
          <input
            type="date"
            name="end_date"
            required
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px' }}
          />
          <button
            type="submit"
            style={{
              padding: '6px 12px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Создать
          </button>
          <button
            type="button"
            onClick={() => setShowCreateForm(false)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Отмена
          </button>
        </form>
      )}

      {/* Список циклов */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            setSelectedCycleId(null);
            onCycleChange?.(null);
          }}
          style={{
            padding: '6px 12px',
            backgroundColor: selectedCycleId === null ? '#2196f3' : '#e0e0e0',
            color: selectedCycleId === null ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Все карточки
        </button>

        {cycles.map((cycle) => (
          <div
            key={cycle.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: selectedCycleId === cycle.id ? '#2196f3' : '#e0e0e0',
              color: selectedCycleId === cycle.id ? 'white' : '#333',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <button
              onClick={() => {
                setSelectedCycleId(cycle.id);
                onCycleChange?.(cycle.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                fontSize: '12px',
                padding: 0
              }}
            >
              {cycle.name} ({formatDate(cycle.start_date)} - {formatDate(cycle.end_date)})
            </button>

            {cycle.is_active && !cycle.is_completed && (
              <button
                onClick={() => handleCompleteCycle(cycle.id)}
                title="Завершить цикл"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  fontSize: '14px',
                  padding: 0,
                  opacity: 0.7
                }}
              >
                ✓
              </button>
            )}

            {cycle.is_completed && (
              <span title="Завершён">✅</span>
            )}
          </div>
        ))}
      </div>

      {/* Статус */}
      {activeCycle && (
        <div style={{
          marginTop: '8px',
          fontSize: '11px',
          color: '#666',
          fontStyle: 'italic'
        }}>
          Активный цикл: <strong>{activeCycle.name}</strong>
        </div>
      )}
    </div>
  );
}
