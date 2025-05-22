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

  // GET - Listar produtos
  if (req.method === "GET") {
    try {
      const products = await prisma.product.findMany({
        include: {
          category: true,
        },
        orderBy: {
          name: "asc",
        },
      })

      return res.status(200).json(products)
    } catch (error) {
      console.error("Erro ao listar produtos:", error)
      return res.status(500).json({ error: "Erro interno do servidor" })
    }
  }

  // POST - Criar produto
  if (req.method === "POST") {
    try {
      const { name, price, description, category_id, banner } = req.body

      if (!name || !price || !description || !category_id) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" })
      }

      const product = await prisma.product.create({
        data: {
          name,
          price,
          description,
          banner,
          category_id,
        },
      })

      return res.status(201).json(product)
    } catch (error) {
      console.error("Erro ao criar produto:", error)
      return res.status(500).json({ error: "Erro interno do servidor" })
    }
  }

  // Método não permitido
  return res.status(405).json({ error: "Método não permitido" })
}
