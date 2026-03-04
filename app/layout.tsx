import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Vignan Institute IT Services",
    description: "Vignan Institute of Technology and Science - Asset Management",
};

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning={true}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
