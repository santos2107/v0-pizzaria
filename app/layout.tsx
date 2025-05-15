import type React from "react"
import type { Metadata } from "next"
import ClientRootLayout from "./client_layout"

export const metadata: Metadata = {
  title: "Sistema de Delivery - Inspirado no Goomer",
  description: "Sistema de gerenciamento de delivery para restaurantes",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientRootLayout>{children}</ClientRootLayout>
}


import './globals.css'