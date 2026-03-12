import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import opportunityService from '../../services/opportunityService';

const AdminDashboard = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOpportunities = async () => {
            try {
                setLoading(true);
                const data = await opportunityService.getAllOpportunities();
                setOpportunities(data);
            } catch (err) {
                setError(err.message || 'Failed to load opportunities');
            } finally {
                setLoading(false);
            }
        };

        fetchOpportunities();
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

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-none dark:border dark:border-gray-700">
                    <h3 className="font-semibold text-lg dark:text-gray-200">Total Users</h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">1,245</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-none dark:border dark:border-gray-700">
                    <h3 className="font-semibold text-lg dark:text-gray-200">Pending Approvals</h3>
                    <p className="text-3xl font-bold text-orange-500 dark:text-orange-400">23</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-none dark:border dark:border-gray-700">
                    <h3 className="font-semibold text-lg dark:text-gray-200">Total Pickups</h3>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">8,902</p>
                </div>
            </div>

            {/* Opportunity Management Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-none dark:border dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Manage Opportunities</h2>
                </div>

                <div className="p-4">
                    {loading ? (
                        <p className="text-gray-600 dark:text-gray-400">Loading opportunities...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : opportunities.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">No opportunities found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b dark:border-gray-700 text-sm tracking-wider text-gray-500 dark:text-gray-400">
                                        <th className="py-3 px-4 font-semibold">Title</th>
                                        <th className="py-3 px-4 font-semibold">Status</th>
                                        <th className="py-3 px-4 font-semibold">Location</th>
                                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {opportunities.map((opp) => (
                                        <tr key={opp._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <p className="font-medium text-gray-900 dark:text-white">{opp.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{opp.description}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${opp.status === 'open' ? 'bg-green-100 text-green-800' :
                                                    opp.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {opp.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                                                {opp.address}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <Link
                                                        to={`/opportunities/edit/${opp._id}`}
                                                        className="text-blue-500 hover:text-blue-700 font-medium text-sm transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(opp._id)}
                                                        className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
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
