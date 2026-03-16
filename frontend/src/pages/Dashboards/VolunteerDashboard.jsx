import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaMapMarkerAlt, FaStar, FaHistory, FaClock } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import opportunityService from '../../services/opportunityService';

const VolunteerDashboard = () => {
    const { isDarkMode } = useTheme();
    const [matches, setMatches] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [matchError, setMatchError] = useState(null);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch matches and applications in parallel
                const [matchRes, appsData] = await Promise.all([
                    axios.get('http://localhost:3000/api/matches', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    opportunityService.getAppliedOpportunities()
                ]);

                if (matchRes.data.success) {
                    setMatches(matchRes.data.data);
                }
                setApplications(appsData);
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
                setMatchError('Could not load some dashboard sections.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 dark:text-gray-100">Volunteer Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pickups</h3>
                    <p className="text-3xl font-black text-green-600 dark:text-green-400">45</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Applications</h3>
                    <p className="text-3xl font-black text-blue-500 dark:text-blue-400">{applications.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Matches</h3>
                    <p className="text-3xl font-black text-yellow-500 dark:text-yellow-400">{matches.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Impact</h3>
                    <p className="text-3xl font-black text-purple-600 dark:text-purple-400">850</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Match Suggestions */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold dark:text-gray-100 flex items-center gap-3">
                                <FaStar className="text-yellow-400" /> Top Matches
                            </h2>
                            {matches.length > 3 && (
                                <button
                                    onClick={() => setShowAll(prev => !prev)}
                                    className="text-sm text-green-600 hover:text-green-700 font-bold"
                                >
                                    {showAll ? 'Show Less' : `View All (${matches.length})`}
                                </button>
                            )}
                        </div>

                        {matches.length === 0 ? (
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-8 rounded-2xl text-center">
                                <p className="text-gray-500 dark:text-gray-400 italic">No personalized matches yet. Add skills to your profile!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(showAll ? matches : matches.slice(0, 4)).map(({ opportunity, skillScore, matchedSkills, distanceKm }) => (
                                    <div
                                        key={opportunity._id}
                                        className="group bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 border border-transparent hover:border-green-200 dark:hover:border-green-900 transition-all"
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400">{skillScore}% Match</span>
                                            {distanceKm && <span className="text-[10px] text-gray-400 font-bold">{distanceKm} km</span>}
                                        </div>
                                        <h3 className="font-bold dark:text-white mb-1 group-hover:text-green-600 transition-colors capitalize">{opportunity.title}</h3>
                                        <p className="text-xs text-gray-500 mb-4">{opportunity.ngo_id?.name}</p>

                                        <div className="flex flex-wrap gap-1 mb-6">
                                            {matchedSkills.slice(0, 3).map(s => (
                                                <span key={s} className="px-2 py-0.5 bg-white dark:bg-gray-600 text-[9px] font-bold rounded shadow-sm text-gray-500 dark:text-gray-400">{s}</span>
                                            ))}
                                        </div>

                                        <Link
                                            to={`/opportunities/${opportunity._id}`}
                                            className="block w-full text-center py-2 bg-white dark:bg-gray-600 hover:bg-green-600 hover:text-white dark:hover:bg-green-600 text-green-600 dark:text-green-400 rounded-xl text-xs font-bold transition-all border border-green-50 dark:border-gray-500"
                                        >
                                            View Opportunity
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Application Status */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
                            <FaHistory className="text-blue-500 text-sm" /> Track Applications
                        </h2>

                        <div className="space-y-4">
                            {applications.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">No applications sent yet.</p>
                            ) : (
                                applications.map((app) => (
                                    <div key={app._id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-bold dark:text-white line-clamp-1">{app.opportunity_id?.title}</h4>
                                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                            <FaClock />
                                            <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {applications.length > 5 && (
                            <button className="w-full mt-6 text-xs font-bold text-gray-400 hover:text-green-600 transition-colors uppercase tracking-widest">
                                View Full History
                            </button>
                        )}
                    </div>

                    {/* Quick Link Card */}
                    <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-3xl text-white shadow-xl shadow-green-900/20">
                        <h3 className="font-bold mb-2">Need a Task?</h3>
                        <p className="text-[11px] opacity-80 leading-relaxed mb-4">
                            Schedule a waste pickup for your household or join a local recycling drive today!
                        </p>
                        <Link to="/schedule-pickup" className="inline-block px-4 py-2 bg-white text-green-700 text-xs font-bold rounded-xl shadow-lg">
                            Schedule Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
