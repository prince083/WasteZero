import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import MapPicker from '../../components/MapPicker';
import api from '../../services/api';
import VolunteerTasks from './VolunteerTasks';
import { useAuth } from '../../context/AuthContext';

const WASTE_CATEGORIES = [
    { value: 'plastic', label: '♻️ Plastic' },
    { value: 'organic', label: '🌿 Organic' },
    { value: 'e-waste', label: '💻 E-Waste' },
    { value: 'paper', label: '📄 Paper' },
    { value: 'metal', label: '🔩 Metal' },
    { value: 'glass', label: '🪟 Glass' },
    { value: 'other', label: '🗑️ Other' },
];

const SchedulePickup = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' or 'tasks'

    const [formData, setFormData] = useState({
        category: '',
        scheduled_time: '',
        address: '',
        notes: '',
        location: { type: 'Point', coordinates: [0, 0] }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLocationSelect = async (lat, lng) => {
        setFormData(prev => ({
            ...prev,
            location: { type: 'Point', coordinates: [lng, lat] }
        }));

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data && data.display_name) {
                setFormData(prev => ({ ...prev, address: data.display_name }));
            }
        } catch (error) {
            console.error('Failed to fetch address from map pin:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!formData.category) return setError('Please select a waste category.');
        if (!formData.scheduled_time) return setError('Please select a pickup date and time.');
        if (!formData.address.trim()) return setError('Please provide a pickup address.');

        try {
            setLoading(true);
            const response = await api.post('/pickups', formData);
            setSuccess(response.data.message || 'Pickup scheduled successfully!');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to schedule pickup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `w-full p-4 rounded-2xl border focus:ring-2 focus:ring-green-500 outline-none transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800'}`;
    const labelClass = 'block text-[10px] font-black uppercase tracking-widest mb-2 ml-1 text-gray-400';

    return (
        <div className={`flex h-screen w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-8 lg:p-12">

                    {/* Header with Tabs */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                        <div>
                            <h1 className="text-4xl font-black mb-2 tracking-tight">
                                {activeTab === 'schedule' ? 'Schedule a Pickup' : 'My Dispatch Tasks'}
                            </h1>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {activeTab === 'schedule'
                                    ? "Fill in the details below and we'll assign the nearest available agent."
                                    : "View and manage pickups dispatched to you by your NGO."}
                            </p>
                        </div>

                        {/* TABS - Only visible to volunteers (who can have tasks) */}
                        {user?.role === 'volunteer' && (
                            <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => setActiveTab('schedule')}
                                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${activeTab === 'schedule' ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                >
                                    New Pickup
                                </button>
                                <button
                                    onClick={() => setActiveTab('tasks')}
                                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${activeTab === 'tasks' ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                >
                                    My Tasks
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Fixed Toast Notification */}
                    {(success || error) && (
                        <div className={`fixed bottom-10 right-10 z-50 flex items-start gap-4 px-6 py-5 rounded-3xl shadow-2xl border max-w-sm animate-in slide-in-from-bottom-5 duration-300
                            ${success
                                ? 'bg-green-600 border-green-500 text-white'
                                : isDarkMode
                                    ? 'bg-red-900 border-red-700 text-red-200'
                                    : 'bg-red-600 border-red-500 text-white'
                            }`}
                        >
                            <span className="text-2xl">{success ? '✅' : '⚠️'}</span>
                            <div>
                                <p className="font-black text-sm uppercase tracking-wider">{success ? 'Success!' : 'Oops!'}</p>
                                <p className="text-xs font-medium opacity-90 mt-1 leading-relaxed">
                                    {success || error}
                                    {success && ' — Returning to Dashboard...'}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' ? (
                        <form onSubmit={handleSubmit} className="animate-in fade-in duration-500">
                            <div className={`rounded-3xl p-8 lg:p-10 shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                                    {/* Form Fields */}
                                    <div className="space-y-8">
                                        <div>
                                            <label className={labelClass}>Waste Category <span className="text-red-500">*</span></label>
                                            <select name="category" value={formData.category} onChange={handleChange} className={inputClass} required>
                                                <option value="">Select category...</option>
                                                {WASTE_CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Date & Time <span className="text-red-500">*</span></label>
                                            <input type="datetime-local" name="scheduled_time" value={formData.scheduled_time} onChange={handleChange} min={new Date().toISOString().slice(0, 16)} className={inputClass} required />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Pickup Address <span className="text-red-500">*</span></label>
                                            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="House no, Street, Landmark..." className={inputClass} required />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Instructions <span className="text-gray-500">(optional)</span></label>
                                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="e.g., Use back gate, call on arrival..." className={inputClass} />
                                        </div>
                                    </div>

                                    {/* Map Side */}
                                    <div>
                                        <label className={labelClass}>Confirm Precise Location</label>
                                        <div className="rounded-3xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700 h-[400px]">
                                            <MapPicker onLocationSelect={handleLocationSelect} />
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <p className="text-[11px] font-bold text-gray-400">Click map to pin address</p>
                                            {formData.location.coordinates[0] !== 0 && (
                                                <span className="text-[11px] font-bold text-green-500 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                    Location Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex flex-col md:flex-row gap-4 border-t border-gray-50 dark:border-gray-700 pt-10">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`flex-1 md:flex-none px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-white transition-all shadow-xl shadow-green-900/10 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
                                    >
                                        {loading ? 'Please wait...' : 'Schedule Pickup'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/dashboard')}
                                        className={`px-12 py-4 rounded-2xl font-black uppercase tracking-widest transition-all border ${isDarkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="animate-in slide-in-from-right-10 duration-500">
                            <VolunteerTasks />
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};

export default SchedulePickup;
