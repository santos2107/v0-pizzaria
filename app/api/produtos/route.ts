import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get("categoria")
    const disponivel = searchParams.get("disponivel")
    const busca = searchParams.get("busca")

    let query = supabaseServer.from("produtos").select("*")

    if (categoria) {
      query = query.eq("categoria", categoria)
    }

    if (disponivel !== null) {
      query = query.eq("disponivel", disponivel === "true")
    }

    if (busca) {
      query = query.ilike("nome", `%${busca}%`)
    }

    const { data, error } = await query.order("nome")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const produto = await request.json()

    const { data, error } = await supabaseServer.from("produtos").insert(produto).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}
