import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import MapPicker from '../../components/MapPicker';
import api from '../../services/api';

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
    const navigate = useNavigate();

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

    // Called by MapPicker when user drops a pin — receives (lat, lng) as two args
    const handleLocationSelect = async (lat, lng) => {
        setFormData(prev => ({
            ...prev,
            location: { type: 'Point', coordinates: [lng, lat] }  // GeoJSON: [lng, lat]
        }));

        // Reverse geocode to auto-fill address (same as OpportunityForm + Registration)
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

            // Reset form after success
            setTimeout(() => navigate('/dashboard'), 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to schedule pickup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `w-full p-3 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800'}`;
    const labelClass = 'block text-sm font-medium mb-2';

    return (
        <div className={`flex h-screen w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-8">

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-1">Schedule a Pickup</h1>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Fill in the details below and we'll assign the nearest available agent to collect your waste.
                        </p>
                    </div>

                    {/* Fixed Toast Notification — always visible regardless of scroll */}
                    {(success || error) && (
                        <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border max-w-sm animate-bounce-once transition-all
                            ${success
                                ? 'bg-green-600 border-green-500 text-white'
                                : isDarkMode
                                    ? 'bg-red-900 border-red-700 text-red-200'
                                    : 'bg-red-600 border-red-500 text-white'
                            }`}
                        >
                            <span className="text-xl mt-0.5">{success ? '✅' : '⚠️'}</span>
                            <div>
                                <p className="font-semibold text-sm">{success ? 'Success!' : 'Error'}</p>
                                <p className="text-xs opacity-90 mt-0.5">
                                    {success || error}
                                    {success && ' — Redirecting...'}
                                </p>
                            </div>
                            {error && (
                                <button
                                    onClick={() => setError(null)}
                                    className="ml-auto text-white opacity-70 hover:opacity-100 text-lg leading-none"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className={`rounded-2xl p-8 shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Left Column */}
                                <div className="space-y-6">

                                    {/* Waste Category */}
                                    <div>
                                        <label className={labelClass}>Waste Category <span className="text-red-500">*</span></label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className={inputClass}
                                            required
                                        >
                                            <option value="">Select category...</option>
                                            {WASTE_CATEGORIES.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Scheduled Time */}
                                    <div>
                                        <label className={labelClass}>Pickup Date & Time <span className="text-red-500">*</span></label>
                                        <input
                                            type="datetime-local"
                                            name="scheduled_time"
                                            value={formData.scheduled_time}
                                            onChange={handleChange}
                                            min={new Date().toISOString().slice(0, 16)}
                                            className={inputClass}
                                            required
                                        />
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className={labelClass}>Pickup Address <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Enter your pickup address"
                                            className={inputClass}
                                            required
                                        />
                                        <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Or drop a pin on the map →
                                        </p>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className={labelClass}>Additional Notes <span className="text-gray-400">(optional)</span></label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="e.g., Gate code, quantity of bags, special instructions..."
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                {/* Right Column — Map */}
                                <div>
                                    <label className={labelClass}>Pin Your Location</label>
                                    <div className="rounded-xl overflow-hidden border border-gray-300 h-72">
                                        <MapPicker onLocationSelect={handleLocationSelect} />
                                    </div>
                                    <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        📍 Click on the map to set your exact pickup location. This helps us assign the nearest agent.
                                    </p>

                                    {/* Location confirmed indicator */}
                                    {formData.location.coordinates[0] !== 0 && (
                                        <div className="mt-3 flex items-center gap-2 text-green-500 text-sm font-medium">
                                            <span>✅</span>
                                            <span>Location pinned ({formData.location.coordinates[1].toFixed(4)}, {formData.location.coordinates[0].toFixed(4)})</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="mt-8 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-8 py-3 rounded-xl font-semibold text-white transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-md hover:shadow-lg'}`}
                                >
                                    {loading ? 'Scheduling...' : '📅 Schedule Pickup'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                    className={`px-8 py-3 rounded-xl font-semibold transition-all border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>

                </main>
            </div>
        </div>
    );
};

export default SchedulePickup;
