import axios from "axios"
import { supabase } from "@/lib/supabaseClient"

// Criar instância do axios
const api = axios.create({
  baseURL: "/api",
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  async (config) => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export { api }
