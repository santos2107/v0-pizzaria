import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"

// Cria uma instância do cliente Supabase para o servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Função para validar token JWT do Supabase
export async function validateToken(req: NextApiRequest): Promise<{
  valid: boolean
  userId?: string
  role?: string
  error?: string
}> {
  try {
    // Obter o token do cabeçalho Authorization
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { valid: false, error: "Token não fornecido ou formato inválido" }
    }

    const token = authHeader.split(" ")[1]

    // Verificar o token usando o Supabase Admin
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return { valid: false, error: error?.message || "Token inválido" }
    }

    // Buscar o perfil do usuário para obter a role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError)
      // Ainda consideramos válido, mas sem role específica
      return { valid: true, userId: user.id }
    }

    return {
      valid: true,
      userId: user.id,
      role: profile?.role || "customer",
    }
  } catch (error) {
    console.error("Erro ao validar token:", error)
    return { valid: false, error: "Erro interno ao validar token" }
  }
}

// Função para validar chave de API
export function validateApiKey(req: NextApiRequest): boolean {
  try {
    const apiKey = req.headers["x-api-key"] as string

    // Verificar se a chave de API foi fornecida
    if (!apiKey) {
      return false
    }

    // Verificar se a chave de API é válida
    // Você pode armazenar chaves de API válidas no Supabase ou em variáveis de ambiente
    const validApiKeys = process.env.VALID_API_KEYS?.split(",") || []

    return validApiKeys.includes(apiKey)
  } catch (error) {
    console.error("Erro ao validar chave de API:", error)
    return false
  }
}

// Middleware para autenticação de API
export function withApiAuth(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Verificar se é uma requisição que usa chave de API
    if (req.headers["x-api-key"]) {
      if (!validateApiKey(req)) {
        return res.status(401).json({ error: "Chave de API inválida" })
      }
      return handler(req, res)
    }

    // Caso contrário, verificar token JWT
    const { valid, userId, role, error } = await validateToken(req)

    if (!valid) {
      return res.status(401).json({ error: error || "Não autorizado" })
    }
    // Adicionar informações do usuário à requisição
    ;(req as any).userId = userId
    ;(req as any).userRole = role

    return handler(req, res)
  }
}

// Middleware para verificar se o usuário tem uma role específica
export function withRoleCheck(handler: any, allowedRoles: string[]) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Primeiro, autenticar o usuário
    const authMiddleware = withApiAuth(async (req: NextApiRequest, res: NextApiResponse) => {
      const userRole = (req as any).userRole

      // Verificar se o usuário tem uma das roles permitidas
      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: "Acesso negado. Permissão insuficiente." })
      }

      // Se tiver permissão, prosseguir para o handler original
      return handler(req, res)
    })

    return authMiddleware(req, res)
  }
}
