import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';

interface AIProvider {
  id: number;
  name: string;
  provider_type: 'openai' | 'anthropic' | 'local' | 'custom';
  api_base_url?: string;
  api_key?: string;
  model_name: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

const PRESETS: Record<string, Partial<AIProvider>> = {
  openrouter: {
    name: "OpenRouter",
    provider_type: "custom",
    api_base_url: "https://openrouter.ai/api/v1",
    model_name: "openai/gpt-4o-mini",
    max_tokens: 4096,
    temperature: 7
  },
  ollama: {
    name: "Ollama Local",
    provider_type: "local",
    api_base_url: "http://localhost:11434",
    model_name: "llama3.2",
    max_tokens: 2048,
    temperature: 7
  },
  openai: {
    name: "OpenAI GPT-4o",
    provider_type: "openai",
    api_base_url: "https://api.openai.com/v1",
    model_name: "gpt-4o-mini",
    max_tokens: 4096,
    temperature: 7
  }
};

export function AISettings() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<AIProvider>>({
    provider_type: 'local',
    max_tokens: 2048,
    temperature: 7,
    is_active: false
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);

      // Отладка: проверить токен
      const token = localStorage.getItem('token');
      console.log('AI Settings: token present:', !!token);
      console.log('AI Settings: token preview:', token ? `${token.slice(0, 20)}...` : 'none');

      const response = await api.get('/v1/ai/providers');
      setProviders(response.data);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Не удалось загрузить провайдеров' });
      console.error('Fetch providers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/v1/ai/providers/${formData.id}`, formData);
        setMessage({ type: 'success', text: 'Провайдер обновлён' });
      } else {
        await api.post('/v1/ai/providers', formData);
        setMessage({ type: 'success', text: 'Провайдер добавлен' });
      }
      setShowForm(false);
      setFormData({ provider_type: 'local', max_tokens: 2048, temperature: 7, is_active: false });
      fetchProviders();
    } catch (err: any) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
      console.error('Save provider error:', err);
    }
  };

  const handleActivate = async (providerId: number) => {
    try {
      await api.put(`/v1/ai/providers/${providerId}`, { is_active: true });
      setMessage({ type: 'success', text: 'Провайдер активирован' });
      fetchProviders();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Не удалось активировать' });
      console.error('Activate provider error:', err);
    }
  };

  const handleDelete = async (providerId: number) => {
    if (!confirm('Удалить этого провайдера?')) return;
    try {
      await api.delete(`/v1/ai/providers/${providerId}`);
      setMessage({ type: 'success', text: 'Провайдер удалён' });
      fetchProviders();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Не удалось удалить' });
      console.error('Delete provider error:', err);
    }
  };

  const applyPreset = (preset: keyof typeof PRESETS) => {
    setFormData({ ...PRESETS[preset], api_key: '', is_active: false });
    setShowForm(true);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Шапка */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>⚙️ Настройки ИИ</h1>
        <button
          onClick={() => navigate('/projects')}
          style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px' }}
        >
          ← Назад к проектам
        </button>
        // В шапке AISettings:
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate('/settings/ai')}
            style={{ padding: '8px 16px', backgroundColor: '#9c27b0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            ⚙️ ИИ-провайдеры
          </button>
          <button
            onClick={() => navigate('/settings/templates')}
            style={{ padding: '8px 16px', backgroundColor: '#607d8b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            📄 Шаблоны
          </button>
        </div>
      </div>

      {/* Сообщения */}
      {message && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
          color: message.type === 'success' ? '#2e7d32' : '#c62828',
          borderRadius: '4px'
        }}>
          {message.text}
        </div>
      )}

      {/* Инфо-блок */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#f3e5f5',
        borderRadius: '4px',
        marginBottom: '24px',
        fontSize: '13px',
        color: '#7b1fa2'
      }}>
        <strong>💡 Подсказка:</strong> Для локальной разработки рекомендуется Ollama (https://ollama.ai).
        Установите модель и укажите URL: http://localhost:11434
      </div>

      {/* Пресеты */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '14px' }}>Быстрые пресеты</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key as keyof typeof PRESETS)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                textAlign: 'left'
              }}
            >
              <strong>{preset.name}</strong><br/>
              <span style={{ color: '#666', fontSize: '11px' }}>{preset.provider_type} • {preset.model_name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Кнопка добавления */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#9c27b0',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '16px'
        }}
      >
        {showForm ? 'Отмена' : '+ Добавить провайдера'}
      </button>

      {/* Форма */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: '1fr 1fr'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Название *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Тип *</label>
            <select
              value={formData.provider_type}
              onChange={(e) => setFormData({...formData, provider_type: e.target.value as any})}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="local">Локальный (Ollama, LM Studio)</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="custom">Кастомный API (OpenRouter)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Модель *</label>
            <input
              type="text"
              value={formData.model_name || ''}
              onChange={(e) => setFormData({...formData, model_name: e.target.value})}
              placeholder="llama3.2, gpt-4o-mini, claude-3..."
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>API Base URL</label>
            <input
              type="url"
              value={formData.api_base_url || ''}
              onChange={(e) => setFormData({...formData, api_base_url: e.target.value})}
              placeholder="http://localhost:11434"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>API Key</label>
            <input
              type="password"
              value={formData.api_key || ''}
              onChange={(e) => setFormData({...formData, api_key: e.target.value})}
              placeholder="sk-..."
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Temperature (0-10)</label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.temperature || 7}
              onChange={(e) => setFormData({...formData, temperature: parseInt(e.target.value)})}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '11px', color: '#666' }}>{formData.temperature}/10</span>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              />
              Сделать активным
            </label>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {formData.id ? 'Обновить' : 'Добавить'}
            </button>
          </div>
        </form>
      )}

      {/* Список провайдеров */}
      <h3 style={{ marginBottom: '12px' }}>Доступные провайдеры</h3>
      {providers.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          Нет настроенных провайдеров. Добавьте первого или используйте пресет выше.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {providers.map((provider) => (
            <div
              key={provider.id}
              style={{
                padding: '12px 16px',
                backgroundColor: provider.is_active ? '#e8f5e9' : '#f5f5f5',
                borderRadius: '4px',
                border: provider.is_active ? '2px solid #4caf50' : '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontWeight: 500 }}>
                  {provider.name} {provider.is_active && <span style={{ color: '#4caf50' }}>✅</span>}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {provider.provider_type} • {provider.model_name}
                  {provider.api_base_url && <span> • {provider.api_base_url}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {!provider.is_active && (
                  <button
                    onClick={() => handleActivate(provider.id)}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Активировать
                  </button>
                )}
                <button
                  onClick={() => {
                    setFormData(provider);
                    setShowForm(true);
                  }}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#e0e0e0',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(provider.id)}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
