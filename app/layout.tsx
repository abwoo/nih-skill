import "@/app/globals.css"
import { StoreProvider } from "@/lib/store"
import type { Metadata, Viewport } from "next"
import { Toaster } from "sonner"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1628" },
  ],
}

export const metadata: Metadata = {
  title: "BME Research Accelerator · 生物医学工程研究加速器",
  description: "AI-powered research acceleration platform for Biomedical Engineering (BME) - PDF parsing, DOI resolution, literature analysis, and more",
  keywords: ["BME", "Biomedical Engineering", "Research", "PDF Parser", "DOI Resolver", "AI", "Literature Analysis"],
  authors: [{ name: "BME Research Team" }],
  creator: "BME Research Accelerator",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-dark-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png", rel: "apple-touch-icon" },
    ],
  },
  openGraph: {
    title: "BME Research Accelerator",
    description: "AI-powered research acceleration platform for Biomedical Engineering",
    type: "website",
    locale: "en_US",
    siteName: "BME Research Accelerator",
  },
  twitter: {
    card: "summary_large_image",
    title: "BME Research Accelerator",
    description: "AI-powered research acceleration platform for Biomedical Engineering",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta name="application-name" content="BME Research Accelerator" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased bg-background text-foreground min-h-screen bg-gradient-mesh">
        <StoreProvider>
          {children}
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  )
}
