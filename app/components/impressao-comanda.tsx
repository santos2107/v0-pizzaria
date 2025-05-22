"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Printer, AlertCircle } from "lucide-react";
import { loadQZTray, connectQZTray, getPrinters, printComandaDuasVias, disconnectQZTray } from "@/app/utils/qzTrayHelper";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ImpressaoComandaComponent({ pedidoData }) {
  const { toast } = useToast();
  const [isQZReady, setIsQZReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [qzInstallDialogOpen, setQzInstallDialogOpen] = useState(false);

  // Inicializar QZ Tray quando o componente for montado
  useEffect(() => {
    const initQZ = async () => {
      try {
        const loaded = await loadQZTray();
        if (loaded) {
          const connected = await connectQZTray();
          if (connected) {
            setIsQZReady(true);
            const availablePrinters = await getPrinters();
            setPrinters(availablePrinters);
            
            // Selecionar a primeira impressora Bematech disponível, se houver
            const bematechPrinter = availablePrinters.find(p => p.toLowerCase().includes('bematech'));
            if (bematechPrinter) {
              setSelectedPrinter(bematechPrinter);
            } else if (availablePrinters.length > 0) {
              setSelectedPrinter(availablePrinters[0]);
            }
          }
        } else {
          setQzInstallDialogOpen(true);
        }
      } catch (error) {
        console.error("Erro ao inicializar QZ Tray:", error);
        setQzInstallDialogOpen(true);
      }
    };

    initQZ();

    // Desconectar QZ Tray quando o componente for desmontado
    return () => {
      disconnectQZTray();
    };
  }, []);

  // Função para imprimir comanda
  const handlePrintComanda = async () => {
    if (!isQZReady) {
      toast({
        title: "QZ Tray não está pronto",
        description: "Verifique se o QZ Tray está instalado e em execução.",
        variant: "destructive",
      });
      setQzInstallDialogOpen(true);
      return;
    }

    if (!selectedPrinter) {
      toast({
        title: "Nenhuma impressora selecionada",
        description: "Selecione uma impressora para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await printComandaDuasVias(selectedPrinter, pedidoData);
      if (result.success) {
        toast({
          title: "Comanda impressa com sucesso",
          description: "As duas vias da comanda foram enviadas para impressão.",
        });
      } else {
        throw new Error(result.error || "Erro ao imprimir comanda");
      }
    } catch (error) {
      console.error("Erro ao imprimir comanda:", error);
      toast({
        title: "Erro ao imprimir",
        description: error.message || "Não foi possível imprimir a comanda. Verifique a impressora.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para abrir o diálogo de impressão
  const openPrintDialog = () => {
    if (!isQZReady) {
      setQzInstallDialogOpen(true);
      return;
    }
    setShowDialog(true);
  };

  return (
    <>
      <Button 
        onClick={openPrintDialog} 
        variant="outline"
        className="gap-2"
      >
        <Printer className="h-4 w-4" />
        Imprimir Comanda
      </Button>

      {/* Diálogo de impressão */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imprimir Comanda</DialogTitle>
            <DialogDescription>
              Selecione a impressora térmica e imprima a comanda em duas vias.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Impressora</label>
                <Select 
                  value={selectedPrinter} 
                  onValueChange={setSelectedPrinter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma impressora" />
                  </SelectTrigger>
                  <SelectContent>
                    {printers.map((printer) => (
                      <SelectItem key={printer} value={printer}>
                        {printer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Detalhes da Impressão:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Primeira via: Controle de entrega (dados completos)</li>
                  <li>• Segunda via: Cozinha (itens e observações)</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePrintComanda} 
              disabled={isLoading || !selectedPrinter}
            >
              {isLoading ? "Imprimindo..." : "Imprimir Comanda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de instalação do QZ Tray */}
      <Dialog open={qzInstallDialogOpen} onOpenChange={setQzInstallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QZ Tray não detectado</DialogTitle>
            <DialogDescription>
              Para imprimir comandas diretamente na impressora térmica, é necessário instalar o QZ Tray.
            </DialogDescription>
          </DialogHeader>
          
          <Alert variant="warning" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              O QZ Tray é um software gratuito que permite a impressão direta do navegador para impressoras locais.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <p className="text-sm">Siga os passos abaixo para instalar:</p>
            <ol className="text-sm space-y-2 list-decimal pl-4">
              <li>Acesse <a href="https://qz.io/download/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">qz.io/download</a></li>
              <li>Baixe a versão compatível com seu sistema operacional</li>
              <li>Instale o aplicativo seguindo as instruções</li>
              <li>Reinicie seu navegador após a instalação</li>
              <li>Retorne a esta página e tente novamente</li>
            </ol>
          </div>

          <DialogFooter>
            <Button onClick={() => setQzInstallDialogOpen(false)}>
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
