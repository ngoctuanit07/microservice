import React from 'react';

import { useEffect, useState } from 'react';
import {
  getRoles, createRole, updateRole, deleteRole,
  getPermissions, createPermission, updatePermission, deletePermission
} from '../../api/roleApi';
import {
  getRolePermissions, assignPermissionToRole, removePermissionFromRole
} from '../../api/rolePermissionApi';

type Role = { id: number; name: string };
type Permission = { id: number; name: string };

export default function RolesPermissions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<{ [roleId: number]: number[] }>({});
  const [newRole, setNewRole] = useState('');
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [newPermission, setNewPermission] = useState('');
  const [editPermissionId, setEditPermissionId] = useState<number | null>(null);
  const [editPermissionName, setEditPermissionName] = useState('');

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  async function fetchRoles() {
    const res = await getRoles();
    setRoles(res.data || []);
    // Fetch permissions for each role
    if (res.data) {
      const perms: { [roleId: number]: number[] } = {};
      await Promise.all(res.data.map(async (role: Role) => {
        const rp = await getRolePermissions(role.id);
        perms[role.id] = rp.data?.map((p: Permission) => p.id) || [];
      }));
      setRolePermissions(perms);
    }
  }
  async function fetchPermissions() {
    const res = await getPermissions();
    setPermissions(res.data || []);
  }

  async function handleCreateRole() {
    if (!newRole.trim()) return;
    await createRole(newRole);
    setNewRole('');
    fetchRoles();
  }
  async function handleUpdateRole() {
    if (!editRoleName.trim() || !editRoleId) return;
    await updateRole(editRoleId, editRoleName);
    setEditRoleId(null);
    setEditRoleName('');
    fetchRoles();
  }
  async function handleDeleteRole(id: number) {
    if (window.confirm('Xóa vai trò này?')) {
      await deleteRole(id);
      fetchRoles();
    }
  }

  async function handleCreatePermission() {
    if (!newPermission.trim()) return;
    await createPermission(newPermission);
    setNewPermission('');
    fetchPermissions();
  }
  async function handleUpdatePermission() {
    if (!editPermissionName.trim() || !editPermissionId) return;
    await updatePermission(editPermissionId, editPermissionName);
    setEditPermissionId(null);
    setEditPermissionName('');
    fetchPermissions();
  }
  async function handleDeletePermission(id: number) {
    if (window.confirm('Xóa quyền này?')) {
      await deletePermission(id);
      fetchPermissions();
    }
  }

  async function handleTogglePermission(roleId: number, permissionId: number, checked: boolean) {
    if (checked) {
      await assignPermissionToRole(roleId, permissionId);
    } else {
      await removePermissionFromRole(roleId, permissionId);
    }
    fetchRoles();
  }

  return (
    <div className="container py-4">
      <h2>Roles & Permissions Management</h2>
      <div className="row">
        <div className="col-md-6">
          <h4>Roles</h4>
          <div className="mb-2 d-flex gap-2">
            <input type="text" className="form-control" placeholder="Tên vai trò mới" value={newRole} onChange={e => setNewRole(e.target.value)} />
            <button className="btn btn-primary" onClick={handleCreateRole}>Thêm</button>
          </div>
          <ul className="list-group">
            {roles.map(role => (
              <li key={role.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {editRoleId === role.id ? (
                      <>
                        <input type="text" className="form-control" value={editRoleName} onChange={e => setEditRoleName(e.target.value)} />
                        <button className="btn btn-success btn-sm mx-1" onClick={handleUpdateRole}>Lưu</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditRoleId(null); setEditRoleName(''); }}>Hủy</button>
                      </>
                    ) : (
                      <>
                        <span className="fw-bold">{role.name}</span>
                        <button className="btn btn-sm btn-warning mx-1" onClick={() => { setEditRoleId(role.id); setEditRoleName(role.name); }}>Sửa</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteRole(role.id)}>Xóa</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="small">Phân quyền:</span>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {permissions.map(permission => (
                      <label key={permission.id} className="form-check-label">
                        <input
                          type="checkbox"
                          className="form-check-input me-1"
                          checked={rolePermissions[role.id]?.includes(permission.id) || false}
                          onChange={e => handleTogglePermission(role.id, permission.id, e.target.checked)}
                        />
                        {permission.name}
                      </label>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-6">
          <h4>Permissions</h4>
          <div className="mb-2 d-flex gap-2">
            <input type="text" className="form-control" placeholder="Tên quyền mới" value={newPermission} onChange={e => setNewPermission(e.target.value)} />
            <button className="btn btn-primary" onClick={handleCreatePermission}>Thêm</button>
          </div>
          <ul className="list-group">
            {permissions.map(permission => (
              <li key={permission.id} className="list-group-item d-flex justify-content-between align-items-center">
                {editPermissionId === permission.id ? (
                  <>
                    <input type="text" className="form-control" value={editPermissionName} onChange={e => setEditPermissionName(e.target.value)} />
                    <button className="btn btn-success btn-sm mx-1" onClick={handleUpdatePermission}>Lưu</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditPermissionId(null); setEditPermissionName(''); }}>Hủy</button>
                  </>
                ) : (
                  <>
                    <span>{permission.name}</span>
                    <div>
                      <button className="btn btn-sm btn-warning mx-1" onClick={() => { setEditPermissionId(permission.id); setEditPermissionName(permission.name); }}>Sửa</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeletePermission(permission.id)}>Xóa</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
