import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { http } from '../../api/http';

export default function EditOrganization() {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const { data } = await http.get(`/organizations/${id}`);
        setName(data.name);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load organization');
      }
    };
    fetchOrg();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await http.put(`/organizations/${id}`, { name });
      navigate('/organization');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Chỉnh sửa Organization</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Tên Organization</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
}
