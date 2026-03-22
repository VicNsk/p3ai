/**
 * Парсит ошибки от FastAPI и возвращает читаемое сообщение
 */
export function getErrorMessage(err: any): string {
  const detail = err.response?.data?.detail;

  if (!detail) return 'Неизвестная ошибка';

  // Если деталь — массив ошибок валидации (FastAPI 422)
  if (Array.isArray(detail)) {
    return detail
      .map((e: any) => {
        // e: { type, loc, msg, input }
        const field = e.loc?.[1] || e.loc?.[0] || 'поле';
        return `${field}: ${e.msg}`;
      })
      .join('; ');
  }

  // Если деталь — строка
  if (typeof detail === 'string') return detail;

  // Если деталь — объект
  if (typeof detail === 'object') {
    try {
      return JSON.stringify(detail);
    } catch {
      return 'Ошибка валидации';
    }
  }

  return 'Неизвестная ошибка';
}
