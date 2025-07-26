import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Target, TrendingUp, Package, Clock, Activity, Gauge, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePCPData } from '@/hooks/usePCPData';

const Dashboard: React.FC = () => {
  const { pcpData, loading } = usePCPData();

  // Calcular métricas do dashboard baseado nos dados reais
  const metrics = useMemo(() => {
    if (!pcpData || pcpData.length === 0) {
      return {
        totalProducao: 0,
        eficienciaMedia: 0,
        metaDiaria: 0,
        produtosProduzidos: 0
      };
    }

    const totalKgTd = pcpData.reduce((sum, item) => sum + (item.kgtd || 0), 0);
    const totalPlanejado = pcpData.reduce((sum, item) => sum + (item.turno1 || 0) + (item.turno2 || 0), 0);
    const eficienciaMedia = totalPlanejado > 0 ? (totalKgTd / totalPlanejado) * 100 : 0;
    
    return {
      totalProducao: totalKgTd,
      eficienciaMedia,
      metaDiaria: totalPlanejado,
      produtosProduzidos: pcpData.length
    };
  }, [pcpData]);

  // Dados para gráfico de barras (eficiência por produto)
  const eficienciaData = useMemo(() => {
    if (!pcpData) return [];
    
    return pcpData.slice(0, 10).map((item) => ({
      produto: item.codigo.slice(0, 8),
      eficiencia: item.ctptd || 0,
      meta: 100
    }));
  }, [pcpData]);

  // Dados para gráfico de linha (produção por turno)
  const producaoTurnoData = useMemo(() => {
    if (!pcpData) return [];
    
    return pcpData.slice(0, 10).map((item) => ({
      produto: item.codigo.slice(0, 8),
      turno1: item.kg || 0,
      turno2: item.kg2 || 0,
      total: (item.kg || 0) + (item.kg2 || 0)
    }));
  }, [pcpData]);

  // Dados para gráfico de pizza (distribuição por classificação)
  const classificacaoData = useMemo(() => {
    if (!pcpData) return [];
    
    const distribuicao = pcpData.reduce((acc, item) => {
      const classe = item.classificacao || 'N/A';
      acc[classe] = (acc[classe] || 0) + (item.kgtd || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribuicao).map(([name, value]) => ({
      name,
      value,
      percentage: metrics.totalProducao > 0 ? ((value / metrics.totalProducao) * 100).toFixed(1) : '0'
    }));
  }, [pcpData, metrics.totalProducao]);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Dashboard PCP</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Painel de controle da produção em tempo real</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center gap-3 p-3 sm:p-4 lg:p-6">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Produção Total</p>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold truncate">{metrics.totalProducao.toFixed(0)} kg</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center gap-3 p-3 sm:p-4 lg:p-6">
            <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg">
              <Gauge className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Eficiência Média</p>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold">{metrics.eficienciaMedia.toFixed(1)}%</p>
              <Badge 
                variant={metrics.eficienciaMedia >= 95 ? "default" : metrics.eficienciaMedia >= 85 ? "secondary" : "destructive"} 
                className="text-xs hidden sm:inline-flex"
              >
                {metrics.eficienciaMedia >= 95 ? "Excelente" : metrics.eficienciaMedia >= 85 ? "Bom" : "Abaixo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center gap-3 p-3 sm:p-4 lg:p-6">
            <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Meta Diária</p>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold truncate">{metrics.metaDiaria.toFixed(0)} kg</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center gap-3 p-3 sm:p-4 lg:p-6">
            <div className="p-2 sm:p-3 bg-orange-500/10 rounded-lg">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Produtos Ativos</p>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold">{metrics.produtosProduzidos}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Gráfico de Eficiência */}
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg">Eficiência por Produto (Top 10)</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="h-48 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eficienciaData} margin={{ top: 5, right: 5, left: 5, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="produto" 
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="eficiencia" fill="#8884d8" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="meta" fill="#e5e7eb" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Produção por Turno */}
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg">Produção por Turno (Top 10)</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="h-48 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={producaoTurnoData} margin={{ top: 5, right: 5, left: 5, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="produto" 
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="turno1" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="turno2" stroke="#82ca9d" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="total" stroke="#ffc658" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Gráfico de Pizza - Distribuição por Classificação */}
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg">Distribuição por Classificação</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="h-48 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classificacaoData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={window.innerWidth < 640 ? 40 : window.innerWidth < 1024 ? 50 : 60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {classificacaoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status dos Produtos */}
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Status da Produção
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3">
              {pcpData?.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">{item.codigo}</p>
                    <p className="text-xs text-muted-foreground truncate hidden sm:block">{item.descricaoProduto}</p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 ml-2">
                    <Badge 
                      variant={
                        (item.ctptd || 0) >= 95 ? "default" : 
                        (item.ctptd || 0) >= 85 ? "secondary" : 
                        "destructive"
                      }
                      className="text-xs"
                    >
                      {(item.ctptd || 0).toFixed(1)}%
                    </Badge>
                    {(item.ctptd || 0) >= 95 ? (
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                    )}
                  </div>
                </div>
              ))}
              {(!pcpData || pcpData.length === 0) && (
                <div className="text-center py-6 sm:py-8">
                  <Package className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-2 sm:mb-4" />
                  <p className="text-sm text-muted-foreground">Nenhum dado de produção encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;