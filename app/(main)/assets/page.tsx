"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Filter,
    Monitor,
    MoreVertical,
    Loader2,
    Cpu,
    HardDrive,
    Activity,
    ChevronLeft,
    ChevronRight,
    Download,
    Trash2,
    Upload
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Suspense } from "react";

export default function AssetsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-10 w-10 animate-spin" /></div>}>
            <AssetsContent />
        </Suspense>
    );
}

import { useSession } from "next-auth/react";

// ... existing imports

function AssetsContent() {
    const { data: session } = useSession();
    const canDelete = session?.user?.role === "DEAN";

    const searchParams = useSearchParams();
    const labIdParam = searchParams.get("labId");
    const statusParam = searchParams.get("status");

    const [assets, setAssets] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [labs, setLabs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [filterLab, setFilterLab] = useState(labIdParam || "ALL");
    const [filterStatus, setFilterStatus] = useState(statusParam || "ALL");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFilterLab(labIdParam || "ALL");
    }, [labIdParam]);

    useEffect(() => {
        setFilterStatus(statusParam || "ALL");
    }, [statusParam]);

    useEffect(() => {
        fetchAssets();
        fetchInitialData();
    }, [filterType, filterLab, filterStatus]);

    const fetchInitialData = async () => {
        try {
            const [deptsRes, labsRes] = await Promise.all([
                fetch("/api/departments"),
                fetch("/api/labs")
            ]);
            setDepartments(await deptsRes.json());
            setLabs(await labsRes.json());
        } catch (error) {
            console.error("Failed to fetch metadata", error);
        }
    };

    const fetchAssets = async () => {
        setLoading(true);
        try {
            let url = "/api/assets?";
            if (filterType !== "ALL") url += `type=${filterType}&`;
            if (filterLab !== "ALL") url += `labId=${filterLab}&`;
            if (filterStatus !== "ALL") url += `status=${filterStatus}&`;

            const res = await fetch(url);
            const data = await res.json();
            setAssets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch assets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAsset = async (id: string) => {
        if (!confirm("Are you sure you want to delete this asset? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/assets/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchAssets();
            } else {
                alert("Failed to delete asset");
            }
        } catch (error) {
            console.error("Failed to delete asset", error);
        }
    };

    const handleAddAsset = async (e: React.FormEvent<HTMLFormElement>) => {
        // ... existing handleAddAsset implementation
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const body = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/assets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                fetchAssets();
            }
        } catch (error) {
            console.error("Failed to add asset", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExport = () => {
        if (!assets || assets.length === 0) {
            alert("No assets to export");
            return;
        }

        const headers = ["Name", "Asset Tag", "Type", "Brand", "Model", "Serial Number", "MAC Address", "Status", "Lab", "Department"];
        const csvContent = [
            headers.join(","),
            ...assets.map(asset => [
                `"${asset.name || ''}"`,
                `"${asset.assetNumber || ''}"`,
                `"${asset.type || ''}"`,
                `"${asset.brand || ''}"`,
                `"${asset.model || ''}"`,
                `"${asset.serialNumber || ''}"`,
                `"${asset.macAddress || ''}"`,
                `"${asset.status || ''}"`,
                `"${asset.lab?.name || ''}"`,
                `"${asset.department?.name || ''}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "assets_export.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const csv = event.target?.result as string;
            const lines = csv.split("\n");
            // Skip header row
            const rows = lines.slice(1).filter(line => line.trim() !== "");

            let successCount = 0;
            let failCount = 0;
            const errorMessages = new Set<string>();

            // Simple CSV parser assuming standard CSV format without advanced quoting issues for now
            // Expected columns: Name, Asset Tag, Type, Brand, Model, Serial Number, MAC Address, Status (ACTIVE/etc), Department ID (optional), Lab ID (optional)

            for (const row of rows) {
                const cols = row.split(",").map(c => c.trim().replace(/^"|"$/g, ''));
                if (cols.length < 3) continue; // Basic validation

                // Validate Department ID
                let deptId = departments[0]?.id;
                // If CSV provides department name or ID, try to find it (simplified matching)
                if (cols[9]) {
                    const foundDept = departments.find(d => d.name === cols[9] || d.id === cols[9] || d.code === cols[9]);
                    if (foundDept) deptId = foundDept.id;
                }

                if (!deptId) {
                    failCount++;
                    errorMessages.add("Missing valid Department ID (system has no departments loaded or no match found in column 10)");
                    console.warn("Row skipped due to missing Dept ID", row);
                    continue;
                }

                const body = {
                    name: cols[0] || "Unknown Asset",
                    assetNumber: cols[1] || `TAG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    type: cols[2]?.toUpperCase() || "DESKTOP",
                    brand: cols[3] || "Generic",
                    model: cols[4] || "Generic",
                    serialNumber: cols[5] || "N/A",
                    macAddress: cols[6],
                    status: ["ACTIVE", "UNDER_MAINTENANCE", "DAMAGED", "RETIRED"].includes(cols[7]?.toUpperCase()) ? cols[7].toUpperCase() : "ACTIVE",
                    departmentId: deptId,
                    category: "Computing"
                };

                try {
                    const res = await fetch("/api/assets", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                    });

                    if (res.ok) {
                        successCount++;
                    } else {
                        failCount++;
                        const errData = await res.json().catch(() => ({ error: res.statusText }));
                        errorMessages.add(errData.error || "Unknown server error");
                        console.error("Import failed for row:", row, errData);
                    }
                } catch (err: any) {
                    failCount++;
                    errorMessages.add(err.message || "Network/Client error");
                    console.error("Import failed for row:", row, err);
                }
            }

            const errorSummary = errorMessages.size > 0 ? `\nErrors:\n${Array.from(errorMessages).join("\n")}` : "";
            alert(`Import complete.\nSuccess: ${successCount}\nFailed: ${failCount}${errorSummary}`);
            fetchAssets();
            e.target.value = ""; // Reset input
        };
        reader.readAsText(file);
    };

    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.assetNumber.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10 space-y-8 bg-slate-50 min-h-screen">
            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Inventory</h1>
                    <p className="text-slate-500 font-medium">Complete record of institutional hardware and networking assets</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        id="import-assets"
                        className="hidden"
                        accept=".csv"
                        onChange={handleImportFile}
                    />
                    <button
                        onClick={() => document.getElementById('import-assets')?.click()}
                        className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Upload className="h-4 w-4" />
                        Import Assets
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        Export Assets
                    </button>
                </div>
            </div>

            {/* Control Bar */}
            <div className="bg-white/60 backdrop-blur-xl p-4 rounded-[32px] shadow-xl shadow-slate-200/50 border border-white/50 flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                <div className="relative w-full md:w-[450px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by System ID, MAC, or Name..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-none rounded-[20px] text-xs font-bold focus:ring-2 focus:ring-green-600 transition-all placeholder:text-slate-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="h-10 w-[1px] bg-slate-200 mx-2 hidden md:block" />
                    <select
                        className="bg-white border border-slate-100 rounded-[18px] text-[10px] font-black uppercase tracking-widest px-6 py-3 focus:ring-2 focus:ring-green-600 cursor-pointer shadow-sm hover:bg-slate-50 transition-all"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="ALL">Hardware: All</option>
                        <option value="DESKTOP">Infrastructure: Desktop</option>
                        <option value="LAPTOP">End-User: Laptop</option>
                        <option value="SERVER">Node: Server</option>
                        <option value="ROUTER">Network: Router</option>
                    </select>
                    <select
                        className="bg-white border border-slate-100 rounded-[18px] text-[10px] font-black uppercase tracking-widest px-6 py-3 focus:ring-2 focus:ring-green-600 cursor-pointer shadow-sm hover:bg-slate-50 transition-all"
                        value={filterLab}
                        onChange={(e) => setFilterLab(e.target.value)}
                    >
                        <option value="ALL">Location: All Labs</option>
                        {labs.map(l => <option key={l.id} value={l.id}>Lab: {l.name}</option>)}
                    </select>
                    <select
                        className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-sm transition-all border ${filterStatus === 'ALL' ? 'bg-white border-slate-100' : 'bg-green-600 text-white border-green-600'
                            }`}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL" className="text-slate-900">Status: All</option>
                        <option value="ACTIVE" className="text-slate-900">Operational</option>
                        <option value="UNDER_MAINTENANCE" className="text-slate-900">Maintenance</option>
                        <option value="DAMAGED" className="text-slate-900">Compromised</option>
                    </select>
                </div>
            </div>

            {/* Assets Table */}
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
                                    <th className="px-8 py-5">System Information</th>
                                    <th className="px-6 py-5">MAC ADDRESS</th>
                                    <th className="px-6 py-5">Department / Lab</th>
                                    <th className="px-6 py-5">Status</th>
                                    {canDelete && <th className="px-6 py-5">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredAssets.length > 0 ? filteredAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                                    <Monitor className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-tight">{asset.name}</p>
                                                    <p className="text-[11px] font-medium text-slate-500 mt-1">{asset.assetNumber} • {asset.brand}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <code className="text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 italic">
                                                {asset.macAddress || "No MAC"}
                                            </code>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-700">{asset.department?.code || "SYSTEM"}</span>
                                                <span className="text-[11px] text-slate-400">{asset.lab?.name || "Global"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${asset.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {asset.status === 'ACTIVE' ? 'Operational' : 'Maintenance'}
                                            </span>
                                        </td>
                                        {canDelete && (
                                            <td className="px-6 py-5">
                                                <button
                                                    onClick={() => handleDeleteAsset(asset.id)}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Delete Asset"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center grayscale opacity-50">
                                                <Monitor className="h-12 w-12 mb-4" />
                                                <p className="font-black text-sm uppercase tracking-widest">No matching assets found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {filteredAssets.length} of {assets.length} Assets</p>
                    <div className="flex gap-2">
                        <button className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-all">
                            <ChevronLeft className="h-4 w-4 text-slate-600" />
                        </button>
                        <button className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-all">
                            <ChevronRight className="h-4 w-4 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Asset Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Register New Asset"
                className="max-w-2xl"
            >
                <form onSubmit={handleAddAsset} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Name</label>
                            <input name="name" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" placeholder="e.g. Dell Optiplex 7090" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Number (Tag)</label>
                            <input name="assetNumber" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" placeholder="e.g. CSE-PC-01" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Type</label>
                            <select name="type" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500">
                                <option value="DESKTOP">Desktop</option>
                                <option value="LAPTOP">Laptop</option>
                                <option value="SERVER">Server</option>
                                <option value="ROUTER">Router</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">MAC Address</label>
                            <input name="macAddress" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" placeholder="e.g. 00:0A:95:9D:68:16" />
                            <input type="hidden" name="category" value="Computing" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</label>
                            <select name="departmentId" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500">
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lab (Optional)</label>
                            <select name="labId" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500">
                                <option value="">Global / No Lab</option>
                                {labs.map(l => <option key={l.id} value={l.id}>{l.name} ({l.code})</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand</label>
                            <input name="brand" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Model</label>
                            <input name="model" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "REGISTER ASSET SYSTEM"}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
