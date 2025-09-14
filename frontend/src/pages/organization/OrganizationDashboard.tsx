import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '@api/http';
import { useAuth } from '@store/auth';

interface Organization {
  id: number;
  name: string;
  subscriptionPlan: string;
  subscriptionExpiresAt?: string;
  _count: {
    users: number;
    hosts: number;
    teams?: number;
  };
}

export default function OrganizationDashboard() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const { data } = await http.get('/organizations/current');
        setOrganization(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch organization:', err);
        setError(err.response?.data?.message || 'Failed to load organization data');
        
        // If user doesn't have an organization, redirect to create one
        if (err.response?.status === 404) {
          navigate('/organization/create');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganization();
  }, [navigate]);
  
  if (loading) {
    return <div className="container">Loading organization data...</div>;
  }
  
  if (error && !organization) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
        {user?.role === 'ADMIN' && (
          <button 
            className="btn primary" 
            onClick={() => navigate('/organization/create')}
          >
            Create Organization
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="container">
      <h1>Organization Dashboard</h1>
      
      <div className="card">
        <div className="card-header">
          <h2>{organization?.name}</h2>
          <span className="badge primary">{organization?.subscriptionPlan || 'FREE'}</span>
        </div>
        
        <div className="card-body">
          <div className="row" style={{justifyContent: 'space-between'}}>
            <div className="stat">
              <div className="stat-title">Members</div>
              <div className="stat-value">{organization?._count?.users || 0}</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Hosts</div>
              <div className="stat-value">{organization?._count?.hosts || 0}</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Teams</div>
              <div className="stat-value">{organization?._count?.teams || 0}</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Subscription</div>
              <div className="stat-value">
                {organization?.subscriptionExpiresAt ? (
                  <span>
                    Expires: {new Date(organization.subscriptionExpiresAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span>Free Plan</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-footer row" style={{justifyContent: 'flex-end', gap: '10px'}}>
          {user?.role === 'ADMIN' && (
            <>
              <button 
                className="btn" 
                onClick={() => navigate('/organization/members')}
              >
                Manage Members
              </button>
              <button 
                className="btn" 
                onClick={() => navigate('/subscription')}
              >
                Manage Subscription
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
