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

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await fetch("/api/activities");
            const data = await res.json();
            setActivities(data);
        } catch (error) {
            console.error("Failed to fetch activities", error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action?.toUpperCase()) {
            case "CREATE": return "text-green-600 bg-green-50 border-green-200";
            case "UPDATE": return "text-green-600 bg-green-50 border-green-200";
            case "DELETE": return "text-red-600 bg-red-50 border-red-200";
            case "APPROVE": return "text-emerald-600 bg-emerald-50 border-emerald-200";
            case "REJECT": return "text-rose-600 bg-rose-50 border-rose-200";
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
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        System History
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Track all system activities and audit logs in real-time.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </div>
                        <span className="text-xs font-semibold text-slate-600">Live System Monitor</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar (Visual only for now) */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {["ALL", "CREATE", "UPDATE", "DELETE", "SYSTEM"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                            filter === f
                                ? "bg-slate-900 text-white shadow-md"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mb-3 text-green-500" />
                    <p className="text-xs font-medium uppercase tracking-wider">Loading history...</p>
                </div>
            ) : (
                <div className="grid gap-4 max-w-5xl">
                    {activities.length > 0 ? (
                        activities.map((act, idx) => (
                            <div
                                key={`${act.id}-${idx}`}
                                onClick={() => setSelectedActivity(act)}
                                className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-green-500 transition-colors" />

                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    {/* Icon & Action */}
                                    <div className="flex items-center gap-4 min-w-[180px]">
                                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", getActionColor(act.action))}>
                                            <ActivityIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                {act.action}
                                            </p>
                                            <p className="font-bold text-slate-900">
                                                {act.entity === "TICKET" ? "REQUEST" : act.entity}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 md:line-clamp-1 group-hover:text-slate-900 transition-colors">
                                            {act.details || "System event captured successfully."}
                                        </p>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex items-center gap-6 md:justify-end min-w-[200px] border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                {act.user?.name?.charAt(0) || "S"}
                                            </div>
                                            <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">
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
                            <p className="text-slate-500 text-sm mt-1">Activity history is currently empty.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
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
                                <h3 className="text-lg font-bold text-slate-900">
                                    {selectedActivity.action} {selectedActivity.entity === "TICKET" ? "REQUEST" : selectedActivity.entity}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    ID: <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">{selectedActivity.id}</span>
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
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Actor</span>
                                </div>
                                <p className="text-sm font-bold text-slate-900">{selectedActivity.user?.name || "System"}</p>
                                <p className="text-xs text-green-600 font-medium mt-0.5">{selectedActivity.user?.role || "SYSTEM_PROCESS"}</p>
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
                                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
