import type { NextApiRequest, NextApiResponse } from "next"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Criar cliente Supabase com contexto da requisição
  const supabase = createServerSupabaseClient({ req, res })

  // Verificar se o usuário está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: "Não autorizado" })
  }

  try {
    // Buscar perfil do usuário
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .eq("id", session.user.id)
      .single()

    if (error) throw error

    return res.status(200).json(data)
  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    return res.status(500).json({ error: "Erro interno do servidor" })
  }
}
