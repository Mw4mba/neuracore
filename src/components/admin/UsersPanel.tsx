"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { Trash2, UserCheck } from "lucide-react";

export default function UsersPanel() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("profiles").select("*");
      setUsers(data || []);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <div className="bg-bg shadow-sm rounded-xl overflow-hidden border-border-secondary border">
        <table className="w-full text-left">
          <thead className="bg-bg-dark text-text-secondary">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-bg-dark bg-bg-gray/40 border-border-secondary rounded">
                <td className="p-3">{u.full_name}</td>
                <td className="p-3">{u.username}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3 flex gap-3">
                  {/* <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <UserCheck size={16} /> Promote
                  </button> */}
                  <button className="text-white px-2 text-sm py-2 rounded cursor-pointer bg-red-600 hover:bg-red-800 flex items-center gap-1">
                    <Trash2 size={13} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
