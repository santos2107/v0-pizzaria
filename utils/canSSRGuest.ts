import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"

// Função para páginas que só podem ser acessadas por visitantes (não autenticados)
export function canSSRGuest<P extends { [key: string]: any }>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const supabase = createServerSupabaseClient(ctx)

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Se tiver sessão, redireciona para o dashboard
    if (session) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      }
    }

    // Se não tiver sessão, continua normalmente
    return await fn(ctx)
  }
}
