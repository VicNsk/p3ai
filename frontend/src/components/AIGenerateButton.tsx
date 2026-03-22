import { useState } from 'react';
import { api } from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';

interface AIGenerateButtonProps {
  prompt: string;
  systemPrompt?: string;
  endpoint?: string;
  onGenerated: (content: string) => void;
  disabled?: boolean;
  variant?: 'icon' | 'button';
  className?: string;
}

export function AIGenerateButton({
  prompt,
  systemPrompt,
  endpoint = '/v1/ai/generate',
  onGenerated,
  disabled = false,
  variant = 'icon',
  className = ''
}: AIGenerateButtonProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');

    try {
      // Формируем тело запроса с правильными именами полей (snake_case)
      const requestBody: Record<string, any> = {
        prompt  // ← Обязательно
      };

      // Добавляем system_prompt только если он есть (snake_case!)
      if (systemPrompt) {
        requestBody.system_prompt = systemPrompt;
      }

      // Опциональные параметры
      if (variant === 'button') {  // Пример условной логики
        // requestBody.max_tokens = 2048;
        // requestBody.temperature = 7;
      }

      const response = await api.post(endpoint, requestBody);

      onGenerated(response.data.content);
      setError('');
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      console.error('AI generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const baseStyle = {
    padding: variant === 'icon' ? '4px 8px' : '6px 12px',
    backgroundColor: generating ? '#90a4ae' : '#9c27b0',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: generating ? 'not-allowed' : 'pointer',
    fontSize: variant === 'icon' ? '14px' : '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background-color 0.2s'
  } as const;

  if (variant === 'icon') {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={handleGenerate}
          disabled={disabled || generating}
          title="🪄 Сгенерировать с помощью ИИ"
          style={baseStyle}
          type="button"
        >
          {generating ? '⏳' : '🪄'}
        </button>
        {error && (
          <span style={{ fontSize: '10px', color: '#c62828', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <button
        onClick={handleGenerate}
        disabled={disabled || generating}
        style={baseStyle}
        type="button"
      >
        {generating ? '⏳ Генерация...' : '🪄 Сгенерировать с ИИ'}
      </button>
      {error && (
        <span style={{ fontSize: '11px', color: '#c62828' }}>{error}</span>
      )}
    </div>
  );
}
