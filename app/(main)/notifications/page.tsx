"use client";

import { useState, useEffect } from "react";
import {
    Shield,
    Clock,
    User,
    Loader2,
    Calendar,
    Activity as ActivityIcon,
    Search,
    Filter,
    FileText
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState<any>(null);
    const [filter, setFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await fetch("/api/activities");
            const data = await res.json();
            setActivities(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch activities", error);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action?.toUpperCase()) {
            case "CREATE": return "text-[#3a5a40] bg-[#dad7cd]/40 border-[#a3b18a]/30";
            case "UPDATE": return "text-blue-600 bg-blue-50 border-blue-200";
            case "DELETE": return "text-red-600 bg-red-50 border-red-200";
            case "APPROVE": return "text-[#344e41] bg-[#dad7cd]/10 border-[#a3b18a]/30";
            case "REJECT": return "text-rose-600 bg-rose-50 border-rose-200";
            case "LOGIN": return "text-purple-600 bg-purple-50 border-purple-200";
            default: return "text-slate-600 bg-slate-50 border-slate-200";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#344e41] mb-2 uppercase tracking-tighter italic">
                        System History
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Track all system activities and audit logs in real-time.
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {["ALL", "CREATE", "UPDATE"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border",
                                filter === f
                                    ? "bg-[#344e41] text-white border-[#344e41] shadow-lg shadow-[#344e41]/20"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-[#a3b18a]/60 hover:text-[#3a5a40]"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-[#588157]" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#588157] outline-none transition-all font-bold text-[#344e41]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-[#3a5a40]" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#344e41] italic">Loading System Records...</p>
                </div>
            ) : (
                <div className="grid gap-4 max-w-5xl">
                    {(() => {
                        const filtered = activities.filter(act => {
                            const matchesFilter = filter === "ALL" || act.action === filter;
                            const matchesSearch = !searchQuery ||
                                act.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                act.entity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                act.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
                            return matchesFilter && matchesSearch;
                        });

                        return filtered.length > 0 ? (
                            filtered.map((act, idx) => (
                                <div
                                    key={`${act.id}-${idx}`}
                                    onClick={() => setSelectedActivity(act)}
                                    className="group bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-[#a3b18a]/40 hover:shadow-2xl hover:shadow-[#344e41]/5 transition-all duration-500 cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-transparent group-hover:bg-[#3a5a40] transition-colors" />

                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        {/* Icon & Action */}
                                        <div className="flex items-center gap-4 min-w-[180px]">
                                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", getActionColor(act.action))}>
                                                <ActivityIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                    {act.action}
                                                </p>
                                                <p className="font-black text-[#344e41] uppercase tracking-tighter">
                                                    {act.entity === "TICKET" ? "REQUEST" : act.entity}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed line-clamp-2 md:line-clamp-1 group-hover:text-[#344e41] transition-colors">
                                                {act.details || "System event captured successfully."}
                                            </p>
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex items-center gap-6 md:justify-end min-w-[200px] border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-[10px] bg-[#dad7cd]/40 flex items-center justify-center text-[11px] font-black text-[#3a5a40] border border-[#a3b18a]/30">
                                                    {act.user?.name?.charAt(0) || "S"}
                                                </div>
                                                <span className="text-xs font-black text-[#344e41] tracking-tight truncate max-w-[100px] uppercase">
                                                    {act.user?.name || "System"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span className="text-xs font-medium whitespace-nowrap">
                                                    {formatDate(act.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                                <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                                    <Search className="h-6 w-6 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No logs found</h3>
                                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search query.</p>
                            </div>
                        );
                    })()}
                </div>
            )}

            <Modal
                isOpen={!!selectedActivity}
                onClose={() => setSelectedActivity(null)}
                title="Activity Details"
                className="max-w-lg"
            >
                {selectedActivity && (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="flex items-start gap-4">
                            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border shadow-sm", getActionColor(selectedActivity.action))}>
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[#344e41] uppercase tracking-tight">
                                    {selectedActivity.action} {selectedActivity.entity === "TICKET" ? "REQUEST" : selectedActivity.entity}
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Reference ID: <span className="font-mono text-[#3a5a40] bg-[#dad7cd]/30 px-2 py-0.5 rounded ml-1">{selectedActivity.id}</span>
                                </p>
                            </div>
                        </div>

                        {/* Details Box */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                {selectedActivity.details || "No details provided."}
                            </p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor</span>
                                </div>
                                <p className="text-sm font-black text-[#344e41]">{selectedActivity.user?.name || "System"}</p>
                                <p className="text-[10px] text-[#3a5a40] font-black mt-1 uppercase tracking-widest">{selectedActivity.user?.role || "SYSTEM_PROCESS"}</p>
                            </div>

                            <div className="p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Time</span>
                                </div>
                                <p className="text-sm font-bold text-slate-900">
                                    {new Date(selectedActivity.createdAt).toLocaleTimeString()}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {new Date(selectedActivity.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setSelectedActivity(null)}
                                className="px-8 py-3 bg-[#344e41] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#3a5a40] transition-all shadow-xl shadow-[#344e41]/10"
                            >
                                Close Records
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
