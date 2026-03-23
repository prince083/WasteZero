import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import { exportRowsToCsv } from "../services/csvExportService";

const OpportunityManagementTable = ({ searchTerm }) => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isDarkMode } = useTheme();

    // Fetch all opportunities from admin endpoint
    useEffect(() => {
        const fetchOpportunities = async () => {
            try {
                // Using general opportunities endpoint but admin will use delete endpoint later
                const res = await api.get("/opportunities");
                // API returns { success: true, count: X, data: [...] }
                setOpportunities(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch opportunities:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOpportunities();
    }, []);

    // Remove opportunity
    const removeOpportunity = async (id) => {
        if (window.confirm("Are you sure you want to remove this opportunity from the platform? This action is permanent.")) {
            try {
                // Using the specialized admin moderation endpoint
                await api.delete(`/admin/opportunities/${id}`);
                setOpportunities((prev) => prev.filter((opp) => opp._id !== id));
            } catch (err) {
                console.error("Failed to remove opportunity:", err);
            }
        }
    };

    // Download Report
    const downloadOpps = () => {
        exportRowsToCsv({
            filename: 'opportunities-moderation.csv',
            rows: filteredOpps,
            columns: [
                { key: 'title', label: 'Title' },
                { key: 'status', label: 'Status' },
                { key: 'address', label: 'Address' }
            ]
        });
    };

    // Filter by search term
    const filteredOpps = opportunities.filter((opp) => {
        const term = (searchTerm || "").toLowerCase();
        return (
            opp.title?.toLowerCase().includes(term) ||
            opp.ngo_id?.name?.toLowerCase().includes(term)
        );
    });

    if (loading) {
        return <p className="text-gray-400 text-sm text-center py-4">Loading content...</p>;
    }

    if (filteredOpps.length === 0) {
        return <p className="text-gray-400 text-sm text-center py-4">No content found.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <div className="flex justify-end mb-4">
                <button 
                  onClick={downloadOpps}
                  disabled={filteredOpps.length === 0}
                  className="px-3 py-1 text-xs font-bold uppercase transition-colors rounded-lg bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white"
                >
                    Download Content Report (.csv)
                </button>
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className={`text-left border-b ${isDarkMode ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}>
                        <th className="pb-3 pr-4 font-semibold">Title</th>
                        <th className="pb-3 pr-4 font-semibold">Posted By (NGO)</th>
                        <th className="pb-3 pr-4 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOpps.map((opp) => (
                        <tr
                            key={opp._id}
                            className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}
                        >
                            <td className="py-3 pr-4 font-medium">{opp.title}</td>
                            <td className="py-3 pr-4 text-gray-400">{opp.ngo_id?.name || "Unknown NGO"}</td>
                            <td className="py-3 pr-4">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                                    opp.status === 'open' ? 'bg-green-100 text-green-700' : 
                                    opp.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' : 
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {opp.status}
                                </span>
                            </td>
                            <td className="py-3">
                                <button
                                    onClick={() => removeOpportunity(opp._id)}
                                    className="px-3 py-1 rounded text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OpportunityManagementTable;
