import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

interface Attachment {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  card_id: number;
  user_id: number;
  created_at: string;
}

interface AttachmentsListProps {
  cardId: number;
  currentUserId: number;
}

export function AttachmentsList({ cardId, currentUserId }: AttachmentsListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cardId) {
      fetchAttachments();
    }
  }, [cardId]);

  const fetchAttachments = async () => {
    try {
      const response = await api.get(`/v1/attachments/card/${cardId}`);
      setAttachments(response.data);
    } catch (err: any) {
      console.error('Fetch attachments error:', err);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.post('/v1/attachments/upload', formData, {
        params: { card_id: cardId, user_id: currentUserId },
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchAttachments();
    } catch (err: any) {
      console.error('Upload attachment error:', err);
      alert('Не удалось загрузить файл');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (attachmentId: number, filename: string) => {
    try {
      const response = await api.get(`/v1/attachments/download/${attachmentId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download attachment error:', err);
      alert('Не удалось скачать файл');
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!confirm('Удалить этот файл?')) return;

    try {
      await api.delete(`/v1/attachments/${attachmentId}`);
      fetchAttachments();
    } catch (err: any) {
      console.error('Delete attachment error:', err);
      alert('Не удалось удалить файл');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
    return '📎';
  };

  return (
    <div style={{ padding: '8px' }}>
      {/* Кнопка загрузки */}
      <div style={{ marginBottom: '16px' }}>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '8px 16px',
            backgroundColor: uploading ? '#90a4ae' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {uploading ? '⏳ Загрузка...' : '📎 Прикрепить файл'}
        </button>
      </div>

      {/* Список файлов */}
      {attachments.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px', fontSize: '13px' }}>
          Нет вложений. Прикрепите первый файл.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#f5f7fa',
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ fontSize: '18px' }}>{getFileIcon(attachment.mime_type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {attachment.filename}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    {formatFileSize(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => handleDownload(attachment.id, attachment.filename)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                  title="Скачать"
                >
                  ⬇️
                </button>
                {attachment.user_id === currentUserId && (
                  <button
                    onClick={() => handleDeleteAttachment(attachment.id)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#ffebee',
                      color: '#c62828',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                    title="Удалить"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
