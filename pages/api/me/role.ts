import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"

// Cliente Supabase com chave de serviço para operações administrativas
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Extrair o token de autorização
  const token = req.headers.authorization?.split(" ")[1] || ""

  if (!token) {
    return res.status(401).json({ error: "Não autenticado" })
  }

  try {
    // Verificar o token e obter o usuário
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return res.status(401).json({ error: "Token inválido" })
    }

    // Buscar o perfil do usuário para verificar a role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      if (profileError.code === "PGRST116") {
        // Perfil não encontrado, retornar role padrão
        return res.status(200).json({ role: "customer" })
      }
      throw profileError
    }

    return res.status(200).json({ role: profile.role || "customer" })
  } catch (error: any) {
    console.error("Erro ao buscar role:", error)
    return res.status(500).json({ error: error.message })
  }
}
