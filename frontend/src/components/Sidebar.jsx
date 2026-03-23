import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    FaThLarge,
    FaCalendarAlt,
    FaLightbulb,
    FaEnvelope,
    FaChartLine,
    FaUser,
    FaCog,
    FaQuestionCircle,
    FaShieldAlt,
    FaSun,
    FaTruck,
    FaUsers
} from 'react-icons/fa';

const Sidebar = () => {
    const { user } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    const menuItems = [
        { name: 'Dashboard', icon: <FaThLarge />, path: '/dashboard' },
        // Volunteers can schedule pickups
        ...(user?.role === 'volunteer' ? [
            { name: 'Schedule Pickup', icon: <FaCalendarAlt />, path: '/schedule-pickup' }
        ] : []),
        // NGOs see pickups assigned to them
        ...(user?.role === 'ngo' ? [] : []),
        // Hide Opportunities from Admin
        ...(user?.role !== 'admin' ? [{ name: 'Opportunities', icon: <FaLightbulb />, path: '/opportunities' }] : []),
        { name: 'Messages', icon: <FaEnvelope />, path: '/chat' },
        { name: 'My Impact', icon: <FaChartLine />, path: '/impact' },
    ];

    const settingItems = [
        { name: 'My Profile', icon: <FaUser />, path: '/profile' },
        { name: 'Settings', icon: <FaCog />, path: '/settings' },
        { name: 'Help & Support', icon: <FaQuestionCircle />, path: '/help' },
    ];

    return (
        <div className={`h-screen w-64 flex flex-col justify-between border-r ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>

            {/* Header / Logo */}
            <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                    {/* Placeholder Logo Icon */}
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">W</div>
                    <span className="text-xl font-bold tracking-wide">WasteZero</span>
                </div>

                {/* User Profile Summary */}
                <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-opacity-10 bg-gray-500">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-600">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                </div>

                {/* Main Menu */}
                <div>
                    <p className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">MAIN MENU</p>
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-green-50 text-green-600 font-medium dark:bg-gray-800 dark:text-green-400' : 'hover:bg-gray-100 text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800'}`
                                    }
                                >
                                    {item.icon}
                                    {item.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Settings Menu */}
                <div className="mt-8">
                    <p className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">SETTINGS</p>
                    <ul className="space-y-1">
                        {settingItems.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-green-50 text-green-600 font-medium dark:bg-gray-800 dark:text-green-400' : 'hover:bg-gray-100 text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800'}`
                                    }
                                >
                                    {item.icon}
                                    {item.name}
                                </NavLink>
                            </li>
                        ))}
                        {/* Admin Panel Link - Only for Admins */}
                        {user?.role === 'admin' && (
                            <>
                                <li>
                                    <NavLink
                                        to="/admin-panel"
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-green-50 text-green-600 font-medium dark:bg-gray-800 dark:text-green-400' : 'hover:bg-gray-100 text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800'}`
                                        }
                                    >
                                        <FaShieldAlt />
                                        Admin Panel
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/admin/reports"
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-green-50 text-green-600 font-medium dark:bg-gray-800 dark:text-green-400' : 'hover:bg-gray-100 text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800'}`
                                        }
                                    >
                                        <FaChartLine />
                                        Reports
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between mb-0 px-4">
                    <span className="text-sm font-medium">Dark Mode</span>
                    <button
                        onClick={toggleTheme}
                        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${isDarkMode ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}
                    >
                        {isDarkMode ? <span className="w-3 h-3 bg-white rounded-full shadow-sm" /> : <span className="w-3 h-3 bg-white rounded-full shadow-sm" />}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Sidebar;
