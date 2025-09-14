import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { http } from '../../api/http';

export default function EditHost() {
  const { id } = useParams<{ id: string }>();
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHost = async () => {
      try {
        const { data } = await http.get(`/hosts/${id}`);
        setIp(data.ip);
        setPort(data.port);
        setNotes(data.notes || '');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load host');
      }
    };
    fetchHost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await http.put(`/hosts/${id}`, { ip, port, notes });
      navigate('/hosts');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update host');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Chỉnh sửa Host</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>IP</label>
          <input value={ip} onChange={e => setIp(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Port</label>
          <input value={port} onChange={e => setPort(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
}
