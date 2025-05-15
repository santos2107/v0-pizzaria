import { Loader2 } from "lucide-react"

export default function DetalhesReservaLoading() {
  return (
    <div className="container mx-auto py-6 flex flex-col items-center justify-center h-[70vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Carregando detalhes da reserva...</p>
    </div>
  )
}
