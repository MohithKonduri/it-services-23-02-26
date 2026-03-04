"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Plus,
    History,
    Monitor,
    CheckCircle2,
    Clock,
    AlertCircle,
    LayoutGrid,
    ArrowRight,
    ClipboardList,
    ChevronRight,
    Loader2
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HODDashboard() {
    const { data: session } = useSession();
    const router = useRouter();

    const { data: stats, isLoading: loadingStats } = useSWR("/api/stats", fetcher, { revalidateOnFocus: false });
    const { data: requestsRaw, mutate: mutateRequests } = useSWR("/api/requests", fetcher);
    const { data: labsRaw, mutate: mutateLabs } = useSWR("/api/labs", fetcher, { revalidateOnFocus: false });
    const { data: usersRaw } = useSWR("/api/users?role=LAB_INCHARGE", fetcher, { revalidateOnFocus: false });

    const requests = Array.isArray(requestsRaw) ? requestsRaw : [];
    const labs = Array.isArray(labsRaw) ? labsRaw : [];
    const users = Array.isArray(usersRaw) ? usersRaw : [];
    const loading = loadingStats;

    const [showHistory, setShowHistory] = useState(false);

    // Modals
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    // Form States
    const [requestForm, setRequestForm] = useState({ title: "", description: "", type: "NEW_SYSTEM", priority: "NORMAL" });
    const [assignForm, setAssignForm] = useState({ labId: "", inchargeId: "" });
    const [submitting, setSubmitting] = useState(false);

    const handleRaiseRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        const deptId = session?.user?.departmentId;
        if (!deptId) {
            alert("Error: Your account is not associated with any department. Please contact the administrator.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...requestForm,
                    departmentId: deptId
                })
            });

            if (res.ok) {
                const data = await res.json();
                setIsRequestModalOpen(false);
                setRequestForm({ title: "", description: "", type: "NEW_SYSTEM", priority: "NORMAL" });
                await mutateRequests();
                alert(`Success! Request ${data.requestNumber} has been raised.`);
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error || "Failed to raise request"}`);
            }
        } catch (error) {
            console.error("Failed to raise request", error);
            alert("An error occurred while submitting the request. Please check your connection.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignIncharge = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/labs/${assignForm.labId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inchargeId: assignForm.inchargeId })
            });
            if (res.ok) {
                setIsAssignModalOpen(false);
                setAssignForm({ labId: "", inchargeId: "" });
                await mutateLabs();
            }
        } catch (error) {
            console.error("Failed to assign incharge", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#fafafa] p-6 lg:p-10 space-y-10 selection:bg-[#2d6a4f]/30 overflow-hidden text-slate-900 font-sans">
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

            <div className="relative z-10 space-y-10">
                {/* Simple Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-white/60 backdrop-blur-sm">
                    <div className="space-y-2">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-[#c5a059]/30 shadow-sm mb-2"
                        >
                            <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-ping" />
                            <span className="text-[11px] font-black text-[#8b6b23] uppercase tracking-[0.2em]">Departmental Matrix</span>
                        </motion.div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-[#1b4332] flex items-center gap-4 uppercase">
                            Management <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2d6a4f] to-[#c5a059] italic">Console</span>
                        </h1>
                        <p className="text-slate-500 font-medium tracking-wide">Monitoring departmental assets and technical requests</p>
                    </div>
                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="flex items-center gap-4 px-8 py-4 bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-[#1b4332]/20"
                    >
                        <div className="p-1 bg-white/20 rounded-lg">
                            <Plus className="h-4 w-4" />
                        </div>
                        New Resource Request
                    </button>
                </div>

                {/* Simplified Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            label: "Total Assets",
                            value: stats?.totalSystems || 0,
                            change: "Live Tracking",
                            icon: Monitor,
                            color: "from-[#1b4332] to-[#2d6a4f]",
                            glow: "shadow-[#1b4332]/20",
                            text: "text-[#b7e4c7]",
                            href: "/assets"
                        },
                        {
                            label: "Active Requests",
                            value: stats?.activeRequests || 0,
                            change: "Operational",
                            icon: History,
                            color: "from-[#2d6a4f] to-[#40916c]",
                            glow: "shadow-[#2d6a4f]/20",
                            text: "text-[#d8f3dc]",
                            href: "/dashboard/hod#request-pipeline"
                        },
                        {
                            label: "Working Condition",
                            value: `${Math.round((stats?.workingSystems / stats?.totalSystems) * 100) || 0}%`,
                            change: "Optimal",
                            icon: CheckCircle2,
                            color: "from-[#40916c] to-[#95d5b2]",
                            glow: "shadow-[#40916c]/20",
                            text: "text-white"
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => stat.href && router.push(stat.href)}
                            className={cn(
                                "bg-gradient-to-br p-7 rounded-[32px] border border-white/20 shadow-xl relative group overflow-hidden transition-all cursor-pointer",
                                stat.color,
                                stat.glow
                            )}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform" />
                            <div className="relative z-10 flex flex-col gap-6">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-1", stat.text)}>{stat.label}</p>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white backdrop-blur-md border border-white/10 uppercase tracking-widest">{stat.change}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {/* Recent Requests - Modern Table Style */}
                    <div id="request-pipeline" className="scroll-mt-10 space-y-8 p-10 bg-white/40 backdrop-blur-xl rounded-[48px] border border-white/60 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] rounded-[24px] shadow-lg shadow-[#1b4332]/20">
                                    <ClipboardList className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-[#1b4332] uppercase tracking-tighter italic">Request <span className="text-[#2d6a4f]">Pipeline</span></h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational Flow Monitoring</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="px-5 py-2.5 bg-[#f7e479]/30 hover:bg-[#f7e479]/50 text-[#1b4332] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-colors border border-[#f7e479]/20"
                            >
                                {showHistory ? "Active Only" : "History"}
                                <ArrowRight className={cn("h-4 w-4 transition-transform", showHistory && "rotate-90")} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {(Array.isArray(requests) ? requests : [])
                                .filter(r => showHistory ? true : ["PENDING", "APPROVED", "ASSIGNED", "IN_PROGRESS"].includes(r.status))
                                .slice(0, 10)
                                .map((req, index) => (
                                    <div
                                        key={req.id}
                                        className="p-6 bg-white rounded-3xl border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-slate-100 transition-all group cursor-pointer"
                                        onClick={() => {
                                            setSelectedRequest(req);
                                            setIsDetailsModalOpen(true);
                                        }}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-xs ${req.status === "APPROVED" || req.status === "COMPLETED" ? "bg-[#d8f3dc] text-[#1b4332] border border-[#b7e4c7]" :
                                                req.status === "DECLINED" ? "bg-red-50 text-red-600 border border-red-100" :
                                                    "bg-orange-50 text-orange-600 border border-orange-100"
                                                }`}>
                                                {req.status === "APPROVED" || req.status === "COMPLETED" ? <CheckCircle2 className="h-6 w-6" /> :
                                                    req.status === "DECLINED" ? <AlertCircle className="h-6 w-6" /> :
                                                        <Clock className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#1b4332] group-hover:text-[#2d6a4f] transition-colors uppercase text-sm tracking-tight">{req.title}</h4>
                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{req.requestNumber}</span>
                                                    <span>•</span>
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${req.priority === "HIGH" || req.priority === "CRITICAL" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
                                                }`}>
                                                {req.priority}
                                            </span>
                                            <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            {requests.filter(r => showHistory ? true : ["PENDING", "APPROVED", "ASSIGNED", "IN_PROGRESS"].includes(r.status)).length === 0 && (
                                <div className="p-12 text-center text-slate-400 italic font-medium">No {showHistory ? "" : "active"} requests in pipeline</div>
                            )}
                        </div>
                    </div>

                    {/* Labs Management Section */}
                    <div id="lab-overseer" className="scroll-mt-10 space-y-8 p-10 bg-gradient-to-br from-white to-[#f0fdf4] rounded-[48px] border border-white shadow-xl shadow-emerald-900/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-white rounded-[24px] shadow-sm border border-emerald-100 ring-4 ring-emerald-50/50">
                                    <LayoutGrid className="h-6 w-6 text-[#2d6a4f]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-[#1b4332] uppercase tracking-tighter italic">Lab <span className="text-[#2d6a4f]">Overseer</span></h2>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Infrastructure Provisioning</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setAssignForm({ labId: labs[0]?.id || "", inchargeId: "" });
                                    setIsAssignModalOpen(true);
                                }}
                                className="px-5 py-2.5 bg-[#1b4332] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#2d6a4f] transition-all shadow-lg shadow-[#1b4332]/20"
                            >
                                Assign New Incharge
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {(Array.isArray(labs) ? labs : [])
                                .map((lab, i) => (
                                    <div key={lab.id} className="p-7 bg-white/60 hover:bg-white rounded-[32px] border border-white hover:border-[#b7e4c7] hover:shadow-2xl hover:shadow-emerald-900/5 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 rounded-[24px] bg-[#1b4332] flex items-center justify-center font-black text-xl text-white shadow-lg shadow-[#1b4332]/20 group-hover:scale-105 transition-transform">
                                                {String(i + 1).padStart(2, '0')}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-[#1b4332] text-lg uppercase tracking-tight">{lab.name}</h4>
                                                <p className="text-slate-500 text-sm font-medium">Incharge: <span className="text-[#2d6a4f] font-bold">{lab.incharge?.name || "Not Assigned"}</span></p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#d8f3dc] text-[#1b4332] border border-[#b7e4c7]">
                                                {lab.code}
                                            </div>
                                            <button
                                                onClick={() => router.push(`/assets?labId=${lab.id}`)}
                                                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#2d6a4f] transition-colors"
                                            >
                                                Manage Lab Assets →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                <Modal
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    title="Raise Resource Request"
                >
                    <form onSubmit={handleRaiseRequest} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Request Title</label>
                            <input
                                required
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d6a4f]"
                                placeholder="e.g., 20 New Systems for Lab 102"
                                value={requestForm.title}
                                onChange={e => setRequestForm({ ...requestForm, title: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Request Type</label>
                                <select
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d6a4f]"
                                    value={requestForm.type}
                                    onChange={e => setRequestForm({ ...requestForm, type: e.target.value })}
                                >
                                    <option value="NEW_SYSTEM">New Systems</option>
                                    <option value="HARDWARE_REPAIR">Hardware Repair</option>
                                    <option value="SOFTWARE_INSTALLATION">Software</option>
                                    <option value="NETWORK_UPGRADE">Network</option>
                                    <option value="LAB_SETUP">Lab Setup</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</label>
                                <select
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d6a4f]"
                                    value={requestForm.priority}
                                    onChange={e => setRequestForm({ ...requestForm, priority: e.target.value })}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Description</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d6a4f]"
                                placeholder="Please provide specific details about the requirement..."
                                value={requestForm.description}
                                onChange={e => setRequestForm({ ...requestForm, description: e.target.value })}
                            />
                        </div>
                        <button
                            disabled={submitting}
                            className="w-full py-4 bg-[#1b4332] text-white font-black rounded-2xl hover:bg-[#2d6a4f] disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            SUBMIT OFFICIAL REQUEST
                        </button>
                    </form>
                </Modal>

                <Modal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    title="Assign Lab Incharge"
                >
                    <form onSubmit={handleAssignIncharge} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Lab</label>
                            <select
                                required
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d6a4f]"
                                value={assignForm.labId}
                                onChange={e => setAssignForm({ ...assignForm, labId: e.target.value })}
                            >
                                <option value="" disabled>Choose a lab...</option>
                                {labs.map(lab => (
                                    <option key={lab.id} value={lab.id}>{lab.name} ({lab.code})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Incharge</label>
                            <select
                                required
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d6a4f]"
                                value={assignForm.inchargeId}
                                onChange={e => setAssignForm({ ...assignForm, inchargeId: e.target.value })}
                            >
                                <option value="" disabled>Choose a faculty member...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>
                        <button
                            disabled={submitting}
                            className="w-full py-4 bg-[#1b4332] text-white font-black rounded-2xl hover:bg-[#2d6a4f] disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            CONFIRM ASSIGNMENT
                        </button>
                    </form>
                </Modal>

                <Modal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    title="Resource Request Details"
                >
                    {selectedRequest && (
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedRequest.status === "APPROVED" || selectedRequest.status === "COMPLETED" ? "bg-[#d8f3dc] text-[#1b4332]" :
                                        selectedRequest.status === "DECLINED" ? "bg-red-100 text-red-700" :
                                            "bg-orange-100 text-orange-700"
                                        }`}>
                                        {selectedRequest.status}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">{selectedRequest.requestNumber}</span>
                                </div>
                                <h3 className="text-xl font-black text-[#1b4332] mb-2 uppercase tracking-tight">{selectedRequest.title}</h3>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">{selectedRequest.description}</p>
                            </div>

                            {selectedRequest.remarks && (
                                <div className={cn(
                                    "p-6 rounded-3xl border",
                                    selectedRequest.status === "DECLINED" ? "bg-red-50 border-red-100" : "bg-[#f0fdf4] border-[#d8f3dc]"
                                )}>
                                    <h4 className={cn(
                                        "text-[10px] font-black uppercase tracking-widest mb-2",
                                        selectedRequest.status === "DECLINED" ? "text-red-600" : "text-[#1b4332]"
                                    )}>
                                        Dean's Remarks
                                    </h4>
                                    <p className="text-sm text-slate-700 font-bold italic">"{selectedRequest.remarks}"</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                                    <p className="text-xs font-bold text-slate-900 mt-1 uppercase">{selectedRequest.type.replace('_', ' ')}</p>
                                </div>
                                <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority</p>
                                    <p className="text-xs font-bold text-slate-900 mt-1 uppercase">{selectedRequest.priority}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="w-full py-4 bg-[#1b4332] text-white font-black rounded-2xl hover:bg-[#2d6a4f] uppercase tracking-widest text-[10px]"
                            >
                                CLOSE DETAILS
                            </button>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
}
