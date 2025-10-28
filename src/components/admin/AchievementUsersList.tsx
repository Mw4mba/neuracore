"use client";

import React, { useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  unlocked_at: string;
}

interface Props {
  achievementId: string;
}

const AchievementUsersList: React.FC<Props> = ({ achievementId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!achievementId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/achievements/users-by-achievement?achievementId=${achievementId}`);
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [achievementId]);

  if (loading) return <p>Loading users...</p>;
  if (!users.length) return <p>No users have unlocked this achievement yet.</p>;

  return (
    <div className="bg-bg-dark p-6 rounded-lg border border-border-secondary">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Users with this Achievement
      </h3>
      <ul className="divide-y divide-border-secondary">
        {users.map((user) => (
          <li key={user.id} className="py-2 flex justify-between">
            <span>{user.full_name || user.username}</span>
            <span className="text-text-secondary text-sm">
              {new Date(user.unlocked_at).toLocaleDateString("en-US")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AchievementUsersList;
