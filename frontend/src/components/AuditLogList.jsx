import React from 'react';
import { useTheme } from '../context/ThemeContext';

const formatWhen = (value) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString();
};

/**
 * @param {{ logs?: Array<{ id?: string, actor?: string, action?: string, target?: string, createdAt?: string|number|Date, meta?: Record<string, any> }> }} props
 */
const AuditLogList = ({ logs = [] }) => {
    const { isDarkMode } = useTheme();

    if (!logs?.length) {
        return (
            <div
                className={`rounded-xl border p-6 text-center ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'}`}
            >
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No audit logs yet</h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Activity history will appear here once actions are recorded.
                </p>
            </div>
        );
    }

    return (
        <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'}`}>
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Audit logs</h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recent system activity</p>
            </div>

            <ul className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                {logs.map((log, idx) => {
                    const title = log.action || 'Activity';
                    const actor = log.actor || 'System';
                    const target = log.target ? ` • ${log.target}` : '';

                    return (
                        <li key={log.id || `${title}-${idx}`} className="px-5 py-4 flex items-start gap-4">
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${
                                    isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-green-100 text-green-700'
                                }`}
                                aria-hidden="true"
                            >
                                {actor?.charAt(0)?.toUpperCase() || 'S'}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-3">
                                    <p className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {title}
                                    </p>
                                    <span className={`text-xs whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {formatWhen(log.createdAt)}
                                    </span>
                                </div>
                                <p className={`mt-1 text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">{actor}</span>
                                    {target}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default AuditLogList;

