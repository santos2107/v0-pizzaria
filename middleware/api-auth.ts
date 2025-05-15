import { type NextRequest, NextResponse } from "next/server"

// Função para validar a API key
export async function validateApiKey(request: NextRequest) {
  // Verificar se a requisição é interna (do próprio frontend)
  const isInternalRequest = request.headers.get("referer")?.includes(request.headers.get("host") || "")

  // Se for uma requisição interna e estamos em ambiente de desenvolvimento, podemos pular a validação
  if (isInternalRequest && process.env.NODE_ENV === "development") {
    return null
  }

  // Obter a API key do cabeçalho da requisição
  const apiKey = request.headers.get("api_key")

  // Verificar se a API key foi fornecida
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "API key não fornecida",
      },
      { status: 401 },
    )
  }

  // Definir a API key válida (hardcoded para simplificar)
  const validApiKey = "api_key_pizzaria_kassio_2024"

  // Verificar se a API key é válida
  if (apiKey !== validApiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "API key inválida",
      },
      { status: 403 },
    )
  }

  // Se a API key for válida, retornar null para continuar com a requisição
  return null
}
