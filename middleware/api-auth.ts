import { type NextRequest, NextResponse } from "next/server"

// Função para validar a API key (SIMPLIFICADA PARA TESTE)
export async function validateApiKey(request: NextRequest) {
  // Obter a API key do cabeçalho da requisição
  const apiKey = request.headers.get("api_key")

  // Definir a API key válida (hardcoded para simplificar)
  const validApiKey = "api_key_pizzaria_kassio_2024"

  // Verificar se a API key foi fornecida e se é válida
  if (apiKey === validApiKey) {
    // Se a API key for válida, retornar null para continuar com a requisição
    return null
  }

  // Se a API key não foi fornecida ou é inválida
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "API key não fornecida",
      },
      { status: 401 },
    )
  }

  return NextResponse.json(
    {
      success: false,
      error: "API key inválida",
    },
    { status: 403 },
  )
}
