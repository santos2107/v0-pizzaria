import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "@/contexts/auth-context"
import Sidebar from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pizzaria do Kassio - Sistema de Gerenciamento",
  description: "Sistema completo para gerenciamento de pedidos, mesas e produtos da Pizzaria do Kassio",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 md:pl-64">{children}</main>
          </div>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
