'use client';

import React, { useState, useEffect } from 'react';
import { databaseClient } from '@/utils/tbase/bundler';
import toast, { Toaster } from 'react-hot-toast';

interface Permission {
  id: string;
  itemId: string;
  requireAction: string;
  requireRole: string | null;
}

interface UserPermission {
  id: string;
  userId: string;
  onDoc: string;
  permission: string;
}

const PermissionPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [selectedUserPermission, setSelectedUserPermission] = useState<UserPermission | null>(null);
  const [drawerMode, setDrawerMode] = useState<'addPermission' | 'editPermission' | 'addUserPermission' | 'editUserPermission'>('addPermission');
  const [permissionForm, setPermissionForm] = useState({
    itemId: '',
    requireAction: '',
    requireRole: '',
  });
  const [userPermissionForm, setUserPermissionForm] = useState({
    userId: '',
    onDoc: '',
    permission: '',
  });

  // Fetch permissions and user permissions on mount
  useEffect(() => {
    databaseClient.getPermissions(null).then((response: any) => {
      if (response.status === 'success') {
        setPermissions(response.data || []);
      } else {
        toast.error('Failed to fetch permissions');
      }
    });

    databaseClient.getUserPermissions('', null).then((response: any) => {
      if (response.status === 'success') {
        setUserPermissions(response.data || []);
      } else {
        toast.error('Failed to fetch user permissions');
      }
    });
  }, []);

  const handleCreatePermission = async () => {
    const response = await databaseClient.createPermission(
      permissionForm.itemId,
      permissionForm.requireAction,
      permissionForm.requireRole || null
    );
    if (response.status === 'success') {
      setPermissions((prev) => [...prev, response.data]);
      setDrawerOpen(false);
      setPermissionForm({ itemId: '', requireAction: '', requireRole: '' });
      toast.success('Permission created successfully!');
    } else {
      toast.error('Failed to create permission: ' + response.message);
    }
  };

  const handleEditPermission = async () => {
    if (!selectedPermission) return;
    const response = await databaseClient.updatePermission(
      selectedPermission.id,
      permissionForm.itemId,
      permissionForm.requireAction,
      permissionForm.requireRole || null
    );
    if (response.status === 'success') {
      setPermissions((prev) =>
        prev.map((p) =>
          p.id === selectedPermission.id ? { ...p, ...permissionForm } : p
        )
      );
      setDrawerOpen(false);
      setPermissionForm({ itemId: '', requireAction: '', requireRole: '' });
      setSelectedPermission(null);
      toast.success('Permission updated successfully!');
    } else {
      toast.error('Failed to update permission: ' + response.message);
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    const response = await databaseClient.deletePermission(permissionId);
    if (response.status === 'success') {
      setPermissions((prev) => prev.filter((p) => p.id !== permissionId));
      toast.success('Permission deleted successfully!');
    } else {
      toast.error('Failed to delete permission: ' + response.message);
    }
  };

  const handleCreateUserPermission = async () => {
    const response = await databaseClient.createUserPermission(
      userPermissionForm.userId,
      userPermissionForm.onDoc,
      userPermissionForm.permission
    );
    if (response.status === 'success') {
      setUserPermissions((prev) => [...prev, response.data]);
      setDrawerOpen(false);
      setUserPermissionForm({ userId: '', onDoc: '', permission: '' });
      toast.success('User permission created successfully!');
    } else {
      toast.error('Failed to create user permission: ' + response.message);
    }
  };

  const handleEditUserPermission = async () => {
    if (!selectedUserPermission) return;
    const response = await databaseClient.updateUserPermission(
      selectedUserPermission.id,
      userPermissionForm.onDoc,
      userPermissionForm.permission
    );
    if (response.status === 'success') {
      setUserPermissions((prev) =>
        prev.map((p) =>
          p.id === selectedUserPermission.id ? { ...p, ...userPermissionForm } : p
        )
      );
      setDrawerOpen(false);
      setUserPermissionForm({ userId: '', onDoc: '', permission: '' });
      setSelectedUserPermission(null);
      toast.success('User permission updated successfully!');
    } else {
      toast.error('Failed to update user permission: ' + response.message);
    }
  };

  const handleDeleteUserPermission = async (permissionId: string) => {
    const response = await databaseClient.deleteUserPermission(permissionId);
    if (response.status === 'success') {
      setUserPermissions((prev) => prev.filter((p) => p.id !== permissionId));
      toast.success('User permission deleted successfully!');
    } else {
      toast.error('Failed to delete user permission: ' + response.message);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <h2 className="text-2xl font-bold mb-4">Permissions</h2>
      <div className="flex justify-end mb-4">
        <label
          htmlFor="permission-drawer"
          className="btn btn-primary"
          onClick={() => {
            setDrawerMode('addPermission');
            setDrawerOpen(true);
          }}
        >
          + Create Permission
        </label>
        <label
          htmlFor="permission-drawer"
          className="btn btn-primary ml-2"
          onClick={() => {
            setDrawerMode('addUserPermission');
            setDrawerOpen(true);
          }}
        >
          + Create User Permission
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item ID</th>
              <th>Action</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => (
              <tr key={perm.id}>
                <td>{perm.id}</td>
                <td>{perm.itemId}</td>
                <td>{perm.requireAction}</td>
                <td>{perm.requireRole || 'Any'}</td>
                <td>
                  <button
                    className="btn btn-ghost btn-xs mr-2"
                    onClick={() => {
                      setSelectedPermission(perm);
                      setPermissionForm({
                        itemId: perm.itemId,
                        requireAction: perm.requireAction,
                        requireRole: perm.requireRole || '',
                      });
                      setDrawerMode('editPermission');
                      setDrawerOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-error btn-xs"
                    onClick={() => handleDeletePermission(perm.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Document</th>
              <th>Permission</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userPermissions.map((perm) => (
              <tr key={perm.id}>
                <td>{perm.id}</td>
                <td>{perm.userId}</td>
                <td>{perm.onDoc}</td>
                <td>{perm.permission}</td>
                <td>
                  <button
                    className="btn btn-ghost btn-xs mr-2"
                    onClick={() => {
                      setSelectedUserPermission(perm);
                      setUserPermissionForm({
                        userId: perm.userId,
                        onDoc: perm.onDoc,
                        permission: perm.permission,
                      });
                      setDrawerMode('editUserPermission');
                      setDrawerOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-error btn-xs"
                    onClick={() => handleDeleteUserPermission(perm.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="drawer drawer-end">
        <input
          id="permission-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={drawerOpen}
          onChange={() => setDrawerOpen(!drawerOpen)}
        />
        <div className="drawer-content"></div>
        <div className="drawer-side">
          <label htmlFor="permission-drawer" className="drawer-overlay"></label>
          <div className="menu p-4 w-80 text-base-content h-full bg-base-300">
            <h3 className="text-xl font-bold mb-4">
              {drawerMode === 'addPermission'
                ? 'Add Permission'
                : drawerMode === 'editPermission'
                ? 'Edit Permission'
                : drawerMode === 'addUserPermission'
                ? 'Add User Permission'
                : 'Edit User Permission'}
            </h3>
            {(drawerMode === 'addPermission' || drawerMode === 'editPermission') && (
              <div className="space-y-4">
                <div>
                  <label className="label">Item ID</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={permissionForm.itemId}
                    onChange={(e) => setPermissionForm({ ...permissionForm, itemId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Required Action</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={permissionForm.requireAction}
                    onChange={(e) => setPermissionForm({ ...permissionForm, requireAction: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Required Role</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={permissionForm.requireRole}
                    onChange={(e) => setPermissionForm({ ...permissionForm, requireRole: e.target.value })}
                    placeholder="Leave blank for any role"
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={drawerMode === 'addPermission' ? handleCreatePermission : handleEditPermission}
                >
                  {drawerMode === 'addPermission' ? 'Create' : 'Save'}
                </button>
              </div>
            )}
            {(drawerMode === 'addUserPermission' || drawerMode === 'editUserPermission') && (
              <div className="space-y-4">
                <div>
                  <label className="label">User ID</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={userPermissionForm.userId}
                    onChange={(e) => setUserPermissionForm({ ...userPermissionForm, userId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Document</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={userPermissionForm.onDoc}
                    onChange={(e) => setUserPermissionForm({ ...userPermissionForm, onDoc: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Permission</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={userPermissionForm.permission}
                    onChange={(e) => setUserPermissionForm({ ...userPermissionForm, permission: e.target.value })}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={drawerMode === 'addUserPermission' ? handleCreateUserPermission : handleEditUserPermission}
                >
                  {drawerMode === 'addUserPermission' ? 'Create' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionPage;