import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '../../api/http';

export default function CreateTeam() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await http.post('/teams', { name, description });
      navigate('/team');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Tạo Team mới</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Tên Team</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mô tả</label>
          <input value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Đang tạo...' : 'Tạo mới'}
        </button>
      </form>
    </div>
  );
}
