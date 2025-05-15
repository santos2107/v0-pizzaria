import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ReservaNotFound() {
  return (
    <div className="container mx-auto py-6 flex flex-col items-center justify-center h-[70vh]">
      <h1 className="text-3xl font-bold mb-4">Página não encontrada</h1>
      <p className="text-muted-foreground mb-6">A página de reserva que você tentou acessar não existe.</p>
      <Button asChild>
        <Link href="/reservas">Voltar para Reservas</Link>
      </Button>
    </div>
  )
}
