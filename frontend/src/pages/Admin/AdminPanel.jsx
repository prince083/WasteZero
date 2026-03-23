import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import Sidebar from "../../components/Sidebar";
import UserManagementTable from "../../components/UserManagementTable";
import Navbar from "../../components/Navbar";
import { exportRowsToCsv } from "../../services/csvExportService";

const AdminPanel = () => {
    const { isDarkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0 });

    return (
        <div className={`flex h-screen ${isDarkMode ? "bg-[#0f172a] text-white" : "bg-gray-100 text-gray-900"}`}>
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar />

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <h1 className="text-2xl font-bold mb-6">Admin Control Panel</h1>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className={`p-4 rounded-xl shadow ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}>
                            <p className="text-gray-400 text-sm">Total Users</p>
                            <h2 className="text-green-400 text-2xl font-bold">{stats.total}</h2>
                        </div>
                        <div className={`p-4 rounded-xl shadow ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}>
                            <p className="text-gray-400 text-sm">Active</p>
                            <h2 className="text-blue-400 text-2xl font-bold">{stats.active}</h2>
                        </div>
                        <div className={`p-4 rounded-xl shadow ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}>
                            <p className="text-gray-400 text-sm">Suspended</p>
                            <h2 className="text-red-400 text-2xl font-bold">{stats.suspended}</h2>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full max-w-md px-4 py-2 rounded-md border text-sm ${isDarkMode
                                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                                : "bg-white border-gray-300 text-gray-800 placeholder-gray-400"
                                }`}
                        />
                    </div>

                    {/* User Management Table */}
                    <div className={`p-4 mt-2 rounded-xl shadow ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}>
                        <UserManagementTable setStats={setStats} searchTerm={searchTerm} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;