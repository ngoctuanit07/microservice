import { http } from './http';

export async function getRolePermissions(roleId: number) {
  return http.get(`/api/roles/${roleId}/permissions`);
}

export async function assignPermissionToRole(roleId: number, permissionId: number) {
  return http.post(`/api/roles/${roleId}/permissions`, { permissionId });
}

export async function removePermissionFromRole(roleId: number, permissionId: number) {
  return http.delete(`/api/roles/${roleId}/permissions/${permissionId}`);
}
