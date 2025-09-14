import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { http } from '../../api/http';

interface Team {
  id: number;
  name: string;
  description?: string;
  organizationId: number;
}

export default function TeamList() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const { data } = await http.get('/teams');
        setTeams(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h2>Teams</h2>
        <Link to="/team/create" className="btn-primary" style={{maxWidth:180, textAlign:'center'}}>+ Thêm mới</Link>
      </div>
      {loading ? (
        <div>Loading teams...</div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(team => (
              <tr key={team.id}>
                <td>{team.name}</td>
                <td>{team.description}</td>
                <td>
                  <Link to={`/team/${team.id}`} className="btn">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
