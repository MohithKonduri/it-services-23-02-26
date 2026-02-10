"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, Users, ArrowLeft, Eye, EyeOff, Building2 } from "lucide-react";

export default function HODRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);

    useEffect(() => {
        async function fetchDepts() {
            try {
                const res = await fetch("/api/departments");
                if (res.ok) setDepartments(await res.json());
            } catch (err) {
                console.error("Failed to fetch departments", err);
            }
        }
        fetchDepts();
    }, []);

    const [isManualDept, setIsManualDept] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const departmentId = formData.get("departmentId") as string;
        const departmentName = formData.get("departmentName") as string;

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role: "HOD",
                    departmentId: isManualDept ? undefined : departmentId,
                    departmentName: isManualDept ? departmentName : undefined
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/login/hod"), 3000);
            } else {
                setError(data.message || "Registration failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 text-center border border-slate-100 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Users className="h-10 w-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Request Sent</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Your HOD registration request has been submitted. The Dean will review your account for acceptance. You will be redirected shortly.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            {/* Left Side Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:radial-gradient(white,transparent_70%)]" />
                <div className="relative z-10">
                    <button
                        onClick={() => router.push("/login")}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Portal
                    </button>
                </div>

                <div className="relative z-10">
                    <div className="h-16 w-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-green-900/40">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-white mb-4 uppercase tracking-tight italic">
                        Institutional <span className="text-green-500">Onboarding</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-md">
                        Begin your journey as a Department Head. Every registration requires official Dean acceptance.
                    </p>
                </div>

                <div className="relative z-10 flex gap-10">
                    <div>
                        <p className="text-2xl font-black text-white">01</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black mt-1">Register</p>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-white">02</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black mt-1">Review</p>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-white">03</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black mt-1">Manage</p>
                    </div>
                </div>
            </div>

            {/* Right Side Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-lg">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">HOD Registration</h2>
                        <p className="text-slate-500 font-medium mt-2 italic">Fill in your professional details for institutional review</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Professional Name</label>
                            <div className="relative group">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                                <input
                                    name="name"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-[20px] outline-none transition-all font-bold text-slate-700 shadow-sm"
                                    placeholder="e.g. Dr. Jane Smith"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Institutional Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-[20px] outline-none transition-all font-bold text-slate-700 shadow-sm"
                                    placeholder="hod.dept@institution.edu"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-end mr-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsManualDept(!isManualDept)}
                                        className="text-[9px] font-black uppercase tracking-tighter text-green-500 hover:text-green-600 underline"
                                    >
                                        {isManualDept ? "Select Existing" : "Enter Manually"}
                                    </button>
                                </div>
                                {isManualDept ? (
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                                        <input
                                            name="departmentName"
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-[20px] outline-none transition-all font-bold text-slate-700 shadow-sm"
                                            placeholder="Department Name"
                                        />
                                    </div>
                                ) : (
                                    <select
                                        name="departmentId"
                                        required
                                        className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-[20px] outline-none transition-all font-black text-xs uppercase tracking-widest text-slate-700 shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                                    </select>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-[20px] outline-none transition-all font-bold text-slate-700 shadow-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-green-600 text-white font-black rounded-[24px] shadow-2xl shadow-green-200 hover:bg-green-700 hover:shadow-green-300 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px]"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit For Acceptance"}
                            </button>
                        </div>

                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">
                            Already have an accepted account? <button type="button" onClick={() => router.push("/login/hod")} className="text-green-500 hover:underline">Sign In</button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
