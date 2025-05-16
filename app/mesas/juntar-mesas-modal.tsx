"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface Mesa {
  id: number;
  numero: string;
  capacidade: number;
  status: string;
}

interface JuntarMesasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mesasDisponiveis: Array<{ id: number; numero: string; capacidade: number }>;
}

const API_KEY = "api_key_pizzaria_kassio_2024"; // Idealmente, isso viria de variáveis de ambiente

export function JuntarMesasModal({
  isOpen,
  onClose,
  onSuccess,
  mesasDisponiveis,
}: JuntarMesasModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mesaPrincipalId, setMesaPrincipalId] = useState<string>("");
  const [mesasSecundariasIds, setMesasSecundariasIds] = useState<string[]>([]);
  // O novo número da mesa combinada será definido pela API ou pode ser sugerido pelo usuário.
  // Por simplicidade, vamos assumir que a API pode lidar com a lógica de numeração
  // ou que o usuário informa um número para a mesa principal que será "expandida".
  // Para este exemplo, vamos focar em enviar a ação de juntar para a API.
  const [error, setError] = useState<string | null>(null);

  // Filtrar mesas secundárias para não incluir a mesa principal
  const mesasSecundariasDisponiveis = mesasDisponiveis.filter(
    (mesa) => mesa.id.toString() !== mesaPrincipalId
  );

  const [capacidadeTotalCalculada, setCapacidadeTotalCalculada] = useState(0);

  useEffect(() => {
    if (!mesaPrincipalId) {
      setCapacidadeTotalCalculada(0);
      return;
    }
    const principal = mesasDisponiveis.find(m => m.id.toString() === mesaPrincipalId);
    let total = principal?.capacidade || 0;
    mesasSecundariasIds.forEach(id => {
      const sec = mesasDisponiveis.find(m => m.id.toString() === id);
      if (sec) total += sec.capacidade;
    });
    setCapacidadeTotalCalculada(total);
  }, [mesaPrincipalId, mesasSecundariasIds, mesasDisponiveis]);


  const handleJuntarMesas = async () => {
    if (!mesaPrincipalId || mesasSecundariasIds.length === 0) {
      setError("Selecione a mesa principal e pelo menos uma mesa secundária.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const idsMesasParaJuntar = [
        parseInt(mesaPrincipalId),
        ...mesasSecundariasIds.map(id => parseInt(id)),
      ];
      
      const mesaPrincipalObj = mesasDisponiveis.find(m => m.id.toString() === mesaPrincipalId);
      if (!mesaPrincipalObj) {
        throw new Error("Mesa principal não encontrada para obter o número.");
      }

      const response = await fetch(`/api/mesas/${mesaPrincipalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          api_key: API_KEY,
        },
        body: JSON.stringify({
          action: "juntar",
          mesasParaJuntar: idsMesasParaJuntar, // Envia todos os IDs, incluindo o principal
          mesaPrincipalNumero: mesaPrincipalObj.numero, // Envia o número da mesa principal para referência no backend
          // O backend pode decidir o novo número ou usar o da principal e atualizar sua capacidade e observações
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erro ao enviar solicitação para juntar mesas"
        );
      }

      toast({
        title: "Mesas combinadas",
        description: `As mesas foram combinadas com sucesso.`,
      });
      onSuccess(); // Chama a função de sucesso para fechar o modal e atualizar a lista de mesas
    } catch (error) {
      console.error("Erro ao juntar mesas:", error);
      setError(
        error instanceof Error ? error.message : "Não foi possível juntar as mesas"
      );
      toast({
        title: "Erro",
        description: "Não foi possível juntar as mesas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMesaSecundaria = (mesaId: string) => {
    setMesasSecundariasIds((prev) =>
      prev.includes(mesaId) ? prev.filter((id) => id !== mesaId) : [...prev, mesaId]
    );
  };

  const getMesaNumero = (id: string) => {
    const mesa = mesasDisponiveis.find((m) => m.id.toString() === id);
    return mesa ? mesa.numero : id;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Juntar Mesas</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="mesaPrincipal">Mesa Principal</Label>
            <Select
              value={mesaPrincipalId}
              onValueChange={(value) => {
                setMesaPrincipalId(value);
                setMesasSecundariasIds((prev) => prev.filter((id) => id !== value));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a mesa principal" />
              </SelectTrigger>
              <SelectContent>
                {mesasDisponiveis.map((mesa) => (
                  <SelectItem key={mesa.id} value={mesa.id.toString()}>
                    Mesa {mesa.numero} (Cap: {mesa.capacidade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mesas Secundárias (para juntar à principal)</Label>
            {mesasSecundariasDisponiveis.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma outra mesa disponível para seleção ou selecione uma mesa principal primeiro.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {mesasSecundariasDisponiveis.map((mesa) => (
                  <Button
                    key={mesa.id}
                    type="button"
                    variant={
                      mesasSecundariasIds.includes(mesa.id.toString())
                        ? "default"
                        : "outline"
                    }
                    className="h-10"
                    onClick={() => handleToggleMesaSecundaria(mesa.id.toString())}
                    disabled={!mesaPrincipalId}
                  >
                    Mesa {mesa.numero}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {(mesaPrincipalId || mesasSecundariasIds.length > 0) && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium mb-2">Mesas selecionadas para combinação:</p>
              <div className="flex flex-wrap gap-2">
                {mesaPrincipalId && (
                    <Badge variant="outline" className="bg-primary/10">
                    Mesa {getMesaNumero(mesaPrincipalId)} (Principal)
                    </Badge>
                )}
                {mesasSecundariasIds.map((id) => (
                  <Badge key={id} variant="outline">
                    Mesa {getMesaNumero(id)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Capacidade Total Estimada</Label>
            <div className="p-3 bg-muted rounded-md font-medium text-center">
              {capacidadeTotalCalculada} pessoas
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleJuntarMesas} disabled={isLoading || !mesaPrincipalId || mesasSecundariasIds.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Junção"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
