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
   authors: [{ name: "Baddies Team", url: "https://baddies-bosh.vercel.app" }],

  creator: "Baddies Calibration Team",
  openGraph: {
    title: "Baddies Calibration & Asset Management System",
    description: "Track, manage, and predict tool calibration schedules using AI.",
    url: "https://baddies-bosh.vercel.app",
    siteName: "Baddies Calibration & Asset Management System",
    images: [
      {
        url: "https://baddies-bosh.vercel.app/og-image.png", // Update this to your actual OG image URL
        width: 1200,
        height: 630,
        alt: "Baddies Calibration & Asset Management System"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Baddies Calibration & Asset Management System",
    description: "AI-powered asset and calibration management platform for precision tools.",
    images: ["https://baddies-bosh.vercel.app/og-image.png"] // Update with your actual image
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  alternates: {
    canonical: "https://baddies-bosh.vercel.app"
  },
  metadataBase: new URL("https://baddies-bosh.vercel.app")
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
