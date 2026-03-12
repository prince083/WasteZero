import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import opportunityService from '../../services/opportunityService';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import MapPicker from '../../components/MapPicker';

const OpportunityForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [skillInput, setSkillInput] = useState('');
    const [locationMode, setLocationMode] = useState('manual');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        required_skills: [],
        duration: '',
        date: '',
        address: '',
        status: 'open',
        location: {
            type: 'Point',
            coordinates: [0, 0] // [longitude, latitude]
        }
    });

    useEffect(() => {
        if (isEditMode) {
            const fetchOpportunity = async () => {
                try {
                    const data = await opportunityService.getOpportunityById(id);
                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        required_skills: data.required_skills || [],
                        duration: data.duration || '',
                        date: data.date || '',
                        address: data.address || '',
                        status: data.status || 'open',
                        location: data.location || { type: 'Point', coordinates: [0, 0] }
                    });
                } catch (err) {
                    setError(err.message || 'Failed to fetch opportunity details');
                } finally {
                    setLoading(false);
                }
            };
            fetchOpportunity();
        }
    }, [id, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLocationSelect = async (lat, lng) => {
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                coordinates: [lng, lat]
            }
        }));

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                setFormData(prev => ({ ...prev, address: data.display_name }));
            }
        } catch (error) {
            console.error("Failed to fetch address from map selection:", error);
        }
    };

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!formData.required_skills.includes(skillInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    required_skills: [...prev.required_skills, skillInput.trim()]
                }));
            }
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            required_skills: prev.required_skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            if (isEditMode) {
                await opportunityService.updateOpportunity(id, formData);
            } else {
                await opportunityService.createOpportunity(formData);
            }
            navigate('/opportunities');
        } catch (err) {
            setError(err.message || 'Error processing request');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={`flex h-screen w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">
                                {isEditMode ? 'Edit Opportunity' : 'Create New Opportunity'}
                            </h1>
                            <p className="opacity-70">
                                {isEditMode
                                    ? 'Update the details of your existing volunteering opportunity.'
                                    : 'Fill in the details below to post a new volunteering opportunity.'}
                            </p>
                        </div>

                        {error && (
                            <div className={`mb-6 p-4 rounded-lg border ${isDarkMode ? 'bg-red-900/30 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Opportunity Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                                                placeholder="e.g., Food Distribution Drive"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Duration / Time Requirements</label>
                                            <input
                                                type="text"
                                                name="duration"
                                                value={formData.duration}
                                                onChange={handleInputChange}
                                                className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                                                placeholder="e.g., Every Saturday, 4-6 PM"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Date</label>
                                            <input
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Status</label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                                            >
                                                <option value="open">Open</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Required Skills (Press Enter to add)</label>
                                            <input
                                                type="text"
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyDown={handleAddSkill}
                                                className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                                                placeholder="e.g., Teaching, Cooking"
                                            />
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {formData.required_skills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500 bg-opacity-10 text-green-600 border border-green-500 border-opacity-20"
                                                    >
                                                        {skill}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSkill(skill)}
                                                            className="ml-2 hover:text-red-500"
                                                        >
                                                            &times;
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm font-medium">Address</label>
                                                <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setLocationMode('manual')}
                                                        className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${locationMode === 'manual' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                                                    >
                                                        Manual
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setLocationMode('map')}
                                                        className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${locationMode === 'map' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                                                    >
                                                        From Map
                                                    </button>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                                                placeholder={locationMode === 'map' ? 'Select on map below or edit here' : 'Full street address'}
                                            />
                                            {locationMode === 'map' && (
                                                <div className="mt-4">
                                                    <p className="text-xs opacity-60 mb-2">Click on the map to pin the location. The address will update automatically.</p>
                                                    <div className="h-[250px] rounded-xl overflow-hidden border border-opacity-10 border-gray-500">
                                                        <MapPicker
                                                            onLocationSelect={handleLocationSelect}
                                                            initialLat={formData.location.coordinates[1]}
                                                            initialLng={formData.location.coordinates[0]}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows="4"
                                        className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                                        placeholder="Detailed description of the role and expectations..."
                                    ></textarea>
                                </div>
                            </div>


                            <div className="flex gap-4 justify-end">
                                <button
                                    type="button"
                                    onClick={() => navigate('/opportunities')}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-green-500/20 active:scale-95'}`}
                                >
                                    {submitting ? 'Processing...' : isEditMode ? 'Update Opportunity' : 'Post Opportunity'}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OpportunityForm;
