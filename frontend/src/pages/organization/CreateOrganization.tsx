import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '@api/http';

export default function CreateOrganization() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Organization name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await http.post('/organizations', { name });
      navigate('/');
    } catch (err: any) {
      console.error('Failed to create organization:', err);
      setError(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <h1>Create Organization</h1>
      <p className="text-muted">
        Create your organization to manage hosts and collaborate with team members.
        Your organization will start with a free plan.
      </p>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="form card">
        <div className="form-group">
          <label htmlFor="name">Organization Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter organization name"
            required
          />
        </div>
        
        <div className="form-group">
          <button 
            type="submit" 
            className="btn primary" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
          
          <button 
            type="button" 
            className="btn" 
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
