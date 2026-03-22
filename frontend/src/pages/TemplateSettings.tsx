import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';

interface PromptTemplate {
  id: number;
  name: string;
  template_type: string;
  prompt_text: string;
  system_prompt?: string;
  default_model: string;
  default_temperature: number;
  default_max_tokens: number;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

const TEMPLATE_LABELS: Record<string, string> = {
  prompt_meta_why: '🎯 Why (Зачем проект)',
  prompt_meta_requirements: '📋 Требования',
  prompt_meta_stakeholders: '👥 Стейкхолдеры',
  prompt_card_description: '📝 Описание задачи',
  prompt_card_subtasks: '✅ Подзадачи',
  prompt_summary: '📄 Саммари',
};

export function TemplateSettings() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<PromptTemplate>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/templates/prompts');
      setPrompts(response.data);
    } catch (err: any) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
      console.error('Fetch templates error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/v1/templates/prompts/${editingId}`, formData);
        setMessage({ type: 'success', text: 'Шаблон обновлён' });
      }
      setEditingId(null);
      setFormData({});
      fetchPrompts();
    } catch (err: any) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
      console.error('Save template error:', err);
    }
  };

  const handleEdit = (template: PromptTemplate) => {
    setEditingId(template.id);
    setFormData(template);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleResetToDefault = async (templateType: string) => {
    if (!confirm('Сбросить шаблон к значениям по умолчанию?')) return;
    // Здесь можно добавить логику сброса, если нужно
    setMessage({ type: 'success', text: 'Функция сброса будет добавлена' });
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Шапка */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>⚙️ Шаблоны и промты</h1>
        <button
          onClick={() => navigate('/projects')}
          style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px' }}
        >
          ← Назад к проектам
        </button>
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
        <strong>💡 Подсказка:</strong> Используйте переменные в промтах: <code>{`{{project_name}}`}</code>, <code>{`{{card_title}}`}</code>, <code>{`{{project_description}}`}</code>.
        Они будут автоматически заменены на реальные значения при генерации.
      </div>

      {/* Список шаблонов */}
      <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Шаблоны промтов для ИИ</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {prompts.map((template) => (
          <div
            key={template.id}
            style={{
              padding: '16px',
              backgroundColor: template.is_active ? '#fff' : '#fafafa',
              borderRadius: '8px',
              border: template.is_active ? '1px solid #e0e0e0' : '1px dashed #ccc',
              opacity: template.is_active ? 1 : 0.7
            }}
          >
            {editingId === template.id ? (
              /* Форма редактирования */
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>Название</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>Промт <span style={{ color: '#666', fontWeight: 400 }}>(используйте {"{{переменные}}"})</span></label>
                  <textarea
                    value={formData.prompt_text || ''}
                    onChange={(e) => setFormData({...formData, prompt_text: e.target.value})}
                    rows={5}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'monospace', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>Системный промт <span style={{ color: '#666', fontWeight: 400 }}>(инструкция для ИИ)</span></label>
                  <textarea
                    value={formData.system_prompt || ''}
                    onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
                    rows={3}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'monospace', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Модель</label>
                    <input
                      type="text"
                      value={formData.default_model || ''}
                      onChange={(e) => setFormData({...formData, default_model: e.target.value})}
                      placeholder="llama3.2"
                      style={{ width: '150px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Temperature (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.default_temperature || 7}
                      onChange={(e) => setFormData({...formData, default_temperature: parseInt(e.target.value) || 7})}
                      style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Max Tokens</label>
                    <input
                      type="number"
                      value={formData.default_max_tokens || 2048}
                      onChange={(e) => setFormData({...formData, default_max_tokens: parseInt(e.target.value) || 2048})}
                      style={{ width: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    Активен
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_default ?? false}
                      onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                    />
                    По умолчанию
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button
                    type="submit"
                    style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    💾 Сохранить
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{ padding: '10px 20px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    ✕ Отмена
                  </button>
                </div>
              </form>
            ) : (
              /* Отображение шаблона */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>
                      {TEMPLATE_LABELS[template.template_type] || template.name}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {template.description}
                      {template.is_default && <span style={{ marginLeft: '8px', color: '#4caf50', fontWeight: 500 }}>✓ Default</span>}
                      {!template.is_active && <span style={{ marginLeft: '8px', color: '#999' }}>(неактивен)</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(template)}
                      style={{ padding: '6px 12px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      ✎ Редактировать
                    </button>
                    <button
                      onClick={() => handleResetToDefault(template.template_type)}
                      style={{ padding: '6px 12px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      ↺ Сброс
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Промт:</span>
                  <pre style={{
                    fontSize: '11px',
                    backgroundColor: '#f8f9fa',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0',
                    overflow: 'auto',
                    maxHeight: '120px',
                    whiteSpace: 'pre-wrap',
                    margin: 0
                  }}>
                    {template.prompt_text}
                  </pre>
                </div>

                {template.system_prompt && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Системный промт:</span>
                    <pre style={{
                      fontSize: '11px',
                      backgroundColor: '#f8f9fa',
                      padding: '12px',
                      borderRadius: '4px',
                      border: '1px solid #e0e0e0',
                      overflow: 'auto',
                      maxHeight: '80px',
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                      color: '#555'
                    }}>
                      {template.system_prompt}
                    </pre>
                  </div>
                )}

                <div style={{ marginTop: '8px', fontSize: '11px', color: '#888' }}>
                  Модель: <strong>{template.default_model}</strong> •
                  Temperature: <strong>{template.default_temperature}/10</strong> •
                  Max tokens: <strong>{template.default_max_tokens}</strong>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
