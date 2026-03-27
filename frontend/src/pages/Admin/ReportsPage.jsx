import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useTheme } from '../../context/ThemeContext';
import AuditLogList from '../../components/AuditLogList';
import opportunityService from '../../services/opportunityService';
import { exportRowsToCsv } from '../../services/csvExportService';
import api from '../../services/api';

const ReportsPage = () => {
    const { isDarkMode } = useTheme();
    const [opportunities, setOpportunities] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loadingOpps, setLoadingOpps] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoadingOpps(true);
                const data = await opportunityService.getAllOpportunities();
                if (mounted) setOpportunities(Array.isArray(data) ? data : []);
            } catch (e) {
                if (mounted) setOpportunities([]);
            } finally {
                if (mounted) setLoadingOpps(false);
            }
        };
        const fetchLogs = async () => {
             try {
                 setLoadingLogs(true);
                 const res = await api.get('/admin/logs');
                 if (mounted) setLogs(res.data);
             } catch (err) {
                 console.error("Failed to fetch logs:", err);
             } finally {
                 if (mounted) setLoadingLogs(false);
             }
        };
        load();
        fetchLogs();
        return () => {
            mounted = false;
        };
    }, []);

    const opportunityColumns = useMemo(
        () => [
            { key: '_id', label: 'ID' },
            { key: 'title', label: 'Title' },
            { key: 'status', label: 'Status' },
            { key: 'address', label: 'Address' },
            { key: 'createdAt', label: 'Created At' }
        ],
        []
    );

    const handleDownloadOpportunities = () => {
        exportRowsToCsv({
            filename: 'opportunities-report.csv',
            rows: opportunities,
            columns: opportunityColumns
        });
    };

    return (
        <div
            className={`flex h-screen w-full transition-colors duration-200 ${
                isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
            }`}
        >
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div>
                                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Reports
                                </h1>
                                <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Download CSV reports and review recent admin activity.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className={`rounded-xl border p-5 ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'}`}>
                                <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Opportunities</h2>
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Export the full opportunities list as CSV.
                                </p>
                                <button
                                    onClick={handleDownloadOpportunities}
                                    disabled={loadingOpps || opportunities.length === 0}
                                    className={`mt-4 w-full py-2.5 rounded-lg font-semibold transition-colors ${
                                        loadingOpps || opportunities.length === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    {loadingOpps ? 'Preparing...' : 'Download Report'}
                                </button>
                                {opportunities.length === 0 && !loadingOpps && (
                                    <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        No data available yet.
                                    </p>
                                )}
                            </div>

                            <div className={`rounded-xl border p-5 ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'}`}>
                                <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Users</h2>
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Download a user report (coming soon).
                                </p>
                                <button
                                    disabled
                                    className="mt-4 w-full py-2.5 rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
                                >
                                    Download Report
                                </button>
                            </div>

                            <div className={`rounded-xl border p-5 ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'}`}>
                                <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pickups</h2>
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Download a pickups report (coming soon).
                                </p>
                                <button
                                    disabled
                                    className="mt-4 w-full py-2.5 rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
                                >
                                    Download Report
                                </button>
                            </div>
                        </div>

                        <AuditLogList logs={logs} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReportsPage;

