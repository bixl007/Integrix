import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Integrix",
    description: "Workflow automation tool",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="font-sans antialiased">
                {children}
            </body>
        </html>
    );
}
