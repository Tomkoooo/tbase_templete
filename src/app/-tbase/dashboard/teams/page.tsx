'use client';

import React, { useState, useEffect } from 'react';
import { databaseClient } from '@/utils/tbase/bundler';
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from '../../(components)/userProvider';

interface TeamMember {
  user_id: string;
  role: string;
  labels: string[];
  name?: string; // Name will be added after fetching user details
}

interface Team {
  id: string;
  name: string;
  creatorId: string;
  styling: string;
  users: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  isSuperUser?: boolean;
}

const TeamsPage: React.FC = () => {
  const  user  = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamForm, setTeamForm] = useState({ name: '', styling: '', creatorId: '', color: '#000000', icon: '' });
  const [teamMemberForm, setTeamMemberForm] = useState({ userId: '', role: 'member', labels: '' });
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [drawerMode, setDrawerMode] = useState<'addTeam' | 'editTeam' | 'manageTeamMembers' | null>(null);

// Fetch all users on mount (for the "Add Member" dropdown)
useEffect(() => {
    databaseClient.users().listAll((usersData: any) => {
      const simplifiedUsers = usersData.map((u: any) => ({
        id: u._id || u.id,
        name: u.name,
        isSuperUser: u.isSuperUser || false,
        ...u,
      }));
      console.log('simplifiedUsers:', simplifiedUsers); // Log the transformed data
      setAllUsers(simplifiedUsers); // Update state with the new users
    });
  }, []);

  // Log allUsers after it updates
  useEffect(() => {
    console.log('Updated allUsers:', allUsers); // Log the state after it changes
  }, [allUsers]);

  // Fetch teams and their users' details
  useEffect(() => {
    const userId = user?.isSuperUser ? null : user?.id; // Super users see all teams, others see only their teams
    databaseClient.listTeams(userId).then(async (teamsData: any) => {
      console.log('teamsData:', teamsData); // Log the raw teams data
      if (!teamsData?.teams || teamsData.teams.length === 0) {
        setTeams([]);
        return;
      }

      // Step 1: Collect all unique user IDs from teams
      const userIds = new Set<string>();
      teamsData.teams.forEach((team: any) => {
        (team.users || []).forEach((user: TeamMember) => {
          if (user.user_id) {
            userIds.add(user.user_id);
          }
        });
      });

      // Step 2: Fetch user details from allUsers (no need for separate API calls)
      const userDetailsMap: { [key: string]: User } = {};
      Array.from(userIds).forEach((userId) => {
        const userResponse = allUsers.find((u) => u.id === userId);
        console.log('userResponse:', userResponse); // Log the user details
        userDetailsMap[userId] = {
          id: userResponse?.id || userId,
          name: userResponse?.name || 'Unknown',
          isSuperUser: userResponse?.isSuperUser || false,
        };
      });

      // Step 3: Map teams and add user names
      const simplifiedTeams = teamsData.teams.map((t: any) => {
        const usersWithNames = (t.users || []).map((user: TeamMember) => ({
          ...user,
          name: userDetailsMap[user.user_id]?.name || 'Unknown',
        }));

        // Determine creatorId (first admin, fallback to first user or team.creator_id)
        const adminUser = usersWithNames.find((u: TeamMember) => u.role === 'admin');
        const creatorId = adminUser ? adminUser.user_id : usersWithNames[0]?.user_id || t.creator_id || '';

        return {
          id: t.id,
          name: t.name,
          creatorId,
          styling: t.styling,
          users: usersWithNames,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        };
      });

      setTeams(simplifiedTeams);
    }).catch((error) => {
      console.error('Error fetching teams:', error);
      toast.error('Failed to fetch teams');
    });
  }, [user]);

  // Parse styling JSON and extract color
  const getTeamColor = (styling: string) => {
    try {
      const parsed = JSON.parse(styling);
      return parsed.color || '#000000';
    } catch {
      return '#000000';
    }
  };

  const handleAddTeam = () => {
    const styling = JSON.stringify({ color: teamForm.color, icon: teamForm.icon });
    const creatorId = teamForm.creatorId || (user ? user.id : '');
    if (!creatorId) {
      toast.error('Creator ID is required. Please log in.');
      return;
    }
    databaseClient.createTeam(teamForm.name, styling, creatorId).then((response) => {
      if (response.id) {
        const newTeam: Team = {
          id: response.id,
          name: teamForm.name,
          styling,
          creatorId,
          users: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTeams((prev) => [...prev, newTeam]);
        setDrawerOpen(false);
        setTeamForm({ name: '', styling: '', creatorId: '', color: '#000000', icon: '' });
        toast.success('Team created successfully!');
      } else {
        toast.error('Failed to create team: ' + response.message);
      }
    }).catch((error) => {
      console.error('Error creating team:', error);
      toast.error('Error creating team');
    });
  };

  const handleEditTeam = () => {
    if (!selectedTeam) return;
    const styling = JSON.stringify({ color: teamForm.color, icon: teamForm.icon });
    const userId = user?.id || '';
    if (!userId) {
      toast.error('User ID is required. Please log in.');
      return;
    }

    databaseClient
      .updateTeam(selectedTeam.id, teamForm.name, styling, userId)
      .then((response) => {
        if (response.status === 'success') {
          setTeams((prev) =>
            prev.map((team) =>
              team.id === selectedTeam.id ? { ...team, ...teamForm, styling } : team
            )
          );
          setDrawerOpen(false);
          setTeamForm({ name: '', styling: '', creatorId: '', color: '#000000', icon: '' });
          setSelectedTeam(null);
          toast.success('Team updated successfully!');
        } else {
          toast.error('Failed to update team: ' + response.message);
        }
      }).catch((error) => {
        console.error('Error updating team:', error);
        toast.error('Error updating team');
      });
  };

  const handleDeleteTeam = (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    const userId = user?.id || '';
    if (!userId) {
      toast.error('User ID is required. Please log in.');
      return;
    }

    databaseClient.deleteTeam(teamId, userId).then((response) => {
      if (response.status === 'success') {
        setTeams((prev) => prev.filter((t) => t.id !== teamId));
        toast.success('Team deleted successfully!');
      } else {
        toast.error('Failed to delete team: ' + response.message);
      }
    }).catch((error) => {
      console.error('Error deleting team:', error);
      toast.error('Error deleting team');
    });
  };

  const handleAddTeamMember = async () => {
    if (!selectedTeam) return;
    const userId = user?.id || '';
    const performedBy = user?.id || '';
    if (!userId || !performedBy) {
      toast.error('User authentication is required. Please log in.');
      return;
    }
  
    try {
      const response = await databaseClient.addTeamUser(
        selectedTeam.id,
        teamMemberForm.userId,
        teamMemberForm.role,
        userId,
        performedBy
      );
      if (response && response.status === 'success') {
        const newUser = allUsers.find((u) => u.id === teamMemberForm.userId);
        const userToAdd: TeamMember = {
          user_id: teamMemberForm.userId,
          role: teamMemberForm.role,
          labels: teamMemberForm.labels.split(',').map((label) => label.trim()),
          name: newUser?.name || 'Unknown',
        };
        setTeams((prev) =>
          prev.map((team) =>
            team.id === selectedTeam.id
              ? { ...team, users: [...team.users, userToAdd] }
              : team
          )
        );
        setTeamMemberForm({ userId: '', role: 'member', labels: '' });
        setDrawerOpen(false);
        toast.success('Team member added successfully!');
      } else {
        toast.error('Failed to add team member: ' + (response?.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member: ' + error.message);
    }
  };

  const handleRemoveTeamMember = async (teamId: string, userId: string) => {
    const removedBy = user?.id || '';
    if (!removedBy) {
      toast.error('User ID is required. Please log in.');
      return;
    }

    const response = await databaseClient.removeTeamUser(teamId, userId, removedBy);
    if (response.status === 'success') {
      setTeams((prev) =>
        prev.map((team) =>
          team.id === teamId
            ? {
                ...team,
                users: team.users.filter((user) => user.user_id !== userId),
              }
            : team
        )
      );
      toast.success('Team member removed successfully!');
    } else {
      toast.error('Failed to remove team member: ' + response.message);
    }
  };

  const handleUpdateMemberLabels = async () => {
    if (!selectedTeam || !selectedMember) return;
    const updatedBy = user?.id || '';
    if (!updatedBy) {
      toast.error('User ID is required. Please log in.');
      return;
    }

    const labels = teamMemberForm.labels.split(',').map((label) => label.trim());
    const response = await databaseClient.updateTeamUserLabels(
      selectedTeam.id,
      selectedMember.user_id,
      labels,
      updatedBy
    );
    if (response.status === 'success') {
      setTeams((prev) =>
        prev.map((team) =>
          team.id === selectedTeam.id
            ? {
                ...team,
                users: team.users.map((user) =>
                  user.user_id === selectedMember.user_id
                    ? { ...user, labels }
                    : user
                ),
              }
            : team
        )
      );
      setTeamMemberForm({ userId: '', role: 'member', labels: '' });
      setSelectedMember(null);
      setDrawerOpen(false);
      toast.success('Team member labels updated successfully!');
    } else {
      toast.error('Failed to update team member labels: ' + response.message);
    }
  };

  const logState = (mode: string, open: boolean) => {
    console.log(`${mode}: ${open}`);
  };

  return (
    <div className="flex w-full flex-col">
      <h2 className="text-2xl font-bold mb-4">Teams</h2>
      <div className="flex justify-end mb-4">
        <label
          htmlFor="team-drawer"
          className="btn btn-primary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDrawerMode('addTeam');
            setTeamForm({
              name: '',
              styling: '',
              creatorId: user ? user.id : '',
              color: '#000000',
              icon: '',
            });
            setDrawerOpen(true);
            logState('addTeam', true);
          }}
        >
          + Create Team
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Creator ID</th>
              <th>Members</th>
              <th>Color</th>
              <th>Created At</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td>{team.name}</td>
                <td>{team.creatorId}</td>
                <td>{team.users.length}</td>
                <td>
                  <span
                    className="badge"
                    style={{ backgroundColor: getTeamColor(team.styling) }}
                  >
                    {getTeamColor(team.styling)}
                  </span>
                </td>
                <td>{new Date(team.createdAt).toLocaleString()}</td>
                <td>{new Date(team.updatedAt).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-ghost btn-xs mr-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const parsedStyling = JSON.parse(team.styling || '{"color": "#000000", "icon": ""}');
                      setSelectedTeam(team);
                      setTeamForm({
                        name: team.name,
                        styling: team.styling,
                        creatorId: team.creatorId,
                        color: parsedStyling.color || '#000000',
                        icon: parsedStyling.icon || '',
                      });
                      setDrawerMode('editTeam');
                      setDrawerOpen(true);
                      logState('editTeam', true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-xs mr-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedTeam(team);
                      setDrawerMode('manageTeamMembers');
                      setDrawerOpen(true);
                      logState('manageTeamMembers', true);
                    }}
                  >
                    Manage Members
                  </button>
                  <button
                    className="btn btn-error btn-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteTeam(team.id);
                    }}
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
          id="team-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={drawerOpen}
        />
        <div className="drawer-content"></div>
        <div className="drawer-side">
          <label htmlFor="team-drawer" className="drawer-overlay" onClick={() => {
            setDrawerOpen(false);
            logState(drawerMode || 'unknown', false);
          }}></label>
          <div className="menu p-4 w-80 text-base-content h-full bg-base-300">
            <h3 className="text-xl font-bold mb-4">
              {drawerMode === 'addTeam'
                ? 'Add Team'
                : drawerMode === 'editTeam'
                ? 'Edit Team'
                : 'Manage Team Members'}
            </h3>
            {(drawerMode === 'addTeam' || drawerMode === 'editTeam') && (
              <div className="space-y-4">
                <div>
                  <label className="label">Team Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Color</label>
                  <input
                    type="color"
                    className="input input-bordered w-full"
                    value={teamForm.color}
                    onChange={(e) => setTeamForm({ ...teamForm, color: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Icon</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={teamForm.icon}
                    onChange={(e) => setTeamForm({ ...teamForm, icon: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Creator ID</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={teamForm.creatorId}
                    onChange={(e) => setTeamForm({ ...teamForm, creatorId: e.target.value })}
                    disabled={drawerMode === 'editTeam'}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={drawerMode === 'addTeam' ? handleAddTeam : handleEditTeam}
                >
                  {drawerMode === 'addTeam' ? 'Create' : 'Save'}
                </button>
              </div>
            )}
            {drawerMode === 'manageTeamMembers' && selectedTeam && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold">Add Member</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="label">Select User</label>
                      <select
                        className="select select-bordered w-full"
                        value={teamMemberForm.userId}
                        onChange={(e) =>
                          setTeamMemberForm({ ...teamMemberForm, userId: e.target.value })
                        }
                      >
                        <option value="">Select a user</option>
                        {allUsers
                          .filter((user) => !selectedTeam.users.some((m) => m.user_id === user.id))
                          .map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.id})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Role</label>
                      <select
                        className="select select-bordered w-full"
                        value={teamMemberForm.role}
                        onChange={(e) =>
                          setTeamMemberForm({ ...teamMemberForm, role: e.target.value })
                        }
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Labels (comma-separated)</label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={teamMemberForm.labels}
                        onChange={(e) =>
                          setTeamMemberForm({ ...teamMemberForm, labels: e.target.value })
                        }
                      />
                    </div>
                    <button className="btn btn-primary w-full" onClick={handleAddTeamMember}>
                      Add Member
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mt-4">Current Members</h4>
                  {selectedTeam.users.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedTeam.users.map((user) => (
                        <li
                          key={user.user_id}
                          className="flex justify-between items-center p-2 bg-base-200 rounded"
                        >
                          <span>
                            {user.name} ({user.user_id}) - {user.role}
                          </span>
                          <div>
                            <button
                              className="btn btn-ghost btn-xs mr-2"
                              onClick={() => {
                                setSelectedMember(user);
                                setTeamMemberForm({
                                  userId: user.user_id,
                                  role: user.role,
                                  labels: user.labels.join(', '),
                                });
                                setDrawerMode('manageTeamMembers');
                              }}
                            >
                              Edit Labels
                            </button>
                            <button
                              className="btn btn-error btn-xs"
                              onClick={() =>
                                handleRemoveTeamMember(selectedTeam.id, user.user_id)
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No members in this team.</p>
                  )}
                </div>
                {selectedMember && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">Edit Labels for {selectedMember.name}</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="label">Labels (comma-separated)</label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={teamMemberForm.labels}
                          onChange={(e) =>
                            setTeamMemberForm({ ...teamMemberForm, labels: e.target.value })
                          }
                        />
                      </div>
                      <button
                        className="btn btn-primary w-full"
                        onClick={handleUpdateMemberLabels}
                      >
                        Save Labels
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;