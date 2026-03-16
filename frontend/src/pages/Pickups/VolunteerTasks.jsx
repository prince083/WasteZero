import React, { useState, useEffect } from 'react';
import pickupService from '../../services/pickupService';
import { useTheme } from '../../context/ThemeContext';
import { FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaTrashAlt } from 'react-icons/fa';

const VolunteerTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await pickupService.getAssignedPickups();
                setTasks(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const handleUpdateStatus = async (taskId, status) => {
        try {
            await pickupService.updateStatus(taskId, status);
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t));
        } catch (err) {
            alert(err);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
    );

    return (
        <div className="w-full">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {tasks.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheckCircle className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold dark:text-gray-200">No active tasks</h3>
                    <p className="text-gray-500 dark:text-gray-400">You haven't been assigned any pickups yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tasks.map((task) => (
                        <div
                            key={task._id}
                            className={`p-6 rounded-3xl border transition-all ${task.status === 'completed'
                                ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50 grayscale shadow-none'
                                : 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-md border-gray-100 dark:border-gray-700'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    task.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {task.status}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400">
                                    {new Date(task.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-black mb-3 dark:text-white capitalize">{task.category} Waste</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-3 text-gray-500 dark:text-gray-400">
                                    <FaMapMarkerAlt className="mt-1 text-red-500 shrink-0 text-sm" />
                                    <span className="text-xs font-medium leading-relaxed">{task.address}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                    <FaCalendarAlt className="text-blue-500 shrink-0 text-sm" />
                                    <span className="text-xs font-bold">
                                        {new Date(task.scheduled_time).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-50 dark:border-gray-700 pt-4 mt-4 flex items-center justify-between">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    By: {task.user_id?.name || 'Anonymous'}
                                </p>

                                {task.status !== 'completed' && task.status !== 'cancelled' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateStatus(task._id, 'completed')}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-lg shadow-green-900/10"
                                        >
                                            Complete
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(task._id, 'cancelled')}
                                            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                                        >
                                            <FaTrashAlt className="text-xs" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VolunteerTasks;
