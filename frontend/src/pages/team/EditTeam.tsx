import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { http } from '../../api/http';

export default function EditTeam() {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await http.get(`/teams/${id}`);
        setName(data.name);
        setDescription(data.description || '');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load team');
      }
    };
    fetchTeam();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await http.put(`/teams/${id}`, { name, description });
      navigate('/team');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Chỉnh sửa Team</h2>
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
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
}
