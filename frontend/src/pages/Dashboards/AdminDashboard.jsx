import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import opportunityService from '../../services/opportunityService';
import wasteService from '../../services/wasteService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const AdminDashboard = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [opps, categories, trends] = await Promise.all([
                    opportunityService.getAllOpportunities(),
                    wasteService.getStatsByCategory(),
                    wasteService.getWasteTrends()
                ]);

                setOpportunities(opps);
                setCategoryData(categories);

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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this opportunity?')) {
            try {
                await opportunityService.deleteOpportunity(id);
                setOpportunities(prev => prev.filter(opp => opp._id !== id));
            } catch (err) {
                alert(err.message || 'Failed to delete opportunity');
            }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-black mb-8 dark:text-white tracking-tight">Admin Dashboard</h1>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-700">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Users</h3>
                    <p className="text-4xl font-black text-green-600 dark:text-green-400">1,245</p>
                    <div className="mt-2 text-xs text-green-500 font-bold">+12% from last month</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-700">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Pending Approvals</h3>
                    <p className="text-4xl font-black text-orange-500 dark:text-orange-400">23</p>
                    <div className="mt-2 text-xs text-orange-400 font-bold">Action required soon</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-700">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Pickups</h3>
                    <p className="text-4xl font-black text-blue-600 dark:text-blue-400">8,902</p>
                    <div className="mt-2 text-xs text-blue-400 font-bold">98% success rate</div>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-700">
                    <h2 className="text-xl font-black mb-6 dark:text-white uppercase tracking-wider">Waste by Category (kg)</h2>
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
                                    nameKey="category"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-700">
                    <h2 className="text-xl font-black mb-6 dark:text-white uppercase tracking-wider">Collection Trends (kg)</h2>
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

            {/* Opportunity Management Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-wider">Manage Opportunities</h2>
                </div>

                <div className="p-6">
                    {error ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-center font-medium">{error}</div>
                    ) : opportunities.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400 italic">No opportunities found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs font-black text-gray-400 uppercase tracking-widest border-b dark:border-gray-700">
                                        <th className="py-4 px-2">Opportunity</th>
                                        <th className="py-4 px-2 text-center">Status</th>
                                        <th className="py-4 px-2">Location</th>
                                        <th className="py-4 px-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {opportunities.map((opp) => (
                                        <tr key={opp._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                            <td className="py-5 px-2">
                                                <p className="font-bold text-gray-900 dark:text-white">{opp.title}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tight">{opp.ngo_id?.name}</p>
                                            </td>
                                            <td className="py-5 px-2 text-center">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${opp.status === 'open' ? 'bg-green-100 text-green-700' :
                                                    opp.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {opp.status}
                                                </span>
                                            </td>
                                            <td className="py-5 px-2 max-w-[200px]">
                                                <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{opp.address}</p>
                                            </td>
                                            <td className="py-5 px-2 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        to={`/opportunities/edit/${opp._id}`}
                                                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(opp._id)}
                                                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
