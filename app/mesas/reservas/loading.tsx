export default function Loading() {
  return (
    <div className="container mx-auto py-6 flex flex-col items-center justify-center h-[70vh]">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
      <p className="text-lg text-muted-foreground">Carregando reservas...</p>
    </div>
  )
}
