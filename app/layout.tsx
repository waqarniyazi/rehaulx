import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { AuthProvider } from "@/hooks/useAuth"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ReHaulX - Transform Videos into Viral Content",
  description:
    "We do the magic in the background. Submit your YouTube video and get professional blog articles, LinkedIn posts, and Twitter threads instantly.",
  keywords: "video content, blog generation, social media, AI content, YouTube to blog",
    generator: 'v0.app',
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon/favicon.ico", rel: "shortcut icon" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/favicon/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          <AuthProvider>
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
              {children}
              <Toaster />
              <SonnerToaster theme="dark" position="top-right" richColors closeButton />
              <Analytics />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
