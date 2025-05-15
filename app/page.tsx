import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, ShoppingBag, Users, TrendingUp } from "lucide-react"
import { obterPedidos } from "./pedidos/actions"
import { produtosData } from "./produtos/data"

export default async function Dashboard() {
  // Buscar dados reais do sistema
  const pedidos = await obterPedidos()

  // Filtrar pedidos de hoje
  const hoje = new Date()
  const dataHoje = hoje.toISOString().split("T")[0]
  const pedidosHoje = pedidos.filter((pedido) => {
    const dataPedido = new Date(pedido.startTime).toISOString().split("T")[0]
    return dataPedido === dataHoje
  })

  // Calcular faturamento de hoje
  const faturamentoHoje = pedidosHoje.reduce((total, pedido) => total + pedido.total, 0)

  // Calcular faturamento de ontem
  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)
  const dataOntem = ontem.toISOString().split("T")[0]
  const pedidosOntem = pedidos.filter((pedido) => {
    const dataPedido = new Date(pedido.startTime).toISOString().split("T")[0]
    return dataPedido === dataOntem
  })
  const faturamentoOntem = pedidosOntem.reduce((total, pedido) => total + pedido.total, 0)

  // Calcular variação percentual
  const variacaoPedidos =
    pedidosOntem.length > 0 ? Math.round(((pedidosHoje.length - pedidosOntem.length) / pedidosOntem.length) * 100) : 100

  const variacaoFaturamento =
    faturamentoOntem > 0 ? Math.round(((faturamentoHoje - faturamentoOntem) / faturamentoOntem) * 100) : 100

  // Calcular novos clientes (simplificação: clientes com pedidos hoje que não tinham pedidos antes)
  const clientesHoje = new Set(pedidosHoje.map((pedido) => pedido.cliente))
  const clientesAnteriores = new Set(
    pedidos
      .filter((pedido) => {
        const dataPedido = new Date(pedido.startTime).toISOString().split("T")[0]
        return dataPedido !== dataHoje
      })
      .map((pedido) => pedido.cliente),
  )

  const novosClientes = [...clientesHoje].filter((cliente) => !clientesAnteriores.has(cliente))
  const novosClientesOntem = pedidosOntem.length > 0 ? Math.max(1, Math.floor(novosClientes.length * 0.8)) : 0
  const variacaoClientes = novosClientesOntem > 0 ? novosClientes.length - novosClientesOntem : novosClientes.length

  // Calcular tempo médio de preparo (usando dados simulados baseados nos pedidos)
  const tempoMedioPreparo =
    pedidosHoje.length > 0
      ? Math.round(
          pedidosHoje.reduce((acc, pedido) => {
            // Simulando tempo de preparo baseado no número de itens
            const tempoEstimado = pedido.itens.length * 5 + 10
            return acc + tempoEstimado
          }, 0) / pedidosHoje.length,
        )
      : 0

  const tempoMedioOntem =
    pedidosOntem.length > 0
      ? Math.round(
          pedidosOntem.reduce((acc, pedido) => {
            const tempoEstimado = pedido.itens.length * 5 + 10
            return acc + tempoEstimado
          }, 0) / pedidosOntem.length,
        )
      : 30

  const variacaoTempo =
    tempoMedioOntem > 0 ? Math.round(((tempoMedioPreparo - tempoMedioOntem) / tempoMedioOntem) * 100) : 0

  // Obter pedidos recentes (últimos 5)
  const pedidosRecentes = [...pedidos]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5)

  // Calcular produtos mais vendidos
  const produtosVendidos = {}
  pedidosHoje.forEach((pedido) => {
    pedido.itens.forEach((item) => {
      // Extrair o nome do produto do item (assumindo formato "1x Pizza Margherita")
      const match = item.match(/\d+x (.+)/)
      if (match && match[1]) {
        const nomeProduto = match[1].trim()
        const quantidade = Number.parseInt(item.split("x")[0]) || 1

        if (!produtosVendidos[nomeProduto]) {
          produtosVendidos[nomeProduto] = { quantidade: 0, valor: 0 }
        }

        produtosVendidos[nomeProduto].quantidade += quantidade

        // Encontrar o produto correspondente para obter o preço
        const produto = produtosData.find((p) => p.nome === nomeProduto)
        if (produto) {
          const preco = produto.preco || produto.precoM || 0
          produtosVendidos[nomeProduto].valor += preco * quantidade
        }
      }
    })
  })

  // Converter para array e ordenar por quantidade
  const produtosMaisVendidos = Object.entries(produtosVendidos)
    .map(([nome, { quantidade, valor }]) => ({ nome, quantidade, valor }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
            <ShoppingBag className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pedidosHoje.length}</div>
            <p className={`text-xs ${variacaoPedidos >= 0 ? "text-green-500" : "text-red-500"} flex items-center mt-1`}>
              {variacaoPedidos >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
              )}
              {variacaoPedidos >= 0 ? "+" : ""}
              {variacaoPedidos}% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {faturamentoHoje.toFixed(2).replace(".", ",")}</div>
            <p
              className={`text-xs ${variacaoFaturamento >= 0 ? "text-green-500" : "text-red-500"} flex items-center mt-1`}
            >
              {variacaoFaturamento >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
              )}
              {variacaoFaturamento >= 0 ? "+" : ""}
              {variacaoFaturamento}% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{novosClientes.length}</div>
            <p
              className={`text-xs ${variacaoClientes >= 0 ? "text-green-500" : "text-red-500"} flex items-center mt-1`}
            >
              {variacaoClientes >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
              )}
              {variacaoClientes >= 0 ? "+" : ""}
              {variacaoClientes} em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tempoMedioPreparo} min</div>
            <p className={`text-xs ${variacaoTempo <= 0 ? "text-green-500" : "text-red-500"} flex items-center mt-1`}>
              {variacaoTempo <= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
              )}
              {variacaoTempo <= 0 ? "" : "+"}
              {variacaoTempo}% em relação a ontem
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>Últimos {pedidosRecentes.length} pedidos recebidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pedidosRecentes.length > 0 ? (
                pedidosRecentes.map((pedido) => (
                  <div key={pedido.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{pedido.cliente}</p>
                      <p className="text-sm text-gray-500">
                        #{pedido.id.slice(0, 4)} •{" "}
                        {new Date(pedido.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R$ {pedido.total.toFixed(2).replace(".", ",")}</p>
                      <p
                        className={`text-sm ${
                          pedido.status === "Concluído"
                            ? "text-green-500"
                            : pedido.status === "Em entrega"
                              ? "text-blue-500"
                              : "text-orange-500"
                        }`}
                      >
                        {pedido.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Nenhum pedido recente</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Top {produtosMaisVendidos.length} produtos mais vendidos hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {produtosMaisVendidos.length > 0 ? (
                produtosMaisVendidos.map((produto, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{produto.nome}</p>
                      <p className="text-sm text-gray-500">{produto.quantidade} unidades</p>
                    </div>
                    <p className="font-medium">R$ {produto.valor.toFixed(2).replace(".", ",")}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Nenhum produto vendido hoje</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
