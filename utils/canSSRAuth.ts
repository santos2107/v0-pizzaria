import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"

// Função para páginas que só podem ser acessadas por usuários autenticados
export function canSSRAuth<P extends { [key: string]: any }>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const supabase = createServerSupabaseClient(ctx)

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Se não tiver sessão, redireciona para o login
    if (!session) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      }
    }

    // Se tiver sessão, continua normalmente
    return await fn(ctx)
  }
}
