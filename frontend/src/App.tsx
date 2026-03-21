import { useEffect, useState } from 'react';
import { api } from './services/api';

function App() {
  const [status, setStatus] = useState<string>('Loading...');

  useEffect(() => {
    api.get('/v1/health')
      .then((res) => setStatus(res.data.status))
      .catch((err) => setStatus('Error: ' + err.message));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>MicroP3 Frontend</h1>
      <p>Backend Status: <strong>{status}</strong></p>
    </div>
  );
}

export default App;