import { http } from './http';

export async function getRolePermissions(roleId: number) {
  return http.get(`/roles/${roleId}/permissions`);
}

export async function assignPermissionToRole(roleId: number, permissionId: number) {
  return http.post(`/roles/${roleId}/permissions`, { permissionId });
}

export async function removePermissionFromRole(roleId: number, permissionId: number) {
  return http.delete(`/roles/${roleId}/permissions/${permissionId}`);
}
