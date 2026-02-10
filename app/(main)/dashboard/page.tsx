"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role) {
            const roleRoute = session.user.role.toLowerCase().replace('_', '-');
            router.replace(`/dashboard/${roleRoute}`);
        } else if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [session, status, router]);

    return (
        <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-green-600" />
            <p className="text-slate-500 font-medium animate-pulse uppercase tracking-widest text-xs">
                Redirecting to your workspace...
            </p>
        </div>
    );
}

