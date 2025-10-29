"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { Trash2, TriangleAlert, X } from "lucide-react";

export default function UsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/profile/get-all");
        const data = await res.json();
        if (res.ok) setUsers(data.users || []);
        else console.error(data.error);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const res = await fetch("/api/profile/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUser.id }),
      });

      if (!res.ok) throw new Error("Failed to delete user");

      // Remove user from UI
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete user. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold mb-4">Users</h2>

      <div className="bg-bg shadow-sm rounded-xl overflow-hidden border border-border-secondary">
        <table className="w-full text-left">
          <thead className="bg-bg-dark text-text-secondary">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Username</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t hover:bg-bg-dark bg-bg-gray/40 border-border-secondary rounded"
              >
                <td className="p-3">{u.full_name}</td>
                <td className="p-3">{u.username}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => handleDeleteClick(u)}
                    className="text-white px-2 text-sm py-2 rounded cursor-pointer bg-red-600 hover:bg-red-800 flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bg rounded-xl w-full max-w-sm p-6 shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-text-secondary hover:text-text-primary"
            >
              <X size={18} />
            </button>
            <TriangleAlert className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-center">
              Confirm Delete
            </h3>
            <p className="text-sm text-center mb-5 text-text-secondary">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-red-600">
                {selectedUser?.full_name || selectedUser?.username}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-text-primary cursor-pointer border-1 border-transparent  text-bg hover:bg-bg hover:text-text-primary hover:border-text-primary w-full sm:w-auto transition-colors duration-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-red-600 cursor-pointer transition-colors duration-300 hover:bg-red-700 text-white w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
