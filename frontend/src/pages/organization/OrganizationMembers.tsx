import { useState, useEffect } from 'react';
import { http } from '@api/http';
import { useAuth } from '@store/auth';

interface Member {
  id: number;
  email: string;
  name?: string;
  organizationRole: string;
}

export default function OrganizationMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('USER');
  const [inviting, setInviting] = useState(false);
  const { user } = useAuth();
  
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await http.get('/organizations/current');
      setMembers(data.users || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch organization members:', err);
      setError(err.response?.data?.message || 'Failed to load organization members');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMembers();
  }, []);
  
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      setError('Email address is required');
      return;
    }
    
    try {
      setInviting(true);
      setError(null);
      
      // Get the organization ID
      const { data: organization } = await http.get('/organizations/current');
      
      // Send the invitation
      await http.post(`/organizations/${organization.id}/users`, {
        email: inviteEmail,
        role: inviteRole
      });
      
      // Clear form and refresh member list
      setInviteEmail('');
      setInviteRole('USER');
      fetchMembers();
    } catch (err: any) {
      console.error('Failed to invite user:', err);
      setError(err.response?.data?.message || 'Failed to invite user');
    } finally {
      setInviting(false);
    }
  };
  
  const handleRemoveMember = async (userId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }
    
    try {
      // Get the organization ID
      const { data: organization } = await http.get('/organizations/current');
      
      await http.delete(`/organizations/${organization.id}/users/${userId}`);
      fetchMembers();
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };
  
  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      // Get the organization ID
      const { data: organization } = await http.get('/organizations/current');
      
      await http.patch(`/organizations/${organization.id}/users/${userId}/role`, {
        role: newRole
      });
      fetchMembers();
    } catch (err: any) {
      console.error('Failed to change member role:', err);
      setError(err.response?.data?.message || 'Failed to change member role');
    }
  };
  
  const isCurrentUser = (memberId: number) => {
    return user?.id === memberId;
  };
  
  const isLastAdmin = () => {
    const adminCount = members.filter(m => m.organizationRole === 'ADMIN').length;
    return adminCount <= 1;
  };
  
  if (loading && !members.length) {
    return <div className="container">Loading organization members...</div>;
  }
  
  return (
    <div className="container">
      <h1>Organization Members</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="card">
        <div className="card-header">
          <h2>Members ({members.length})</h2>
        </div>
        
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.name || 'N/A'}</td>
                  <td>{member.email}</td>
                  <td>
                    {isCurrentUser(member.id) || user?.role !== 'ADMIN' ? (
                      <span className="badge">{member.organizationRole}</span>
                    ) : (
                      <select 
                        value={member.organizationRole}
                        onChange={(e) => handleChangeRole(member.id, e.target.value)}
                        disabled={member.organizationRole === 'ADMIN' && isLastAdmin()}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                      </select>
                    )}
                  </td>
                  <td>
                    {!isCurrentUser(member.id) && user?.role === 'ADMIN' && (
                      <button 
                        className="btn small danger"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={member.organizationRole === 'ADMIN' && isLastAdmin()}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {user?.role === 'ADMIN' && (
        <div className="card mt-4">
          <div className="card-header">
            <h2>Invite New Member</h2>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleInvite} className="form">
              <div className="form-group">
                <label htmlFor="inviteEmail">Email Address</label>
                <input
                  type="email"
                  id="inviteEmail"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="inviteRole">Role</label>
                <select
                  id="inviteRole"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <div className="form-group">
                <button 
                  type="submit" 
                  className="btn primary" 
                  disabled={inviting}
                >
                  {inviting ? 'Sending Invitation...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
