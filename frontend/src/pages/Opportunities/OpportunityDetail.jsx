import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import opportunityService from '../../services/opportunityService';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { FaCommentDots, FaArrowLeft, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser } from 'react-icons/fa';

const OpportunityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDarkMode } = useTheme();

    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [appliedOpportunities, setAppliedOpportunities] = useState(new Set());
    const [applyingId, setApplyingId] = useState(null);

    useEffect(() => {
        const fetchOpportunityDetails = async () => {
            try {
                setLoading(true);
                const data = await opportunityService.getOpportunityById(id);
                setOpportunity(data);

                if (user?.role === 'volunteer') {
                    const applied = await opportunityService.getAppliedOpportunities();
                    setAppliedOpportunities(new Set(applied.map(opp => opp.opportunity_id?._id || opp.opportunity_id)));
                }
            } catch (err) {
                setError(err.message || 'Failed to load opportunity details');
            } finally {
                setLoading(false);
            }
        };

        fetchOpportunityDetails();
    }, [id, user]);

    const handleApply = async () => {
        if (!user || user.role !== 'volunteer') return;

        try {
            setApplyingId(id);
            await opportunityService.applyForOpportunity(id);
            setAppliedOpportunities(prev => new Set([...prev, id]));
            alert('Successfully applied for the opportunity!');
        } catch (err) {
            alert(err.message || 'Failed to apply for opportunity');
        } finally {
            setApplyingId(null);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this opportunity?')) {
            try {
                await opportunityService.deleteOpportunity(id);
                navigate('/opportunities');
            } catch (err) {
                alert(err.message || 'Failed to delete opportunity');
            }
        }
    };

    const handleChatWithNGO = () => {
        if (!user || !opportunity?.ngo_id) return;
        const ngoId = opportunity.ngo_id._id || opportunity.ngo_id;
        const roomId = [user._id, ngoId].sort().join('_');
        navigate(`/chat/${roomId}`);
    };

    if (loading) {
        return (
            <div className={`flex h-screen w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !opportunity) {
        return (
            <div className={`flex h-screen w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar />
                    <div className="flex-1 p-8">
                        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-red-900/30 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            {error || 'Opportunity not found'}
                        </div>
                        <button onClick={() => navigate('/opportunities')} className="mt-4 text-green-600 font-medium hover:underline">
                            &larr; Back to Opportunities
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ngo_id might be populated or an ID string
    const ngoIdVal = opportunity.ngo_id?._id || opportunity.ngo_id;
    const isOwnerOrAdmin = (user?.role === 'ngo' && ngoIdVal === user?._id) || user?.role === 'admin';
    const hasApplied = appliedOpportunities.has(id);
    const isOpen = opportunity.status === 'open';

    return (
        <div className={`flex h-screen w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">

                        {/* Top Bar with Back btn */}
                        <div className="mb-6">
                            <button
                                onClick={() => navigate('/opportunities')}
                                className={`flex items-center gap-2 font-medium transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                <FaArrowLeft /> Back to Opportunities
                            </button>
                        </div>

                        {/* Title & Badge */}
                        <div className="mb-8 flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <h1 className={`text-3xl md:text-4xl font-bold mb-2 text-left ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {opportunity.title}
                                </h1>
                                <p className={`text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Volunteer opportunity details
                                </p>
                            </div>
                            <div className="flex items-start">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider whitespace-nowrap w-fit ${isOpen
                                    ? 'bg-green-100 text-green-800'
                                    : opportunity.status === 'in-progress'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {opportunity.status}
                                </span>
                            </div>
                        </div>

                        {/* Grid Layout: Main content vs Sidebar (Details) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Column (Main Info) */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Description Box */}
                                <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <h2 className="text-xl font-bold mb-4 text-left">Description</h2>
                                    <p className={`whitespace-pre-wrap leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {opportunity.description}
                                    </p>
                                </div>

                                {/* Skills Box */}
                                <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <h2 className="text-xl font-bold mb-4 text-left">Required Skills</h2>
                                    {opportunity.required_skills?.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {opportunity.required_skills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-tight bg-green-500 bg-opacity-10 text-green-600 border border-green-500 border-opacity-20"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No specific skills required.</p>
                                    )}
                                </div>

                            </div>

                            {/* Right Column (Sidebar details) */}
                            <div className="space-y-6">
                                <div className={`p-6 rounded-2xl border shadow-sm sticky top-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <h2 className="text-xl font-bold mb-6 text-left">Opportunity Details</h2>

                                    <div className="space-y-5">
                                        <div className="flex items-start gap-3">
                                            <FaCalendarAlt className="mt-1 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-semibold mb-0.5">Date</p>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {opportunity.date ? new Date(opportunity.date).toLocaleDateString() : 'Flexible / TBD'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <FaClock className="mt-1 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-semibold mb-0.5">Duration</p>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {opportunity.duration || 'Not specified'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <FaMapMarkerAlt className="mt-1 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-semibold mb-0.5">Location</p>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {opportunity.address}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <FaUser className="mt-1 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-semibold mb-0.5">Posted by</p>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {opportunity.ngo_id?.name || 'NGO Participant'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons Section */}
                                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3">
                                        {isOwnerOrAdmin ? (
                                            <div className="flex gap-2 w-full">
                                                <Link
                                                    to={`/opportunities/edit/${opportunity._id}`}
                                                    className={`flex-1 flex justify-center py-2.5 rounded-lg font-semibold transition-colors border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'}`}
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={handleDelete}
                                                    className="flex-1 py-2.5 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ) : user?.role === 'volunteer' ? (
                                            <div className="flex gap-2 w-full">
                                                <button
                                                    onClick={handleApply}
                                                    disabled={applyingId === id || hasApplied || !isOpen}
                                                    className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 text-sm flex justify-center items-center ${hasApplied
                                                        ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-300'
                                                        : !isOpen
                                                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                            : applyingId === id
                                                                ? 'bg-green-600 text-white cursor-wait opacity-90'
                                                                : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-lg hover:shadow-green-500/20 active:scale-95'
                                                        }`}
                                                >
                                                    {hasApplied ? (
                                                        <span className="flex items-center">
                                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            Already Applied
                                                        </span>
                                                    ) : !isOpen ? (
                                                        'Closed'
                                                    ) : applyingId === id ? (
                                                        'Applying...'
                                                    ) : (
                                                        'Apply Now'
                                                    )}
                                                </button>

                                                <button
                                                    onClick={handleChatWithNGO}
                                                    title="Chat with NGO"
                                                    className="w-12 shrink-0 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 transition-colors shadow-sm"
                                                >
                                                    <FaCommentDots size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center text-sm py-2 opacity-70">
                                                Please log in as a volunteer to apply.
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OpportunityDetail;
