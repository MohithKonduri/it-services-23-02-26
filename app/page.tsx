"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Hero } from "@/components/ui/hero";
import { Leaf, Zap, Shield, Globe } from "lucide-react";

export default function Home() {
    const router = useRouter();

    return (
        <main className="relative min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 overflow-hidden selection:bg-[#2d6a4f]/30 font-sans text-slate-900">
            {/* Ambient Nature Mesh Backgrounds */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#ecf39e]/40 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#91a84b]/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#f7e479]/40 rounded-full blur-[100px]"
                />
            </div>

            <Hero
                trustBadge={{
                    text: "Vignan Institute of Technology and Science",
                    icons: ["🚀", "⭐", "🍃"]
                }}
                headline={{
                    line1: "IT",
                    line2: "Services"
                }}
                subtitle="Advanced Asset & Service Management System for Modern Institutions. Streamline operations, track assets, and manage requests efficiently."
                buttons={{
                    primary: {
                        text: "Login to Dashboard →",
                        onClick: () => router.push("/login")
                    }
                }}
                className="max-w-4xl"
            />

            {/* Subtle Side Ornaments */}
            <div className="hidden lg:block fixed left-10 top-1/2 -translate-y-1/2 space-y-12 opacity-20 z-0">
                <Leaf className="w-10 h-10 text-[#2d6a4f]" />
                <Zap className="w-8 h-8 text-[#c5a059] ml-6" />
            </div>
            <div className="hidden lg:block fixed right-10 top-1/2 -translate-y-1/2 space-y-12 opacity-20 z-0 flex flex-col items-end text-right">
                <Shield className="w-10 h-10 text-[#1b4332]" />
                <Globe className="w-8 h-8 text-[#c5a059] mr-6" />
            </div>

            {/* Premium Bottom Bar Decoration */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#1b4332] via-[#c5a059] to-[#1b4332] opacity-20" />
        </main>
    );
}
