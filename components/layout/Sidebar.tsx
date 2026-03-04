"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    Server,
    Ticket,
    Bell,
    Settings,
    LogOut,
    Shield,
    Monitor,
    Wrench,
    Activity,
    User,
    Layers
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const getDashboardHref = () => {
        if (!session?.user?.role) return "/login";
        return `/dashboard/${session.user.role.toLowerCase().replace('_', '-')}`;
    };

    const sidebarLinks = [
        { name: "Dashboard", href: getDashboardHref(), icon: LayoutDashboard },
        { name: "Departments", href: "/departments", icon: Building2 },
        { name: "Labs", href: "/labs", icon: Server },
        { name: "Assets", href: "/assets", icon: Monitor },
        { name: "Allocate Systems", href: "/allocate", icon: Layers, deanOnly: true },
        { name: "Requests", href: "/tickets", icon: Wrench },
        { name: "Users", href: "/users", icon: User },
        { name: "History", href: "/notifications", icon: Activity },
    ];

    const filteredLinks = sidebarLinks.filter((link: any) => {
        const role = session?.user?.role;

        // Dean-only links
        if (link.deanOnly && role !== "DEAN") return false;

        // Hide Departments for HOD and ADMIN
        if (role === "HOD" && link.name === "Departments") return false;
        if (role === "ADMIN" && link.name === "Departments") return false;

        // Hide specific links for Lab Incharge
        if (role === "LAB_INCHARGE") {
            const hiddenLinks = ["Departments", "Labs", "Users"];
            if (hiddenLinks.includes(link.name)) return false;
        }

        return true;
    });

    const isDean = session?.user?.role === "DEAN";
    const accentColor = isDean ? "#1b4332" : "#f7e479";
    const secondaryColor = isDean ? "#2d6a4f" : "#f59e0b";
    const highlightColor = isDean ? "#40916c" : "#34d399";
    const activeTextColor = isDean ? "#d8f3dc" : "#ffffff";

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-72 bg-zinc-950 text-white shadow-2xl transition-all duration-300 border-r border-zinc-800/50">
            {/* Branding */}
            <div className="flex h-24 items-center gap-3 px-8 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
                <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500"
                    style={{
                        background: `linear-gradient(135deg, ${accentColor}, ${secondaryColor})`,
                        boxShadow: `0 10px 15px -3px ${accentColor}33`
                    }}
                >
                    <Shield className={isDean ? "h-6 w-6 text-white" : "h-6 w-6 text-black"} />
                </div>
                <h1 className="text-xl font-bold tracking-tight">
                    IT <span style={{ color: isDean ? "#40916c" : accentColor }} className="italic font-black">SERVICES</span>
                </h1>
            </div>

            {/* Profile Summary */}
            <div
                className="mx-6 my-8 p-4 rounded-[2rem] bg-zinc-900/50 border border-zinc-800/50 group transition-all duration-300"
                style={{ borderColor: `rgba(255,255,255,0.05)` }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="h-12 w-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center font-bold shadow-sm border border-zinc-700 group-hover:scale-105 transition-transform"
                        style={{ color: accentColor }}
                    >
                        {session?.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate text-white">{session?.user?.name || "User Account"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div
                                className="h-1.5 w-1.5 rounded-full animate-pulse"
                                style={{ backgroundColor: secondaryColor }}
                            />
                            <p
                                className="text-[10px] font-black uppercase tracking-[0.15em]"
                                style={{ color: accentColor }}
                            >
                                {session?.user?.role?.replace('_', ' ') || "Guest"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
                <div className="radio-container" style={{ "--total-radio": filteredLinks.length } as any}>
                    {filteredLinks.map((link, index) => {
                        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                        return (
                            <Fragment key={link.name}>
                                <input
                                    type="radio"
                                    name="main-sidebar-nav"
                                    id={`link-${index}`}
                                    checked={isActive}
                                    readOnly
                                />
                                <label
                                    htmlFor={`link-${index}`}
                                    className={cn(
                                        "group !py-4 transition-all duration-300",
                                        isActive ? "translate-x-1" : ""
                                    )}
                                >
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-4 w-full"
                                    >
                                        <link.icon
                                            className={cn(
                                                "h-5 w-5 transition-all duration-300",
                                                isActive ? "scale-110" : "text-zinc-500 group-hover:text-zinc-100 group-hover:scale-110"
                                            )}
                                            style={isActive ? { color: highlightColor } : {}}
                                        />
                                        <span
                                            className="text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
                                            style={isActive ? { color: activeTextColor } : {}}
                                        >
                                            {link.name}
                                        </span>
                                    </Link>
                                </label>
                            </Fragment>
                        );
                    })}
                    <div className="glider-container">
                        <div
                            className="glider"
                            style={{
                                backgroundColor: highlightColor,
                                "--main-color": highlightColor,
                                "--main-color-opacity": `${highlightColor}33`
                            } as any}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-8 left-0 w-full px-6 space-y-2">
                <button
                    onClick={async () => {
                        await signOut({ redirect: false });
                        window.location.href = "/login";
                    }}
                    className="flex w-full items-center gap-4 px-6 py-4 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-[20px] transition-all group"
                >
                    <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Sign Out Early</span>
                </button>
            </div>
        </aside>
    );
}
