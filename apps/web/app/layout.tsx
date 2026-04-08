import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google"; // eslint-disable-line @typescript-eslint/no-unused-vars
import "./globals.css";
import { Providers } from "@/components/Providers";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
    title: "Integrix",
    description: "Automate your workflow",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${outfit.variable} ${jakarta.variable} font-sans antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
