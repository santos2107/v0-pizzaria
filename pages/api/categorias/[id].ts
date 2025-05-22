import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"

// Cliente Supabase com chave de serviço para operações administrativas
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Verificar se o usuário é admin
async function isAdmin(token: string) {
  try {
    // Verificar o token e obter o usuário
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) return false

    // Buscar o perfil do usuário para verificar a role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) return false
    return profile.role === "admin"
  } catch (error) {
    console.error("Erro ao verificar permissões:", error)
    return false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Extrair o token de autorização
  const token = req.headers.authorization?.split(" ")[1] || ""

  // Obter o ID da categoria da URL
  const { id } = req.query
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "ID inválido" })
  }

  // GET - Obter categoria específica (público)
  if (req.method === "GET") {
    try {
      const { data, error } = await supabaseAdmin.from("categorias").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") {
          return res.status(404).json({ error: "Categoria não encontrada" })
        }
        throw error
      }

      return res.status(200).json(data)
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // PUT - Atualizar categoria (apenas admin)
  if (req.method === "PUT") {
    // Verificar se o usuário é admin
    const admin = await isAdmin(token)
    if (!admin) {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores podem atualizar categorias." })
    }

    try {
      const { nome, descricao } = req.body

      // Validação básica
      if (!nome) {
        return res.status(400).json({ error: "Nome da categoria é obrigatório" })
      }

      // Atualizar categoria
      const { data, error } = await supabaseAdmin.from("categorias").update({ nome, descricao }).eq("id", id).select()

      if (error) throw error
      if (data.length === 0) {
        return res.status(404).json({ error: "Categoria não encontrada" })
      }

      return res.status(200).json(data[0])
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // DELETE - Excluir categoria (apenas admin)
  if (req.method === "DELETE") {
    // Verificar se o usuário é admin
    const admin = await isAdmin(token)
    if (!admin) {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores podem excluir categorias." })
    }

    try {
      // Verificar se há produtos usando esta categoria
      const { data: produtos, error: produtosError } = await supabaseAdmin
        .from("produtos")
        .select("id")
        .eq("categoria_id", id)
        .limit(1)

      if (produtosError) throw produtosError

      if (produtos && produtos.length > 0) {
        return res.status(400).json({
          error: "Não é possível excluir esta categoria pois existem produtos associados a ela",
        })
      }

      // Excluir categoria
      const { error } = await supabaseAdmin.from("categorias").delete().eq("id", id)

      if (error) throw error
      return res.status(204).end()
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // Método não permitido
  return res.status(405).json({ error: "Método não permitido" })
}
