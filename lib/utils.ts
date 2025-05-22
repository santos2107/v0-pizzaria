/**
 * Formata um valor de tempo em milissegundos para o formato "HH:MM:SS"
 * @param time Tempo em milissegundos
 * @returns String formatada no padrão "HH:MM:SS"
 */
export function formatTime(time: number): string {
  const hours = Math.floor(time / 3600000)
  const minutes = Math.floor((time % 3600000) / 60000)
  const seconds = Math.floor((time % 60000) / 1000)

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

/**
 * Calcula o tempo decorrido entre duas datas em milissegundos
 * @param startTime Data de início
 * @param endTime Data de fim (opcional, usa a data atual se não fornecido)
 * @returns Tempo decorrido em milissegundos
 */
export function getElapsedTime(startTime: Date, endTime: Date = new Date()): number {
  return endTime.getTime() - startTime.getTime()
}

/**
 * Função utilitária para combinar classes condicionalmente
 * @param inputs Classes CSS a serem combinadas
 * @returns String com as classes combinadas
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(" ")
}

/**
 * Formata um valor monetário para o formato brasileiro (R$)
 * @param value Valor a ser formatado
 * @returns String formatada (ex: "R$ 10,50")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Formata uma data para o formato brasileiro
 * @param date Data a ser formatada
 * @returns String formatada (ex: "01/01/2023")
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(date)
}
