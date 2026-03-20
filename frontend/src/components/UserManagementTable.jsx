import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";


const UserManagementTable = ({ setStats,searchTerm  }) => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const dummyUsers = [
            { _id: "1", name: "Rahul", email: "rahul@gmail.com", isSuspended: false },
            { _id: "2", name: "Amit", email: "amit@gmail.com", isSuspended: true },
            { _id: "3", name: "Priya", email: "priya@gmail.com", isSuspended: false },
            { _id: "4", name: "kishan", email: "kishan@gmail.com", isSuspended: false },
        ];

        setUsers(dummyUsers);

    }, []);

    useEffect(() => {
        const total = users.length;
        const suspended = users.filter(u => u.isSuspended).length;
        const active = total - suspended;

        setStats({ total, active, suspended });

    }, [users]); // ✅ runs every time users change

    const toggleStatus = (id) => {
        const updated = users.map((u) =>
            u._id === id ? { ...u, isSuspended: !u.isSuspended } : u
        );

        setUsers(updated); // 
    };

    // 🔍 Search filter
    // const filteredUsers = users.filter(
    //     (u) =>
    //         u.name.toLowerCase().includes(search.toLowerCase()) ||
    //         u.email.toLowerCase().includes(search.toLowerCase())
    // );

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`p-4 rounded-xl shadow
    ${isDarkMode ? "bg-slate-800" : "bg-white"}
`}>

            {/* Table Header */}
            <div
                className={`grid grid-cols-4 font-semibold
    ${isDarkMode ? "text-gray-400" : "text-gray-600"}
`}>
                <span>Name</span>
                <span>Email</span>
                <span>Status</span>
                <span>Action</span>
            </div>

            {/* Rows */}
            {
                filteredUsers.map((user) => (
                    <div
                        key={user._id}
                        className={`grid grid-cols-4 items-center py-3 border-b transition
${isDarkMode
                                ? "border-gray-700 hover:bg-gray-800 text-gray-200"
                                : "border-gray-200 hover:bg-blue-100 text-gray-800"
                            }`}
                    >
                        <span>{user.name}</span>
                        <span>{user.email}</span>

                        <span
                            className={
                                user.isSuspended ? "text-red-400" : "text-green-400"
                            }
                        >
                            {user.isSuspended ? "Suspended" : "Active"}
                        </span>

                        <button
                            onClick={() => toggleStatus(user._id)}
                            className={`px-3 py-1 rounded text-sm font-medium ${user.isSuspended
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                                }`}
                        >
                            {user.isSuspended ? "Unsuspend" : "Suspend"}
                        </button>
                    </div>
                ))
            }
        </div >
    );
};

export default UserManagementTable;