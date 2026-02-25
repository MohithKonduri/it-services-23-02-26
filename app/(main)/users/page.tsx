"use client";

import { useState, useEffect } from "react";
import {
    User,
    Mail,
    Shield,
    MoreVertical,
    Plus,
    Search,
    Loader2,
    CheckCircle2,
    XCircle,
    Building2,
    Briefcase,
    Trash2
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/ui/modal";

export default function UsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOptionsId, setShowOptionsId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch("/api/departments");
            const data = await res.json();
            setDepartments(data);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        setDeletingId(userId);
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchUsers();
                setShowOptionsId(null);
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete user");
            }
        } catch (error) {
            console.error("Failed to delete user", error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const body = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                fetchUsers();
            }
        } catch (error) {
            console.error("Failed to add user", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase())) &&
        (session?.user?.role === "HOD" ? user.role === "LAB_INCHARGE" : user.role === "HOD")
    );

    return (
        <div className="p-6 lg:p-10 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {session?.user?.role === "HOD" ? "Lab Incharges" : "Department Heads"}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {session?.user?.role === "HOD"
                            ? "Directory of departmental laboratory leadership"
                            : "Directory of institutional department leadership"}
                    </p>
                </div>
                {session?.user?.role === "DEAN" && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-black text-sm rounded-2xl hover:bg-green-700 shadow-xl shadow-green-200 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        REGISTER NEW USER
                    </button>
                )}
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-green-500" />
                        <p className="font-bold text-sm uppercase tracking-widest">Accessing Secure Records...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                                    <th className="px-8 py-5">User Information</th>
                                    <th className="px-6 py-5">Role & Security</th>
                                    <th className="px-6 py-5">Department</th>
                                    <th className="px-6 py-5">Status</th>
                                    {session?.user?.role === "DEAN" && <th className="px-8 py-5 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-green-50/20 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black group-hover:bg-green-600 group-hover:text-white transition-all">
                                                    <User className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 tracking-tight text-sm uppercase">{user.name}</p>
                                                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                                        <Mail className="h-3 w-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mt-2">
                                            <Shield className={`h-4 w-4 ${user.role === "ADMIN" ? "text-emerald-500" : "text-green-500"}`} />
                                            {user.role}
                                        </td>
                                        <td className="px-6 py-6 font-bold text-xs text-slate-600 uppercase">
                                            {user.department?.name || "Global / IT"}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                <span className="text-xs font-bold text-slate-500 uppercase">Active</span>
                                            </div>
                                        </td>
                                        {session?.user?.role === "DEAN" && (
                                            <td className="px-8 py-6 text-right relative">
                                                <button
                                                    onClick={() => setShowOptionsId(showOptionsId === user.id ? null : user.id)}
                                                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                                                >
                                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                                </button>
                                                {showOptionsId === user.id && (
                                                    <div className="absolute right-10 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-10 overflow-hidden">
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            disabled={deletingId === user.id}
                                                            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                                                        >
                                                            {deletingId === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                                            Delete Account
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Register New Account"
                className="max-w-md"
            >
                <form onSubmit={handleAddUser} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                        <input name="name" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                        <input name="email" type="email" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Password</label>
                        <input name="password" type="password" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Permission Role</label>
                        <select name="role" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500">
                            <option value="ADMIN">System Admin</option>
                            <option value="DEAN">Academic Dean</option>
                            <option value="HOD">Department Head</option>
                            <option value="LAB_INCHARGE">Lab Incharge</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</label>
                        <select name="departmentId" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500">
                            <option value="">No Department (Global)</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "CREATE ACCESS ACCOUNT"}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
