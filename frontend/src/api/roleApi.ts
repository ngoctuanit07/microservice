import { http } from './http';

export async function getRoles() {
  return http.get('/roles');
}

export async function createRole(name: string) {
  return http.post('/roles', { name });
}

export async function updateRole(id: number, name: string) {
  return http.put(`/roles/${id}`, { name });
}

export async function deleteRole(id: number) {
  return http.delete(`/roles/${id}`);
}

export async function getPermissions() {
  return http.get('/permissions');
}

export async function createPermission(name: string) {
  return http.post('/permissions', { name });
}

export async function updatePermission(id: number, name: string) {
  return http.put(`/permissions/${id}`, { name });
}

export async function deletePermission(id: number) {
  return http.delete(`/permissions/${id}`);
}
