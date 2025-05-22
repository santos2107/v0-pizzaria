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

  // GET - Listar todas as categorias (público)
  if (req.method === "GET") {
    try {
      const { data, error } = await supabaseAdmin.from("categorias").select("*").order("nome")

      if (error) throw error
      return res.status(200).json(data)
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // POST - Criar nova categoria (apenas admin)
  if (req.method === "POST") {
    // Verificar se o usuário é admin
    const admin = await isAdmin(token)
    if (!admin) {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores podem criar categorias." })
    }

    try {
      const { nome, descricao } = req.body

      // Validação básica
      if (!nome) {
        return res.status(400).json({ error: "Nome da categoria é obrigatório" })
      }

      // Inserir nova categoria
      const { data, error } = await supabaseAdmin.from("categorias").insert([{ nome, descricao }]).select()

      if (error) throw error
      return res.status(201).json(data[0])
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // Método não permitido
  return res.status(405).json({ error: "Método não permitido" })
}
