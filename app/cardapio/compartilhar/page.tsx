import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Copy, QrCode, Share2, PhoneIcon as WhatsappIcon, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function CompartilharCardapioPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-4">
          <Link href="/cardapio">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Compartilhar Cardápio</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Link do Cardápio</CardTitle>
            <CardDescription>
              Compartilhe este link com seus clientes para que eles possam acessar seu cardápio digital
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex">
              <Input value="menu.goomer.app/restaurante" readOnly className="rounded-r-none" />
              <Button variant="outline" className="rounded-l-none border-l-0">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>

            <div className="flex flex-col space-y-2">
              <Button variant="outline" className="justify-start">
                <WhatsappIcon className="h-4 w-4 mr-2 text-green-600" />
                Compartilhar via WhatsApp
              </Button>
              <Button variant="outline" className="justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                Outras opções de compartilhamento
              </Button>
              <Button variant="default" className="justify-start" asChild>
                <Link href="/cardapio-digital" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visualizar Cardápio Digital
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
            <CardDescription>Crie um QR Code para seu cardápio digital e coloque-o em sua loja física</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-48 h-48 bg-white border rounded-lg p-4 flex items-center justify-center mb-4">
              <QrCode className="w-full h-full text-gray-800" />
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1">
                Baixar PNG
              </Button>
              <Button variant="outline" className="flex-1">
                Imprimir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personalizar Link</CardTitle>
          <CardDescription>
            Personalize o link do seu cardápio digital para facilitar o acesso dos seus clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">menu.goomer.app/</span>
            <Input placeholder="seu-restaurante" className="max-w-xs" />
          </div>
          <Button>Salvar Alterações</Button>
        </CardContent>
      </Card>
    </div>
  )
}
