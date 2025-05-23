import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cardápio Digital | Pizzaria do Kassio",
  description: "Cardápio digital da Pizzaria do Kassio - Peça online!",
}

export default function CardapioDigitalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={`min-h-screen ${inter.className}`}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </div>
  )
}
