import { http } from './http';

export async function getRoles() {
  return http.get('/api/roles');
}

export async function createRole(name: string) {
  return http.post('/api/roles', { name });
}

export async function updateRole(id: number, name: string) {
  return http.put(`/api/roles/${id}`, { name });
}

export async function deleteRole(id: number) {
  return http.delete(`/api/roles/${id}`);
}

export async function getPermissions() {
  return http.get('/api/permissions');
}

export async function createPermission(name: string) {
  return http.post('/api/permissions', { name });
}

export async function updatePermission(id: number, name: string) {
  return http.put(`/api/permissions/${id}`, { name });
}

export async function deletePermission(id: number) {
  return http.delete(`/api/permissions/${id}`);
}
