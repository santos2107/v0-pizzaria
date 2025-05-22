import type { NextApiRequest, NextApiResponse } from "next"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import prisma from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Criar cliente Supabase com contexto da requisição
  const supabase = createServerSupabaseClient({ req, res })

  // Verificar se o usuário está autenticado para operações de escrita
  if (req.method !== "GET") {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return res.status(401).json({ error: "Não autorizado" })
    }

    // Verificar se o usuário é admin para operações de escrita
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || profile.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado" })
    }
  }

  // GET - Listar categorias
  if (req.method === "GET") {
    try {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
      })

      return res.status(200).json(categories)
    } catch (error) {
      console.error("Erro ao listar categorias:", error)
      return res.status(500).json({ error: "Erro interno do servidor" })
    }
  }

  // POST - Criar categoria
  if (req.method === "POST") {
    try {
      const { name } = req.body

      if (!name) {
        return res.status(400).json({ error: "Nome da categoria é obrigatório" })
      }

      const category = await prisma.category.create({
        data: {
          name,
        },
      })

      return res.status(201).json(category)
    } catch (error) {
      console.error("Erro ao criar categoria:", error)
      return res.status(500).json({ error: "Erro interno do servidor" })
    }
  }

  // Método não permitido
  return res.status(405).json({ error: "Método não permitido" })
}
