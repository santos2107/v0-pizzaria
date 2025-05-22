"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Utensils, ShoppingCart, Users, ClipboardList, Settings, Menu, X, Coffee, DollarSign } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
interface SidebarProps {
  className?: string
}
// Mudar a exportação de default para nomeada para manter compatibilidade com o código existente
// Alterar de:
// export default function Sidebar({ className }: SidebarProps) {
// Para:
export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  // Fechar a sidebar ao clicar em um link em telas pequenas
  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false)
    }
  }
  // Fechar a sidebar ao redimensionar para tela grande
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      active: pathname === "/",
    },
    {
      title: "Produtos",
      icon: Coffee,
      href: "/produtos",
      active: pathname.startsWith("/produtos"),
    },
    {
      title: "Cardápio",
      icon: Utensils,
      href: "/cardapio",
      active: pathname.startsWith("/cardapio"),
    },
    {
      title: "Pedidos",
      icon: ShoppingCart,
      href: "/pedidos",
      active: pathname.startsWith("/pedidos"),
    },
    {
      title: "Cozinha",
      icon: ClipboardList,
      href: "/cozinha",
      active: pathname.startsWith("/cozinha"),
    },
    {
      title: "Mesas",
      icon: Utensils,
      href: "/mesas",
      active: pathname.startsWith("/mesas"),
    },
    {
      title: "Clientes",
      icon: Users,
      href: "/clientes",
      active: pathname.startsWith("/clientes"),
    },
    {
      title: "Financeiro",
      icon: DollarSign,
      href: "/financeiro",
      active: pathname.startsWith("/financeiro"),
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/configuracoes",
      active: pathname.startsWith("/configuracoes"),
    },
  ]
  return (
    <>
      {/* Botão hamburger para telas pequenas */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-md shadow-md"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      {/* Overlay quando o menu está aberto em telas pequenas */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsOpen(false)}></div>
      )}
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-md z-40 transition-transform duration-300 transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 border-b">
            <Link href="/" className="flex items-center space-x-2" onClick={closeSidebar}>
              <Image src="/pizza-logo.png" alt="Pizzaria do Kassio" width={40} height={40} />
              <span className="text-xl font-bold">Pizzaria do Kassio</span>
            </Link>
          </div>
          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    onClick={closeSidebar}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* Footer */}
          <div className="p-4 border-t text-center text-sm text-muted-foreground">
            <p>© 2023 Pizzaria do Kassio</p>
            <p>Versão 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
