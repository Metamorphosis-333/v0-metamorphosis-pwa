import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Playwrite_AU_SA as Playwrite_AU } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const playwriteAU = Playwrite_AU({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-cursive",
})

export const metadata: Metadata = {
  title: "Metamorphosis - AI Fitness Companion",
  description: "Your hybrid AI dietitian, trainer, and psychiatrist for total transformation",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.jpg",
    apple: "/icon-512.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Metamorphosis",
  },
}

export const viewport: Viewport = {
  themeColor: "#9333EA",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${playwriteAU.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Metamorphosis" />
        <meta
          httpEquiv="Permissions-Policy"
          content="publickey-credentials-create=(self), publickey-credentials-get=(self)"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
