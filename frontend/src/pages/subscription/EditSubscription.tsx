import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { http } from '../../api/http';

export default function EditSubscription() {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const { data } = await http.get(`/subscription/${id}`);
        setPlan(data.plan);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load subscription');
      }
    };
    fetchSub();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await http.put(`/subscription/${id}`, { plan });
      navigate('/subscription');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Chỉnh sửa Subscription</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Plan</label>
          <input value={plan} onChange={e => setPlan(e.target.value)} required />
        </div>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
}
