'use client';

import React, { useState, useEffect } from 'react';
import { databaseClient } from '@/utils/tbase/bundler';
import toast, { Toaster } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  status: string;
  updated_at?: string;
}

const AuthPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerMode, setDrawerMode] = useState<'addUser' | 'editUser'>('addUser');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', labels: '' });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const usersPerPage = 12;
  const totalPages = Math.ceil(users.length / usersPerPage);
  const paginatedUsers = users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  // Fetch users on mount
  useEffect(() => {
    databaseClient.users().listAll((usersData: any) => {
      const simplifiedUsers = usersData.map((u: any) => ({
        id: u._id || u.id,
        ...u,
      }));
      setUsers(simplifiedUsers);
      setAllUsers(simplifiedUsers);
    });
  }, []);

  // Handle search
  const filteredUsers = paginatedUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Copy user ID to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('User ID copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy User ID');
    });
  };

  // Avatar API function
  const getAvatarUrl = (name: string) => {
    const encodedName = encodeURIComponent(name || 'Unknown');
    return `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff&size=128`;
  };

  // Handle form submissions
  const handleAddUser = () => {
    databaseClient.signUp(userForm.name, userForm.email, userForm.password, (response) => {
      if (response.status === 'success') {
        const newUser: User = {
          id: response.userId,
          name: userForm.name,
          email: userForm.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          labels: userForm.labels.split(',').map((label) => label.trim()),
          status: 'unverified',
        };
        setUsers((prev) => [...prev, newUser]);
        setAllUsers((prev) => [...prev, newUser]);
        setDrawerOpen(false);
        setUserForm({ name: '', email: '', password: '', labels: '' });
        toast.success('User created successfully!');
      } else {
        toast.error('Failed to create user');
      }
    });
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    const labels = userForm.labels.split(',').map((label) => label.trim());

    console.log("Selected user ID:", selectedUser.id);

    const updateQuery =
      process.env.NEXT_PUBLIC_DATABASE_CHOICE === 'mongodb'
        ? `users.updateOne(
            { _id: "${selectedUser.id}" },
            { $set: { name: "${userForm.name}", email: "${userForm.email}" } }
          )`
        : `UPDATE users SET name = ?, email = ? WHERE id = ?`;

    const updateParams =
      process.env.NEXT_PUBLIC_DATABASE_CHOICE === 'mongodb'
        ? []
        : [userForm.name, userForm.email, selectedUser.id];

    databaseClient
      .update('users:update')
      .query(updateQuery)
      .callback((response: any) => {
        console.log("Update user info response:", response);
        if (response.status === 'success') {
          setUsers((prev) =>
            prev.map((user) =>
              user.id === selectedUser.id
                ? { ...user, name: userForm.name, email: userForm.email }
                : user
            )
          );
          setAllUsers((prev) =>
            prev.map((user) =>
              user.id === selectedUser.id
                ? { ...user, name: userForm.name, email: userForm.email }
                : user
            )
          );

          console.log("Proceeding to update labels for user ID:", selectedUser.id);
          const labelTimeout = setTimeout(() => {
            console.error("Label update timed out after 5 seconds");
            toast.error("Label update timed out");
          }, 5000);

          databaseClient.users().setLabels(selectedUser.id, labels, (labelResponse) => {
            clearTimeout(labelTimeout);
            console.log("Label update response:", labelResponse);
            if (labelResponse.status === 'success') {
              setUsers((prev) =>
                prev.map((user) =>
                  user.id === selectedUser.id ? { ...user, labels } : user
                )
              );
              setAllUsers((prev) =>
                prev.map((user) =>
                  user.id === selectedUser.id ? { ...user, labels } : user
                )
              );

              setDrawerOpen(false);
              setUserForm({ name: '', email: '', password: '', labels: '' });
              setSelectedUser(null);
              toast.success('User updated successfully!');
            } else {
              toast.error(
                'Failed to update user labels: ' + (labelResponse.message || 'Unknown error')
              );
            }
          });
        } else {
          toast.error('Failed to update user: ' + (response.message || 'Unknown error'));
        }
      })
      .execute();
  };

  const deleteUser = () => {   
    if (!selectedUser) return;
    const query = process.env.NEXT_PUBLIC_DATABASE_CHOICE === 'mongodb' ? `users.deleteOne({ _id: "${selectedUser.id}" })` : `DELETE FROM users WHERE id = "${selectedUser.id}"`;
    databaseClient
      .delete('users:delete')
      .query(query)
      .callback((response: any) => {
        console.log("Delete user response:", response);
        if (response.status === 'success') {
          setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
          setAllUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
          setDrawerOpen(false);
          setUserForm({ name: '', email: '', password: '', labels: '' });
          setSelectedUser(null);
          toast.success('User deleted successfully!');
        } else {
          toast.error('Failed to delete user: ' + (response.message || 'Unknown error'));
        }
      })
      .execute()
    }

  return (
    <div className="flex w-full flex-col">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or ID"
          className="input input-bordered w-full max-w-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <label
          htmlFor="auth-drawer"
          className="btn btn-primary"
          onClick={() => {
            setDrawerMode('addUser');
            setDrawerOpen(true);
          }}
        >
          + Create User
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Identifiers</th>
              <th>Status</th>
              <th>ID</th>
              <th>Labels</th>
              <th>Joined</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center space-x-3">
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full">
                        <img src={getAvatarUrl(user.name)} alt="User avatar" />
                      </div>
                    </div>
                    <div>{user.name || 'No name found'}</div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`badge ${
                      user.status === 'verified' ? 'badge-success' : 'badge-warning'
                    }`}
                  >
                    {user.status === 'verified' ? 'verified email' : 'unverified'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => copyToClipboard(user.id)}
                  >
                    Copy ID
                  </button>
                </td>
                <td>{user.labels?.join(', ') || 'None'}</td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
                <td>{new Date(user.updatedAt || user.updated_at || '').toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => {
                      setSelectedUser(user);
                      setUserForm({
                        name: user.name || '',
                        email: user.email || '',
                        password: '',
                        labels: user.labels?.join(', ') || '',
                      });
                      setDrawerMode('editUser');
                      setDrawerOpen(true);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div>
          {usersPerPage} Users per page. Total results: {users.length}
        </div>
        <div className="btn-group">
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button className="btn btn-sm btn-active">{currentPage}</button>
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <div className="drawer drawer-end">
        <input
          id="auth-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={drawerOpen}
          onChange={() => setDrawerOpen(!drawerOpen)}
        />
        <div className="drawer-content"></div>
        <div className="drawer-side">
          <label htmlFor="auth-drawer" className="drawer-overlay"></label>
          <div className="menu p-4 w-80 text-base-content h-full bg-base-300">
            <h3 className="text-xl font-bold mb-4">
              {drawerMode === 'addUser' ? 'Add User' : 'Edit User'}
            </h3>
            {(drawerMode === 'addUser' || drawerMode === 'editUser') && (
              <div className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </div>
                {drawerMode === 'addUser' && (
                  <div>
                    <label className="label">Password</label>
                    <input
                      type="password"
                      className="input input-bordered w-full"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <label className="label">Labels (comma-separated)</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={userForm.labels}
                    onChange={(e) => setUserForm({ ...userForm, labels: e.target.value })}
                  />
                </div>
                <div className='flex items-center justify-between'>
                    <button
                      className="btn btn-primary"
                      onClick={drawerMode === 'addUser' ? handleAddUser : handleEditUser}
                    >
                      {drawerMode === 'addUser' ? 'Create' : 'Save'}
                    </button>
                    {drawerMode === 'editUser' && (<button className='btn btn-error btn-outline text-white' onClick={()=>(deleteUser())}>Delete user</button>)}
                </div>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;