import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import opportunityService from '../../services/opportunityService';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

const OpportunityList = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [appliedOpportunities, setAppliedOpportunities] = useState(new Set());
    const [applyingId, setApplyingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    // Fetch opportunities on mount
    useEffect(() => {
        const fetchOpportunities = async () => {
            try {
                setLoading(true);
                const data = await opportunityService.getAllOpportunities();
                setOpportunities(data);

                // Load applied opportunities if user is volunteer
                if (user?.role === 'volunteer') {
                    const applied = await opportunityService.getAppliedOpportunities();
                    setAppliedOpportunities(new Set(applied.map(opp => opp._id)));
                }
            } catch (err) {
                setError(err.message || 'Failed to load opportunities');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOpportunities();
    }, [user]);

    const handleApply = async (opportunityId) => {
        if (!user) {
            alert('Please log in to apply for opportunities');
            return;
        }

        if (user.role !== 'volunteer') {
            alert('Only volunteers can apply for opportunities');
            return;
        }

        try {
            setApplyingId(opportunityId);
            await opportunityService.applyForOpportunity(opportunityId);
            setAppliedOpportunities(prev => new Set([...prev, opportunityId]));
            alert('Successfully applied for the opportunity!');
        } catch (err) {
            alert(err.message || 'Failed to apply for opportunity');
            console.error(err);
        } finally {
            setApplyingId(null);
        }
    };

    const handleDelete = async (opportunityId) => {
        if (window.confirm('Are you sure you want to delete this opportunity?')) {
            try {
                await opportunityService.deleteOpportunity(opportunityId);
                setOpportunities(prev => prev.filter(opp => opp._id !== opportunityId));
            } catch (err) {
                alert(err.message || 'Failed to delete opportunity');
            }
        }
    };

    const filteredOpportunities = opportunities.filter(opp => {
        if (filterStatus === 'all') return true;
        return opp.status === filterStatus;
    });

    if (loading) {
        return (
            <div className={`flex h-screen w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                            <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading opportunities...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex h-screen w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Opportunities</h1>
                                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Find and apply for volunteering opportunities</p>
                            </div>

                            {(user?.role === 'ngo' || user?.role === 'admin') && (
                                <Link
                                    to="/opportunities/create"
                                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 hover:shadow-green-500/20 transition-all active:scale-95"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Post New Opportunity
                                </Link>
                            )}
                        </div>

                        {/* Filter Section */}
                        <div className="mb-8">
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : isDarkMode ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-green-600' : 'bg-white text-gray-700 border border-gray-300 hover:border-green-600'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterStatus('open')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'open'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : isDarkMode ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-green-600' : 'bg-white text-gray-700 border border-gray-300 hover:border-green-600'
                                        }`}
                                >
                                    Open
                                </button>
                                <button
                                    onClick={() => setFilterStatus('in-progress')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'in-progress'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : isDarkMode ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-green-600' : 'bg-white text-gray-700 border border-gray-300 hover:border-green-600'
                                        }`}
                                >
                                    In Progress
                                </button>
                                <button
                                    onClick={() => setFilterStatus('closed')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'closed'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : isDarkMode ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-green-600' : 'bg-white text-gray-700 border border-gray-300 hover:border-green-600'
                                        }`}
                                >
                                    Closed
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className={`mb-8 border rounded-lg p-4 ${isDarkMode ? 'bg-red-900 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Opportunities Grid */}
                        {filteredOpportunities.length === 0 ? (
                            <div className="text-center py-20 bg-opacity-5 bg-gray-500 rounded-2xl border-2 border-dashed border-opacity-10 border-gray-500">
                                <p className={isDarkMode ? 'text-gray-500 text-lg' : 'text-gray-500 text-lg'}>No opportunities found</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredOpportunities.map(opportunity => (
                                    <div
                                        key={opportunity._id}
                                        className={`rounded-xl shadow-sm border overflow-hidden flex flex-col transition-all hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                                    >
                                        {/* Card Header */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1 pr-2">
                                                    <h2 className={`text-xl font-bold line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {opportunity.title}
                                                    </h2>
                                                    {(user?.role === 'ngo' || user?.role === 'admin') && (opportunity.ngo_id === user?.id || user?.role === 'admin') && (
                                                        <div className="flex gap-3 mt-1">
                                                            <Link
                                                                to={`/opportunities/edit/${opportunity._id}`}
                                                                className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(opportunity._id)}
                                                                className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ml-2 ${opportunity.status === 'open'
                                                        ? 'bg-green-100 text-green-800 shadow-sm'
                                                        : opportunity.status === 'in-progress'
                                                            ? 'bg-yellow-100 text-yellow-800 shadow-sm'
                                                            : 'bg-gray-100 text-gray-800 shadow-sm'
                                                        }`}
                                                >
                                                    {opportunity.status}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className={`text-sm mb-6 line-clamp-2 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {opportunity.description}
                                            </p>

                                            {/* Meta Info */}
                                            <div className="space-y-3 mt-auto">
                                                <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="truncate">{opportunity.address}</span>
                                                </div>

                                                {opportunity.duration && (
                                                    <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {opportunity.duration}
                                                    </div>
                                                )}

                                                {/* Skills */}
                                                {opportunity.required_skills?.length > 0 && (
                                                    <div className="pt-2">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {opportunity.required_skills.map((skill, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight bg-green-500 bg-opacity-10 text-green-600 border border-green-500 border-opacity-20`}
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer - Apply Button */}
                                        <div className={`px-6 py-4 border-t ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                            {user?.role === 'volunteer' ? (
                                                <button
                                                    onClick={() => handleApply(opportunity._id)}
                                                    disabled={
                                                        applyingId === opportunity._id ||
                                                        appliedOpportunities.has(opportunity._id) ||
                                                        opportunity.status !== 'open'
                                                    }
                                                    className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 text-sm ${appliedOpportunities.has(opportunity._id)
                                                        ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-300'
                                                        : opportunity.status !== 'open'
                                                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed text-center flex justify-center items-center'
                                                            : applyingId === opportunity._id
                                                                ? 'bg-green-600 text-white cursor-wait opacity-90'
                                                                : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                                                        }`}
                                                >
                                                    {applyingId === opportunity._id ? (
                                                        <span className="flex items-center justify-center">
                                                            <svg
                                                                className="animate-spin h-4 w-4 mr-2"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                ></path>
                                                            </svg>
                                                            Applying...
                                                        </span>
                                                    ) : appliedOpportunities.has(opportunity._id) ? (
                                                        <span className="flex items-center justify-center">
                                                            <svg
                                                                className="w-4 h-4 mr-2"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                            Applied
                                                        </span>
                                                    ) : opportunity.status !== 'open' ? (
                                                        'Opportunity Closed'
                                                    ) : (
                                                        'Apply Now'
                                                    )}
                                                </button>
                                            ) : user?.role === 'ngo' ? (
                                                <div className={`text-center text-sm py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    <p>NGOs cannot apply for opportunities</p>
                                                </div>
                                            ) : (
                                                <a
                                                    href="/login"
                                                    className="block w-full py-2.5 px-4 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 text-center transition-colors text-sm"
                                                >
                                                    Login to Apply
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OpportunityList;
