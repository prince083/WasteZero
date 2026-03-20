import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import Sidebar from "../../components/Sidebar";
import UserManagementTable from "../../components/UserManagementTable";
import Navbar from "../../components/Navbar";

const AdminPanel = () => {
    const { isDarkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        suspended: 0
    });

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">

                {/* Top Bar */}
                <div className={`h-16 flex items-center px-6 border-b ${isDarkMode ? "bg-[#1e293b] border-gray-700" : "bg-white border-gray-200"
                    }`}>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full max-w-md px-4 py-2 rounded-md border text-sm focus:outline-none
    ${isDarkMode
                                ? "bg-[#0f172a] border-gray-600 text-white placeholder-gray-400"
                                : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                            }`}
                    />
                </div>

                {/* <Navbar /> */}

                {/* Content */}
                <div className={`p-6 min-h-screen 
${isDarkMode ? "bg-[#0f172a] text-white" : "bg-gray-100 text-gray-900"}`}>

                    <h1 className="text-2xl font-bold mb-6">
                        Admin Control Panel
                    </h1>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className={`p-4 rounded-xl shadow 
        ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}>
                            <p className="text-gray-400 text-sm">Total Users</p>
                            <h2 className="text-2xl font-bold">{stats.total}</h2>
                        </div>

                        <div className={`p-4 rounded-xl shadow 
        ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}>
                            <p className="text-gray-400 text-sm">Active Users</p>
                            <h2 className="text-green-400 text-2xl font-bold">{stats.active}</h2>
                        </div>

                        <div className={`p-4 rounded-xl shadow 
        ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}>
                            <p className="text-gray-400 text-sm">Suspended</p>
                            <h2 className="text-red-400 text-2xl font-bold">{stats.suspended}</h2>
                        </div>

                    </div>

                    {/* Table */}
                    <div className={`p-4 mt-6 rounded-xl ${isDarkMode ? "bg-[#1e293b]" : "bg-white shadow"
                        }`}>
                        <UserManagementTable setStats={setStats} searchTerm={searchTerm} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminPanel;