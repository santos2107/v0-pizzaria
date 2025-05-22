import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"

// Cliente Supabase com chave de serviço para operações administrativas
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Verificar o usuário e sua role
async function getUserAndRole(token: string) {
  try {
    // Verificar o token e obter o usuário
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) return { user: null, role: null }

    // Buscar o perfil do usuário para verificar a role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) return { user, role: null }
    return { user, role: profile.role }
  } catch (error) {
    console.error("Erro ao verificar usuário:", error)
    return { user: null, role: null }
  }
}

// Verificar se o usuário pode atualizar o pedido
async function canUpdateOrder(userId: string, role: string, orderId: string) {
  // Admin e staff podem atualizar qualquer pedido
  if (role === "admin" || role === "staff") return true

  // Clientes só podem atualizar seus próprios pedidos
  const { data, error } = await supabaseAdmin.from("pedidos").select("cliente_id, status").eq("id", orderId).single()

  if (error || !data) return false

  // Cliente só pode atualizar seus próprios pedidos e apenas se estiverem pendentes
  return data.cliente_id === userId && data.status === "Pendente"
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Extrair o token de autorização
  const token = req.headers.authorization?.split(" ")[1] || ""

  // Verificar usuário e role
  const { user, role } = await getUserAndRole(token)

  // Se não estiver autenticado, negar acesso
  if (!user) {
    return res.status(401).json({ error: "Não autenticado" })
  }

  // Obter o ID do pedido da URL
  const { id } = req.query
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "ID inválido" })
  }

  // PATCH - Atualizar status do pedido
  if (req.method === "PATCH") {
    try {
      const { status } = req.body

      // Validação básica
      if (!status) {
        return res.status(400).json({ error: "Status é obrigatório" })
      }

      // Verificar status válido
      const statusValidos = ["Pendente", "Em Preparo", "Pronto", "Entregue", "Cancelado"]
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ error: "Status inválido" })
      }

      // Verificar permissão
      const canUpdate = await canUpdateOrder(user.id, role || "", id)
      if (!canUpdate) {
        return res.status(403).json({ error: "Sem permissão para atualizar este pedido" })
      }

      // Atualizar status do pedido
      const { data, error } = await supabaseAdmin
        .from("pedidos")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()

      if (error) throw error
      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Pedido não encontrado" })
      }

      return res.status(200).json(data[0])
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // Método não permitido
  return res.status(405).json({ error: "Método não permitido" })
}
