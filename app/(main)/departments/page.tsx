"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    Building2,
    MapPin,
    Users,
    Monitor,
    ArrowRight,
    Plus,
    MoreVertical,
    Loader2,
    AlertCircle,
    Edit2,
    Trash2,
    X
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export default function DepartmentsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [departments, setDepartments] = useState<any[]>([]);
    const [hods, setHods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showOptionsId, setShowOptionsId] = useState<string | null>(null);

    useEffect(() => {
        if (session && session.user.role === "HOD") {
            router.push("/dashboard/hod");
            return;
        }
        fetchDepartments();
        fetchInitialData();
    }, [session, router]);

    const fetchInitialData = async () => {
        try {
            const usersRes = await fetch("/api/users?role=HOD");
            const data = await usersRes.json();
            setHods(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch HODs", error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch("/api/departments");
            const data = await res.json();
            setDepartments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        const formData = new FormData(e.currentTarget);
        const body = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/departments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (res.ok) {
                setIsAddModalOpen(false);
                fetchDepartments();
            } else {
                setError(data.error || "Failed to establish department");
            }
        } catch (err: any) {
            console.error("Failed to add department", err);
            setError("A network error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedDept) return;
        setIsSubmitting(true);
        setError(null);
        const formData = new FormData(e.currentTarget);
        const body = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(`/api/departments/${selectedDept.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (res.ok) {
                setIsEditModalOpen(false);
                setSelectedDept(null);
                fetchDepartments();
            } else {
                setError(data.error || "Failed to update department");
            }
        } catch (err: any) {
            console.error("Failed to update department", err);
            setError("A network error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDepartment = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the ${name} department? This action cannot be undone.`)) return;

        try {
            const res = await fetch(`/api/departments/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (res.ok) {
                fetchDepartments();
            } else {
                alert(data.error || "Failed to delete department");
            }
        } catch (err: any) {
            console.error("Failed to delete department", err);
            alert("A network error occurred. Please try again.");
        }
    };

    return (
        <div className="p-6 lg:p-10 space-y-10 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight tracking-tighter uppercase italic">Institutional <span className="text-green-600">Departments</span></h1>
                    <p className="text-slate-500 font-medium font-bold uppercase text-[10px] tracking-widest mt-1">Organizational hierarchy and resource distribution</p>
                </div>
                {(session?.user?.role === "DEAN" || session?.user?.role === "ADMIN") && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black text-xs rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest"
                    >
                        <Plus className="h-5 w-5" />
                        CREATE NEW DEPARTMENT
                    </button>
                )}
            </div>

            {loading ? (
                <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="h-12 w-12 animate-spin mb-4 text-slate-300" />
                    <p className="font-black text-xs uppercase tracking-[0.3em] italic">Synchronizing Data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {departments.map((dept) => (
                        <div key={dept.id} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-green-100 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-green-50 rounded-full opacity-50 scale-0 group-hover:scale-100 transition-transform duration-700" />

                            <div className="relative z-10 space-y-8">
                                <div className="flex items-start justify-between">
                                    <div className="h-20 w-20 rounded-[32px] bg-slate-100 flex items-center justify-center font-black text-2xl text-slate-900 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                                        {dept.code}
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowOptionsId(showOptionsId === dept.id ? null : dept.id)}
                                            className="p-2 text-slate-300 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl"
                                        >
                                            <MoreVertical className="h-6 w-6" />
                                        </button>

                                        {showOptionsId === dept.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95">
                                                <button
                                                    onClick={() => {
                                                        setSelectedDept(dept);
                                                        setIsEditModalOpen(true);
                                                        setShowOptionsId(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 transition-colors text-xs font-black uppercase tracking-widest"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                    Modify
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDeleteDepartment(dept.id, dept.name);
                                                        setShowOptionsId(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors text-xs font-black uppercase tracking-widest"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Decommission
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-green-600 transition-colors uppercase tracking-tight">{dept.name}</h3>
                                    <div className="flex items-center gap-3 mt-4">
                                        <div className="h-8 w-8 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">HOD Assigned</p>
                                            <p className="text-xs font-bold text-slate-700">{dept.hod?.name || "Unassigned"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="p-4 bg-slate-50 rounded-3xl group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Labs</p>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-emerald-500" />
                                            <span className="font-black text-slate-900">{dept.labs?.length || 0}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-3xl group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Assets</p>
                                        <div className="flex items-center gap-2">
                                            <Monitor className="h-4 w-4 text-green-500" />
                                            <span className="font-black text-slate-900">{dept._count?.assets || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push(`/labs?deptId=${dept.id}`)}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all group-hover:bg-green-600 shadow-xl shadow-slate-200"
                                >
                                    Manage Resources
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Dept Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Establish New Department"
                className="max-w-md"
            >
                <form onSubmit={handleAddDepartment} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department Name</label>
                        <input name="name" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900" placeholder="e.g. Computer Science" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dept Code</label>
                        <input name="code" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900" placeholder="e.g. CSE" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                        <textarea name="description" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900" placeholder="Briefly describe the department mission..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Head of Department (HOD)</label>
                        <select name="hodId" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900">
                            <option value="">Select HOD</option>
                            {hods.map(h => <option key={h.id} value={h.id}>{h.name} ({h.email})</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "PROVISION DEPARTMENT"}
                    </button>
                </form>
            </Modal>

            {/* Edit Dept Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedDept(null);
                    setError(null);
                }}
                title="Modify Department Core"
                className="max-w-md"
            >
                <form onSubmit={handleUpdateDepartment} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department Name</label>
                        <input name="name" defaultValue={selectedDept?.name} required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-600" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dept Code</label>
                        <input name="code" defaultValue={selectedDept?.code} required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-600" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                        <textarea name="description" defaultValue={selectedDept?.description} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-600" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Head of Department (HOD)</label>
                        <select name="hodId" defaultValue={selectedDept?.hodId || ""} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-600">
                            <option value="">Select HOD</option>
                            {hods.map(h => <option key={h.id} value={h.id}>{h.name} ({h.email})</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "UPDATE CONFIGURATION"}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
