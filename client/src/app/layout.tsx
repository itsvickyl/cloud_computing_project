import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { GlobalLoadingOverlay } from "@/components/shared";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "TalentScope - Find Your Dream Job",
    template: "%s | TalentScope",
  },
  description:
    "Connect talented professionals with amazing opportunities. Find jobs, hire talent, and accelerate your career with TalentScope.",
  keywords: [
    "jobs",
    "careers",
    "hiring",
    "recruitment",
    "job board",
    "employment",
    "remote jobs",
  ],
  authors: [{ name: "TalentScope" }],
  openGraph: {
    type: "website",
    title: "TalentScope - Find Your Dream Job",
    description: "Connect talented professionals with amazing opportunities.",
    siteName: "TalentScope",
  },
  twitter: {
    card: "summary_large_image",
    title: "TalentScope - Find Your Dream Job",
    description: "Connect talented professionals with amazing opportunities.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <GlobalLoadingOverlay />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
