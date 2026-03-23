import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import { exportRowsToCsv } from "../services/csvExportService";
import { useAuth } from "../context/AuthContext";

const UserManagementTable = ({ setStats, searchTerm }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isDarkMode } = useTheme();
    const { user: currentUser } = useAuth();

    // Fetch users from backend on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get("/admin/users");
                setUsers(res.data);
            } catch (err) {
                console.error("Failed to fetch users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Recalculate stats whenever users change
    useEffect(() => {
        const total = users.length;
        const suspended = users.filter((u) => u.status === "suspended").length;
        const active = total - suspended;
        setStats({ total, active, suspended });
    }, [users, setStats]);

    // Toggle suspend / unsuspend
    const toggleStatus = async (userId) => {
        try {
            const user = users.find((u) => u._id === userId);
            const isSuspended = user.status === "suspended";
            const endpoint = isSuspended
                ? `/admin/unsuspend/${userId}`
                : `/admin/suspend/${userId}`;
            await api.put(endpoint);
            setUsers((prev) =>
                prev.map((u) =>
                    u._id === userId ? { ...u, status: isSuspended ? "active" : "suspended" } : u
                )
            );
        } catch (err) {
            console.error("Failed to toggle user status:", err);
        }
    };

    // Filter users by searchTerm (name or email)
    const filteredUsers = users.filter((u) => {
        const term = (searchTerm || "").toLowerCase();
        return (
            u.name?.toLowerCase().includes(term) ||
            u.email?.toLowerCase().includes(term)
        );
    });

    const downloadUsers = () => {
        exportRowsToCsv({
            filename: 'user-report.csv',
            rows: filteredUsers,
            columns: [
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role' },
                { key: 'status', label: 'Status' }
            ]
        });
    };

    if (loading) {
        return (
            <p className="text-gray-400 text-sm text-center py-4">
                Loading users...
            </p>
        );
    }

    if (filteredUsers.length === 0) {
        return (
            <p className="text-gray-400 text-sm text-center py-4">
                No users found.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <div className="flex justify-end mb-4">
                <button 
                  onClick={downloadUsers}
                  disabled={filteredUsers.length === 0}
                  className="px-3 py-1 text-xs font-bold uppercase transition-colors rounded-lg bg-green-600/10 text-green-600 hover:bg-green-600 hover:text-white"
                >
                    Download User Report (.csv)
                </button>
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className={`text-left border-b ${isDarkMode ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}>
                        <th className="pb-3 pr-4 font-semibold">Name</th>
                        <th className="pb-3 pr-4 font-semibold">Email</th>
                        <th className="pb-3 pr-4 font-semibold">Role</th>
                        <th className="pb-3 pr-4 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((user) => (
                        <tr
                            key={user._id}
                            className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}
                        >
                            <td className="py-3 pr-4">{user.name}</td>
                            <td className="py-3 pr-4 text-gray-400">{user.email}</td>
                            <td className="py-3 pr-4 capitalize">{user.role}</td>
                            <td className="py-3 pr-4">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "suspended"
                                            ? "bg-red-100 text-red-600"
                                            : "bg-green-100 text-green-600"
                                        }`}
                                >
                                    {user.status === "suspended" ? "Suspended" : "Active"}
                                </span>
                            </td>
                            <td className="py-3">
                                <button
                                    onClick={() => toggleStatus(user._id)}
                                    disabled={currentUser?._id === user._id}
                                    title={currentUser?._id === user._id ? "You cannot suspend yourself" : ""}
                                    className={`px-3 py-1 rounded text-sm font-medium text-white transition-colors ${
                                        currentUser?._id === user._id
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : user.status === "suspended"
                                                ? "bg-green-500 hover:bg-green-600"
                                                : "bg-red-500 hover:bg-red-600"
                                    }`}
                                >
                                    {user.status === "suspended" ? "Unsuspend" : "Suspend"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementTable;