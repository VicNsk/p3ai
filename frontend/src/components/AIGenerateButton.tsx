import { useState } from 'react';
import { api } from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';

interface AIGenerateButtonProps {
  // Прямой промт (старый режим)
  prompt?: string;
  systemPrompt?: string;

  // Шаблон из БД (новый режим)
  templateType?: string;  // например: "prompt_meta_why"
  variables?: Record<string, any>;  // переменные для подстановки: { project_name: "..." }

  // Кастомные переопределения (работают с templateType)
  customPrompt?: string;
  customSystemPrompt?: string;

  endpoint?: string;
  onGenerated: (content: string) => void;
  disabled?: boolean;
  variant?: 'icon' | 'button';
  className?: string;
}

export function AIGenerateButton({
  prompt,
  systemPrompt,
  templateType,
  variables = {},
  customPrompt,
  customSystemPrompt,
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
      let requestBody: Record<string, any> = {};

      if (templateType) {
        // === НОВЫЙ РЕЖИМ: Использование шаблона из БД ===
        requestBody = {
          template_type: templateType,
          variables: variables
        };

        // Кастомные переопределения (опционально)
        if (customPrompt) {
          requestBody.custom_prompt = customPrompt;
        }
        if (customSystemPrompt) {
          requestBody.custom_system_prompt = customSystemPrompt;
        }

        // Используем специальный эндпоинт для шаблонов
        endpoint = '/v1/ai/generate/from-template';
      } else {
        // === СТАРЫЙ РЕЖИМ: Прямой промт ===
        requestBody = {
          prompt: prompt || '',
          system_prompt: systemPrompt
        };
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
