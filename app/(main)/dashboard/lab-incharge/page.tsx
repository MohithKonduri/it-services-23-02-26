"use client";

import { useState, useEffect } from "react";
import {
    Monitor,
    Ticket,
    CheckCircle2,
    Plus,
    Clock,
    Wrench,
    Activity,
    ArrowRight,
    Server,
    Zap,
    Info
} from "lucide-react";
import useSWR, { mutate } from "swr";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTicketModal } from "@/components/tickets/CreateTicketModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LabInchargeDashboard() {
    const { data: stats, isLoading: loadingStats } = useSWR("/api/stats", fetcher, { revalidateOnFocus: false });
    const { data: ticketsRaw } = useSWR("/api/tickets", fetcher);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const tickets = Array.isArray(ticketsRaw) ? ticketsRaw : [];
    const loading = loadingStats;

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="relative p-6 lg:p-8 space-y-8 bg-[#fafafa] min-h-screen overflow-hidden text-slate-900 font-sans selection:bg-[#2d6a4f]/30">
            {/* Ambient Nature Mesh Backgrounds */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#ecf39e]/30 rounded-full blur-[120px]"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#91a84b]/20 rounded-full blur-[100px]"
                />
            </div>

            {/* Premium Lab Oversight Header */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[32px] border border-white/50 shadow-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-full shadow-inner">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a059]/40 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c5a059]"></span>
                            </span>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">System <span className="text-[#c5a059]">Oversight</span> • Infrastructure Sync</p>
                        </div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">CSE-LAB-301</span>
                    </div>
                    <h1 className="text-3xl font-black text-[#1b4332] tracking-tight uppercase italic">
                        Lab Monitoring <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2d6a4f] to-[#b7e4c7]">Systems</span>
                    </h1>
                    <p className="text-slate-500 text-xs font-semibold max-w-md tracking-wide">Real-time oversight of computer infrastructure and deployments.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end mr-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Server Time</p>
                        <p className="text-sm font-black text-slate-700">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] text-white font-black text-[12px] uppercase tracking-widest rounded-[20px] hover:scale-105 transition-all shadow-xl shadow-[#1b4332]/20"
                    >
                        <Plus className="h-4 w-4" />
                        Report Issue
                    </button>
                    <button className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">
                        <Activity className="h-5 w-5 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Vibrant KPI Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Lab Inventory", value: stats?.totalSystems || 0, change: "Live Sync", icon: Monitor, gradient: "from-[#1b4332] to-[#2d6a4f]", shadow: "shadow-[#1b4332]/20", text: "text-[#b7e4c7]" },
                    { label: "Optimal Status", value: stats?.workingSystems || 0, change: "Active", icon: CheckCircle2, gradient: "from-[#2d6a4f] to-[#40916c]", shadow: "shadow-[#2d6a4f]/20", text: "text-[#d8f3dc]" },
                    { label: "Active Requests", value: stats?.pendingTickets || 0, change: "Processing", icon: Wrench, gradient: "from-[#40916c] to-[#95d5b2]", shadow: "shadow-[#40916c]/20", text: "text-white" },
                    { label: "System Health", value: "98%", change: "Healthy", icon: Zap, gradient: "from-[#1b4332] to-[#40916c]", shadow: "shadow-[#1b4332]/20", text: "text-[#b7e4c7]" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="group relative bg-gradient-to-br bg-white p-7 rounded-[32px] border border-white/60 shadow-xl shadow-slate-200/20 overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform`} />
                        <div className="relative z-10 flex items-start justify-between mb-6">
                            <div className={cn("p-4 rounded-[22px] bg-gradient-to-br text-white shadow-lg", stat.gradient, stat.shadow)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-slate-50/50 text-slate-500 border border-slate-100 group-hover:bg-white transition-colors uppercase tracking-widest">
                                {stat.change}
                            </span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                            <h3 className="text-3xl font-black text-[#1b4332] mt-2 tracking-tight">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Refined Activity List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h2 className="text-lg font-black text-[#1b4332] uppercase tracking-tight italic">Active <span className="text-[#2d6a4f]">Maintenance</span></h2>
                                <p className="text-slate-400 text-[11px] font-medium uppercase tracking-widest mt-1">Infrastructure technical queries</p>
                            </div>
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <Ticket className="h-5 w-5 text-slate-400" />
                            </div>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {tickets.length > 0 ? tickets.slice(0, 5).map((t) => (
                                <div key={t.id} className="p-5 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 group-hover:border-[#b7e4c7] transition-all">
                                                {t.status === "DEPLOYED" ?
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
                                                    <Activity className="h-5 w-5 text-[#2d6a4f] animate-pulse" />
                                                }
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${t.issueType === "HARDWARE"
                                                        ? "bg-red-50 text-red-600 border-red-100"
                                                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                        }`}>
                                                        {t.issueType}
                                                    </span>
                                                    <span className="text-slate-400 text-[9px] font-bold tracking-widest">{t.ticketNumber}</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-[#1b4332] group-hover:text-[#2d6a4f] transition-colors uppercase truncate max-w-[200px] sm:max-w-md">{t.title}</h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`hidden sm:inline-block px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${t.status === "DEPLOYED" ? "bg-emerald-50 text-emerald-600" : "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                                }`}>
                                                {t.status}
                                            </span>
                                            <button className="p-2 bg-white border border-slate-100 rounded-xl hover:border-[#b7e4c7] hover:bg-[#d8f3dc]/30 transition-all">
                                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#2d6a4f]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-16 text-center text-slate-400 italic font-medium text-xs">No active technical queries for this lab</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Info className="h-5 w-5 text-[#2d6a4f]" />
                            <h4 className="font-black text-[#1b4332] uppercase text-xs tracking-[0.2em]">Lab Ethics</h4>
                        </div>
                        <div className="space-y-4">
                            {[
                                "Report hardware issues instantly.",
                                "Authorized software only.",
                                "No external USB devices.",
                                "Maintain logbook daily."
                            ].map((guide, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-[#f0fdf4]/50 rounded-2xl border border-emerald-50">
                                    <span className="font-black text-[#2d6a4f] text-sm">0{i + 1}</span>
                                    <p className="text-sm font-bold text-slate-600 uppercase tracking-tight">{guide}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Compact Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] p-8 rounded-[32px] shadow-xl relative overflow-hidden group border border-white/10">
                        <div className="absolute top-0 right-0 p-10 -mr-12 -mt-12 bg-white/5 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-[2000ms]" />
                        <div className="relative z-10">
                            <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                                <Server className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-black text-white leading-tight uppercase tracking-tight italic">System<br />Infrastructure</h3>
                            <p className="text-white/60 text-[11px] mt-3 leading-relaxed font-bold uppercase tracking-wide">
                                Ensure all lab terminals are synchronized. OS security patches were deployed successfully.
                            </p>
                            <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-7 w-7 bg-white/10 border-2 border-white/20 rounded-xl flex items-center justify-center text-[8px] font-black text-white uppercase backdrop-blur-sm">
                                            SY
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest">Admin Monitored</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    mutate("/api/tickets");
                    mutate("/api/stats");
                }}
            />
        </div>
    );
}
