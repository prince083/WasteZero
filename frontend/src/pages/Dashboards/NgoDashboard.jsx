import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaUserCheck, FaMapMarkerAlt, FaCalendarCheck, FaChevronRight, FaCheck, FaTimes, FaInbox, FaFilter, FaUsers, FaCommentDots } from 'react-icons/fa';
import pickupService from '../../services/pickupService';
import opportunityService from '../../services/opportunityService';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const NgoDashboard = () => {
    const navigate = useNavigate();
    const [pickups, setPickups] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
    const [appFilter, setAppFilter] = useState('pending');
    const { isDarkMode } = useTheme();
    const { user } = useAuth();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [pickupsData, volData, appsData] = await Promise.all([
                pickupService.getAssignedPickups(),
                opportunityService.getMyVolunteers(),
                opportunityService.getAllMyApplications()
            ]);
            setPickups(pickupsData);
            setVolunteers(volData);
            setApplications(appsData);
        } catch (err) {
            console.error('NGO Dashboard data load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDispatch = async (pickupId, volunteerId) => {
        if (!volunteerId) return;
        try {
            await pickupService.dispatchPickup(pickupId, volunteerId);
            // Refresh pickups
            const updated = await pickupService.getAssignedPickups();
            setPickups(updated);
            alert('Pickup dispatched successfully! Your volunteer has been notified.');
        } catch (err) {
            alert(err);
        }
    };

    const handleStatusUpdate = async (oppId, appId, status) => {
        try {
            await opportunityService.updateApplicationStatus(oppId, appId, status);
            // Refresh data to update staff list and application list
            await loadDashboardData();
        } catch (err) {
            alert(err);
        }
    };

    const handleChat = (volunteer) => {
        if (!volunteer?._id || !user?._id) {
            console.error('Missing IDs:', { volunteerId: volunteer?._id, userId: user?._id });
            return;
        }
        const roomId = [user._id, volunteer._id].sort().join('_');
        navigate(`/chat/${roomId}`);
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    );

    const pendingPickups = pickups.filter(p => p.status === 'assigned');
    const filteredApps = applications.filter(app => appFilter === 'all' ? true : app.status === appFilter);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold dark:text-gray-100">NGO Dispatch Center</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage local waste pickups and dispatch volunteer field agents.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <FaTruck className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Active Tasks</p>
                            <p className="text-2xl font-bold dark:text-white">{pendingPickups.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <FaUserCheck className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Staff Online</p>
                            <p className="text-2xl font-bold dark:text-white">{volunteers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                            <FaUsers className="text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Pending Apps</p>
                            <p className="text-2xl font-bold dark:text-white">{applications.filter(a => a.status === 'pending').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <FaChevronRight className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Impact Score</p>
                            <p className="text-2xl font-bold dark:text-white">1,250</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Dispatches & Applications */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Dispatches Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold dark:text-white">Pending Dispatches</h2>
                            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                                <button onClick={() => setActiveTab('pending')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-gray-600 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500'}`}>Current</button>
                                <button onClick={() => setActiveTab('history')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white dark:bg-gray-600 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500'}`}>History</button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                            {pendingPickups.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">No pickups requiring dispatch.</div>
                            ) : (
                                pendingPickups.map((pickup) => (
                                    <div key={pickup._id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">{pickup.category}</span>
                                                    <span className="text-xs text-gray-400 font-medium">#{pickup._id.slice(-6)}</span>
                                                </div>
                                                <h3 className="font-bold text-lg mb-1 dark:text-white capitalize">{pickup.address}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(pickup.scheduled_time).toLocaleString()}</p>
                                            </div>
                                            <div className="w-full md:w-64">
                                                <select
                                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-transparent focus:border-green-500 outline-none rounded-xl px-3 py-2 text-sm dark:text-white"
                                                    onChange={(e) => handleDispatch(pickup._id, e.target.value)}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Dispatch to...</option>
                                                    {volunteers.map(vol => <option key={vol._id} value={vol._id}>{vol.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Applications Section (Moved inside Dashboard) */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold dark:text-white">Volunteer Applications</h2>
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                                <button onClick={() => setAppFilter('pending')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${appFilter === 'pending' ? 'bg-white dark:bg-gray-600 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500'}`}>Pending</button>
                                <button onClick={() => setAppFilter('accepted')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${appFilter === 'accepted' ? 'bg-white dark:bg-gray-600 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500'}`}>Accepted</button>
                                <button onClick={() => setAppFilter('rejected')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${appFilter === 'rejected' ? 'bg-white dark:bg-gray-600 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500'}`}>Rejected</button>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                            {filteredApps.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">No {appFilter} applications.</div>
                            ) : (
                                filteredApps.map((app) => (
                                    <div key={app._id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold">
                                                {app.volunteer_id?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold dark:text-white text-sm">{app.volunteer_id?.name}</h4>
                                                <p className="text-[10px] text-gray-400 capitalize">{app.opportunity_id?.title}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {app.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleChat(app.volunteer_id)}
                                                        title="Talk to Volunteer"
                                                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                                                    >
                                                        <FaCommentDots />
                                                    </button>
                                                    <button onClick={() => handleStatusUpdate(app.opportunity_id?._id, app._id, 'accepted')} className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"><FaCheck /></button>
                                                    <button onClick={() => handleStatusUpdate(app.opportunity_id?._id, app._id, 'rejected')} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"><FaTimes /></button>
                                                </>
                                            )}
                                            {app.status !== 'pending' && (
                                                <button
                                                    onClick={() => handleChat(app.volunteer_id)}
                                                    title="Talk to Volunteer"
                                                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                                                >
                                                    <FaCommentDots />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Staff & Context */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-700">
                        <h2 className="text-lg font-bold mb-4 dark:text-white">Active Team</h2>
                        <div className="space-y-4">
                            {volunteers.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No field agents available yet.</p>
                            ) : (
                                volunteers.map((vol) => (
                                    <div key={vol._id} className="flex items-center gap-3 group">
                                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">{vol.name.charAt(0)}</div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold dark:text-white capitalize">{vol.name}</p>
                                            <p className="text-[10px] text-gray-400">{vol.email}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleChat(vol)}
                                                title="Chat with Team Member"
                                                className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                            >
                                                <FaCommentDots size={14} />
                                            </button>
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NgoDashboard;
