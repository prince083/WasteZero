import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import Sidebar from "../../components/Sidebar";
import UserManagementTable from "../../components/UserManagementTable";
import OpportunityManagementTable from "../../components/OpportunityManagementTable";
import AuditLogList from "../../components/AuditLogList";
import Navbar from "../../components/Navbar";
import { exportRowsToCsv } from "../../services/csvExportService";
import api from "../../services/api";

const AdminPanel = () => {
    const { isDarkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("users");
    const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0 });
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        if (activeTab === "logs") {
            const fetchLogs = async () => {
                try {
                    setLoadingLogs(true);
                    const res = await api.get("/admin/logs");
                    setLogs(res.data);
                } catch (err) {
                    console.error("Failed to fetch logs:", err);
                } finally {
                    setLoadingLogs(false);
                }
            };
            fetchLogs();
        }
    }, [activeTab]);

    return (
        <div className={`flex h-screen ${isDarkMode ? "bg-[#0f172a] text-white" : "bg-gray-100 text-gray-900"}`}>
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar />

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Admin Control Panel</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab("users")}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    activeTab === "users" ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                }`}
                            >
                                Users
                            </button>
                            <button
                                onClick={() => setActiveTab("content")}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    activeTab === "content" ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                }`}
                            >
                                Content
                            </button>
                            <button
                                onClick={() => setActiveTab("logs")}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    activeTab === "logs" ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                }`}
                            >
                                Audit Logs
                            </button>
                        </div>
                    </div>

                    {activeTab === "users" && (
                        <>
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
                        </>
                    )}

                    {activeTab === "content" && (
                        <div className="space-y-4">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Filter content by title or NGO..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full max-w-md px-4 py-2 rounded-md border text-sm ${isDarkMode
                                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                                        : "bg-white border-gray-300 text-gray-800 placeholder-gray-400"
                                        }`}
                                />
                            </div>
                            <div className={`p-4 rounded-xl shadow ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}>
                                <OpportunityManagementTable searchTerm={searchTerm} />
                            </div>
                        </div>
                    )}

                    {activeTab === "logs" && (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => exportRowsToCsv({
                                        filename: 'audit-logs.csv',
                                        rows: logs,
                                        columns: [
                                            { key: 'action', label: 'Action' },
                                            { key: 'actor', label: 'Actor' },
                                            { key: 'target', label: 'Target' },
                                            { key: 'createdAt', label: 'Created At' }
                                        ]
                                    })}
                                    disabled={logs.length === 0}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all disabled:bg-gray-400"
                                >
                                    Export to CSV
                                </button>
                            </div>
                            {loadingLogs ? (
                                <p className="text-center py-10 text-gray-400">Loading audit history...</p>
                            ) : (
                                <AuditLogList logs={logs} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;