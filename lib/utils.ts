import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para formatar data e hora
export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Função para calcular o tempo decorrido desde uma data
export function getElapsedTime(startTime: string): string {
  const start = new Date(startTime).getTime()
  const now = Date.now()
  const elapsed = now - start

  // Converter para minutos
  const minutes = Math.floor(elapsed / 60000)

  if (minutes < 1) {
    return "agora"
  } else if (minutes === 1) {
    return "1 min"
  } else if (minutes < 60) {
    return `${minutes} min`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
      return hours === 1 ? "1 hora" : `${hours} horas`
    } else {
      return `${hours}h ${remainingMinutes}min`
    }
  }
}

// Função para formatar valores monetários
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}
