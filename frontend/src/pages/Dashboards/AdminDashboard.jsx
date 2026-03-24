import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import opportunityService from '../../services/opportunityService';
import wasteService from '../../services/wasteService';
import { exportRowsToCsv } from '../../services/csvExportService';

import { useTheme } from '../../context/ThemeContext';
import adminService from '../../services/adminService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const AdminDashboard = () => {
    const { isDarkMode } = useTheme();
    const [stats, setStats] = useState({
        users: { total: 0 },
        opportunities: { total: 0 },
        pickups: { total: 0 }
    });
    const [categoryData, setCategoryData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [categories, trends, platformStats] = await Promise.all([
                    wasteService.getStatsByCategory(),
                    wasteService.getWasteTrends(),
                    adminService.getPlatformStats()
                ]);

                setCategoryData(categories);
                setStats(platformStats);

                // Map months for better display
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const formattedTrends = trends.map(t => ({
                    ...t,
                    name: monthNames[t.month - 1]
                }));
                setTrendData(formattedTrends);

            } catch (err) {
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);


    const downloadWasteReport = () => {
        exportRowsToCsv({
            filename: 'waste-impact-report.csv',
            rows: trendData,
            columns: [
                { key: 'name', label: 'Month' },
                { key: 'totalWeight', label: 'Total Weight (kg)' }
            ]
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Admin Overview</h1>
                <Link 
                    to="/admin-panel" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                    Open Control Panel 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </Link>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className={`p-4 rounded-xl shadow ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}>
                    <p className="text-gray-400 text-sm">Total Users</p>
                    <h2 className="text-green-400 text-2xl font-bold">{stats.users?.total || 0}</h2>
                    <div className="mt-1 text-[10px] text-green-500 font-medium">Platform wide</div>
                </div>
                <div className={`p-4 rounded-xl shadow ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}>
                    <p className="text-gray-400 text-sm">Total Opportunities</p>
                    <h2 className="text-orange-400 text-2xl font-bold">{stats.opportunities?.total || 0}</h2>
                    <div className="mt-1 text-[10px] text-orange-400 font-medium">Active content</div>
                </div>
                <div className={`p-4 rounded-xl shadow ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}>
                    <p className="text-gray-400 text-sm">Total Pickups</p>
                    <h2 className="text-blue-400 text-2xl font-bold">{stats.pickups?.total || 0}</h2>
                    <div className="mt-1 text-[10px] text-blue-400 font-medium">Closed requests</div>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className={`p-6 rounded-xl shadow ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}>
                    <h2 className="text-lg font-bold mb-6 dark:text-white uppercase tracking-wider">Waste by Category (kg)</h2>
                    <div className="h-[300px]" style={{ height: '300px', minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="totalWeight"
                                    nameKey="_id"
                                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={`p-6 rounded-xl shadow ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}>
                    <h2 className="text-lg font-bold mb-6 dark:text-white uppercase tracking-wider">Collection Trends (kg)</h2>
                    <div className="h-[300px]" style={{ height: '300px', minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="totalWeight" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mb-8 -mt-2">
                <button 
                  onClick={downloadWasteReport}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm transition-all shadow-md flex items-center gap-2"
                >
                    Download Full Waste Report (.csv)
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
