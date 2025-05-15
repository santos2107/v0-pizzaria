"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { ThemeConfigProvider } from "@/contexts/theme-config-context"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function ClientRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const showSidebar = pathname !== "/cardapio-digital"

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeConfigProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <div className="flex h-screen">
              {showSidebar && <Sidebar />}
              <main className={`flex-1 overflow-auto ${showSidebar ? "lg:pl-64" : ""}`}>{children}</main>
            </div>
          </ThemeProvider>
        </ThemeConfigProvider>
      </body>
    </html>
  )
}
