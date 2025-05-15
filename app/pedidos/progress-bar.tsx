"use client"

import { useEffect, useState } from "react"

interface ProgressBarProps {
  status: string
  startTime: string
  tipoAtendimento?: string
}

export function ProgressBar({ status, startTime, tipoAtendimento = "delivery" }: ProgressBarProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Calcular o progresso com base no status e no tempo decorrido
    const calcularProgresso = () => {
      if (!startTime) return 0

      const start = new Date(startTime).getTime()
      const now = Date.now()
      const elapsed = now - start

      // Tempos para cada estágio (em milissegundos)
      const pendingTime = 60 * 1000 // 1 minuto para pendente
      const preparingTime = 4 * 60 * 1000 // 4 minutos para preparo

      // Tempo de entrega varia conforme o tipo de atendimento
      const deliveryTime =
        tipoAtendimento === "balcao"
          ? 5 * 60 * 1000 // 5 minutos para balcão
          : 30 * 60 * 1000 // 30 minutos para delivery

      // Tempo total estimado para todo o processo
      const totalEstimatedTime = pendingTime + preparingTime + deliveryTime

      // Calcular progresso com base no status atual
      switch (status) {
        case "Pendente":
          // Progresso dentro do estágio "Pendente" (0% a 25%)
          return Math.min(25, (elapsed / pendingTime) * 25)

        case "Em Preparo":
          // Progresso base (25%) + progresso dentro do estágio "Em Preparo" (25% a 50%)
          return 25 + Math.min(25, ((elapsed - pendingTime) / preparingTime) * 25)

        case "Em Entrega":
          // Progresso base (50%) + progresso dentro do estágio "Em Entrega" (50% a 100%)
          return 50 + Math.min(50, ((elapsed - pendingTime - preparingTime) / deliveryTime) * 50)

        case "Concluído":
          return 100

        default:
          return 0
      }
    }

    // Calcular progresso inicial
    setProgress(calcularProgresso())

    // Atualizar progresso a cada segundo
    const timer = setInterval(() => {
      setProgress(calcularProgresso())
    }, 1000)

    return () => clearInterval(timer)
  }, [status, startTime, tipoAtendimento])

  // Determinar a cor da barra de progresso com base no status
  const getProgressBarColor = () => {
    switch (status) {
      case "Pendente":
        return "bg-blue-500"
      case "Em Preparo":
        return "bg-yellow-500"
      case "Em Entrega":
        return "bg-purple-500"
      case "Concluído":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  )
}
