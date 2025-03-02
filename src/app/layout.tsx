import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import { NavBar } from "@/components/NavBar";
import { SidebarComponent } from "@/components/sidebarComponent";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Baddies Calibration & Asset Management System",
  description: "A smart, AI-powered platform for efficient tool tracking, calibration scheduling, and predictive maintenance management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`w-screen ${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <SidebarComponent />
            <div className="fixed top-4 left-4 z-50 md:hidden">
              <SidebarTrigger />
            </div>
            <div className="w-full p-5">
              <div className="my-10">{children}</div>
            </div>
            <Toaster position="top-right" />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
