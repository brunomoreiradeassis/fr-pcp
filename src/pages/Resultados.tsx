
import React, { useState } from 'react';
import { FileDown, BarChart3, PieChart, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { usePCPData } from '@/hooks/usePCPData';
import * as XLSX from 'xlsx';

const Resultados: React.FC = () => {
  const { pcpData } = usePCPData();
  const [selectedPeriod, setSelectedPeriod] = useState('hoje');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Filtros e agrupamentos
  const filteredData = pcpData.filter(item => {
    // Filtro por categoria
    if (selectedCategory !== 'todos' && item.classificacao !== selectedCategory) {
      return false;
    }
    
    // Filtro por período (simplificado - assumindo dados de hoje)
    return true;
  });

  const categorias = [...new Set(pcpData.map(item => item.classificacao))].filter(Boolean);

  // Dados para gráficos
  const turnoComparison = filteredData.map(item => ({
    codigo: item.codigo,
    turno1: item.kg,
    turno2: item.kg2,
    eficiencia1: item.ctp1,
    eficiencia2: item.ctp2
  })).slice(0, 10);

  const categoryData = categorias.map(categoria => {
    const items = filteredData.filter(item => item.classificacao === categoria);
    return {
      categoria,
      total: items.reduce((sum, item) => sum + item.kgtd, 0),
      items: items.length
    };
  });

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff7f'];

  // Métricas agregadas
  const metricas = {
    totalKg: filteredData.reduce((sum, item) => sum + item.kgtd, 0),
    totalCx: filteredData.reduce((sum, item) => sum + item.cxstd, 0),
    eficienciaMedia: filteredData.length > 0 ? filteredData.reduce((sum, item) => sum + item.ctptd, 0) / filteredData.length : 0,
    metaAtingida: filteredData.filter(item => item.ctptd >= 100).length,
    totalItens: filteredData.length
  };

  const exportToExcel = () => {
    const exportData = filteredData.map(item => ({
      'Código': item.codigo,
      'Descrição': item.descricaoProduto,
      'Máquina': item.maquina,
      'Classificação': item.classificacao,
      '1° Turno (Meta)': item.turno1,
      '2° Turno (Meta)': item.turno2,
      'KG Turno 1': item.kg,
      'KG Turno 2': item.kg2,
      'Total KG': item.kgtd,
      'Total CX': item.cxstd,
      'CTP1 (%)': item.ctp1,
      'CTP2 (%)': item.ctp2,
      'CTPTD (%)': item.ctptd,
      'Diferença P/R': item.diferencaPrKg
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Ajustar larguras das colunas
    const colWidths = [
      { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 12 }
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Resultados PCP');
    XLSX.writeFile(wb, `Resultados_PCP_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Resultados Finais</h1>
          <p className="text-muted-foreground">Relatórios analíticos e exportação</p>
        </div>
        <Button onClick={exportToExcel}>
          <FileDown className="w-4 h-4 mr-2" />
          Exportar Excel
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Filtros e Período
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as categorias</SelectItem>
              {categorias.map(categoria => (
                <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produzido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.totalKg.toLocaleString('pt-BR')} KG</div>
            <p className="text-xs text-muted-foreground">{metricas.totalCx.toLocaleString('pt-BR')} caixas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.eficienciaMedia.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Atingidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.metaAtingida}</div>
            <p className="text-xs text-muted-foreground">
              de {metricas.totalItens} produtos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricas.totalItens > 0 ? ((metricas.metaAtingida / metricas.totalItens) * 100).toFixed(1) : '0.0'}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorias.length}</div>
            <p className="text-xs text-muted-foreground">classificações</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="detailed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="detailed">Detalhado</TabsTrigger>
          <TabsTrigger value="categorical">Categórico</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Resultados Detalhados por Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Total KG</TableHead>
                      <TableHead>Total CX</TableHead>
                      <TableHead>Eficiência</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Diferença P/R</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.codigo}</TableCell>
                        <TableCell>{item.descricaoProduto}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.classificacao}</Badge>
                        </TableCell>
                        <TableCell>{item.kgtd.toLocaleString('pt-BR')}</TableCell>
                        <TableCell>{item.cxstd.toLocaleString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge variant={item.ctptd >= 100 ? "default" : item.ctptd >= 80 ? "secondary" : "destructive"}>
                            {item.ctptd.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.ctptd >= 100 ? "default" : "destructive"}>
                            {item.ctptd >= 100 ? "Meta atingida" : "Abaixo da meta"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={item.diferencaPrKg >= 0 ? "text-green-600" : "text-red-600"}>
                            {item.diferencaPrKg >= 0 ? '+' : ''}{item.diferencaPrKg.toLocaleString('pt-BR')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorical">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Produção por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Produtos</TableHead>
                      <TableHead>Total KG</TableHead>
                      <TableHead>Participação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryData.map((cat, index) => (
                      <TableRow key={cat.categoria}>
                        <TableCell>{cat.categoria}</TableCell>
                        <TableCell>{cat.items}</TableCell>
                        <TableCell>{cat.total.toLocaleString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {metricas.totalKg > 0 ? ((cat.total / metricas.totalKg) * 100).toFixed(1) : '0.0'}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 && (
                  <ChartContainer config={{}} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <RechartsPieChart data={categoryData} cx="50%" cy="50%" outerRadius={80}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Comparativo Turno 1 vs Turno 2
                </CardTitle>
              </CardHeader>
              <CardContent>
                {turnoComparison.length > 0 && (
                  <ChartContainer config={{}} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={turnoComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="codigo" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="turno1" fill="#8884d8" name="1° Turno" />
                        <Bar dataKey="turno2" fill="#82ca9d" name="2° Turno" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Eficiência por Turno
                </CardTitle>
              </CardHeader>
              <CardContent>
                {turnoComparison.length > 0 && (
                  <ChartContainer config={{}} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={turnoComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="codigo" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="eficiencia1" stroke="#8884d8" name="Efic. T1" />
                        <Line type="monotone" dataKey="eficiencia2" stroke="#82ca9d" name="Efic. T2" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resultados;
