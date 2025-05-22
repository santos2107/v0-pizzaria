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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Extrair o token de autorização
  const token = req.headers.authorization?.split(" ")[1] || ""

  // Verificar usuário e role
  const { user, role } = await getUserAndRole(token)

  // Se não estiver autenticado, negar acesso
  if (!user) {
    return res.status(401).json({ error: "Não autenticado" })
  }

  // GET - Listar pedidos (filtrados por permissão)
  if (req.method === "GET") {
    try {
      let query = supabaseAdmin
        .from("pedidos")
        .select(`
          *,
          cliente:cliente_id(*),
          mesa:mesa_id(*),
          itens:itens_pedido(
            *,
            produto:produto_id(*)
          )
        `)
        .order("created_at", { ascending: false })

      // Se não for admin ou staff, filtrar apenas pedidos do próprio usuário
      if (role !== "admin" && role !== "staff") {
        query = query.eq("cliente_id", user.id)
      }

      // Aplicar filtros adicionais da query string
      const { status } = req.query
      if (status && !Array.isArray(status)) {
        query = query.eq("status", status)
      }

      const { data, error } = await query

      if (error) throw error
      return res.status(200).json(data)
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // POST - Criar novo pedido
  if (req.method === "POST") {
    try {
      const { cliente_id, mesa_id, itens, observacoes, tipo_entrega } = req.body

      // Validação básica
      if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ error: "Itens do pedido são obrigatórios" })
      }

      // Calcular valor total
      let valor_total = 0
      for (const item of itens) {
        if (!item.produto_id || !item.quantidade || !item.preco_unitario) {
          return res.status(400).json({ error: "Dados de item inválidos" })
        }
        valor_total += item.quantidade * item.preco_unitario
      }

      // Iniciar transação para criar pedido e itens
      const { data: pedido, error: pedidoError } = await supabaseAdmin
        .from("pedidos")
        .insert([
          {
            cliente_id: cliente_id || user.id, // Se não especificado, usa o ID do usuário atual
            mesa_id,
            valor_total,
            observacoes,
            tipo_entrega: tipo_entrega || "Local",
            status: "Pendente",
          },
        ])
        .select()

      if (pedidoError) throw pedidoError
      if (!pedido || pedido.length === 0) {
        throw new Error("Erro ao criar pedido")
      }

      // Adicionar pedido_id aos itens
      const itensComPedidoId = itens.map((item) => ({
        ...item,
        pedido_id: pedido[0].id,
      }))

      // Inserir itens do pedido
      const { error: itensError } = await supabaseAdmin.from("itens_pedido").insert(itensComPedidoId)

      if (itensError) throw itensError

      return res.status(201).json(pedido[0])
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // Método não permitido
  return res.status(405).json({ error: "Método não permitido" })
}
