"use client"

import { useState, useContext, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AuthContext } from "@/contexts/auth-context"
import {
  Home,
  LayoutDashboard,
  Users,
  ShoppingBag,
  Utensils,
  Coffee,
  FileText,
  ChefHat,
  Settings,
  Menu,
  X,
  LogOut,
  Pizza,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, signOut } = useContext(AuthContext)
  const pathname = usePathname()

  // Fechar sidebar ao navegar em telas pequenas
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Links da navegação
  const navLinks = [
    {
      name: "Início",
      href: "/",
      icon: <Home className="h-5 w-5" />,
      requireAuth: false,
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      requireAuth: true,
    },
    {
      name: "Clientes",
      href: "/clientes",
      icon: <Users className="h-5 w-5" />,
      requireAuth: true,
    },
    {
      name: "Produtos",
      href: "/produtos",
      icon: <ShoppingBag className="h-5 w-5" />,
      requireAuth: true,
      adminOnly: true,
    },
    {
      name: "Mesas",
      href: "/mesas",
      icon: <Utensils className="h-5 w-5" />,
      requireAuth: true,
    },
    {
      name: "Pedidos",
      href: "/pedidos",
      icon: <FileText className="h-5 w-5" />,
      requireAuth: true,
    },
    {
      name: "Cozinha",
      href: "/cozinha",
      icon: <ChefHat className="h-5 w-5" />,
      requireAuth: true,
    },
    {
      name: "Cardápio",
      href: "/cardapio",
      icon: <Coffee className="h-5 w-5" />,
      requireAuth: true,
    },
    {
      name: "Configurações",
      href: "/configuracoes",
      icon: <Settings className="h-5 w-5" />,
      requireAuth: true,
      adminOnly: true,
    },
  ]

  // Filtrar links baseado em autenticação e role
  const filteredLinks = navLinks.filter((link) => {
    if (!isAuthenticated && link.requireAuth) return false
    if (link.adminOnly && user?.role !== "admin") return false
    return true
  })

  return (
    <>
      {/* Barra lateral para desktop */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-white border-r fixed left-0 top-0">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Pizza className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Pizzaria do Kassio</h1>
              <p className="text-xs text-gray-500">Sistema de Gerenciamento</p>
            </div>
          </div>
        </div>

        <Separator />

        <nav className="flex-1 p-4 space-y-1">
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                pathname === link.href ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        {isAuthenticated && (
          <div className="p-4 border-t">
            <div className="mb-2">
              <p className="text-sm font-medium">{user?.name || user?.email}</p>
              <p className="text-xs text-gray-500">{user?.role === "admin" ? "Administrador" : "Funcionário"}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-gray-600"
              onClick={() => {
                signOut()
                toast.success("Logout realizado com sucesso")
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        )}
      </aside>

      {/* Botão de menu para mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay para mobile */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Menu lateral para mobile */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 mt-12">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Pizza className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Pizzaria do Kassio</h1>
              <p className="text-xs text-gray-500">Sistema de Gerenciamento</p>
            </div>
          </div>
        </div>

        <Separator />

        <nav className="flex-1 p-4 space-y-1">
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                pathname === link.href ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        {isAuthenticated && (
          <div className="p-4 border-t">
            <div className="mb-2">
              <p className="text-sm font-medium">{user?.name || user?.email}</p>
              <p className="text-xs text-gray-500">{user?.role === "admin" ? "Administrador" : "Funcionário"}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-gray-600"
              onClick={() => {
                signOut()
                toast.success("Logout realizado com sucesso")
                setIsOpen(false)
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        )}
      </aside>

      {/* Espaçamento para o conteúdo principal */}
      <div className="md:pl-64">{/* Conteúdo da página */}</div>
    </>
  )
}

export default Sidebar
