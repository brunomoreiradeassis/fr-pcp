import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChartContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from '@/components/ui/chart';
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Dados de exemplo - serão substituídos pelos dados do Firestore
const mockMetrics = {
  totalProducao: 15420,
  eficienciaMedia: 89.2,
  metaDiaria: 16000,
  turno1: 7850,
  turno2: 7570,
  diferenca: -580
};

const mockChartData = {
  producaoPorTurno: [
    { turno: '1º Turno', planejado: 8000, realizado: 7850, meta: 8000 },
    { turno: '2º Turno', planejado: 8000, realizado: 7570, meta: 8000 }
  ],
  evolucaoDiaria: [
    { dia: 'Seg', producao: 15200, meta: 16000 },
    { dia: 'Ter', producao: 15800, meta: 16000 },
    { dia: 'Qua', producao: 14900, meta: 16000 },
    { dia: 'Qui', producao: 16200, meta: 16000 },
    { dia: 'Sex', producao: 15420, meta: 16000 }
  ],
  topProdutos: [
    { produto: 'Produto A', quantidade: 4500 },
    { produto: 'Produto B', quantidade: 3200 },
    { produto: 'Produto C', quantidade: 2800 },
    { produto: 'Produto D', quantidade: 2400 },
    { produto: 'Produto E', quantidade: 2520 }
  ],
  statusVsMetas: [
    { name: 'Atingida', value: 75, color: 'hsl(var(--success))' },
    { name: 'Pendente', value: 25, color: 'hsl(var(--warning))' }
  ]
};

const Dashboard = () => {
  const [periodo, setPeriodo] = useState('hoje');
  const [dadosPCP, setDadosPCP] = useState<any[]>([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());

  // Conectar ao Firestore para dados em tempo real
  useEffect(() => {
    const q = query(
      collection(db, 'PCP'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDadosPCP(dados);
      setUltimaAtualizacao(new Date());
    });

    return () => unsubscribe();
  }, []);

  const MetricCard = ({ title, value, change, icon: Icon, color = "primary" }: any) => (
    <Card className="shadow-card hover:shadow-metric transition-smooth">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <Badge 
            variant={change >= 0 ? "default" : "destructive"} 
            className="mt-1"
          >
            {change >= 0 ? '+' : ''}{change}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Produção</h1>
          <p className="text-muted-foreground">
            Visão geral em tempo real da produção
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mês</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Indicador de última atualização */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Última atualização: {ultimaAtualizacao.toLocaleTimeString()}</span>
        </div>
        <Badge variant="secondary">
          {dadosPCP.length} registros carregados
        </Badge>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Produção Total"
          value={mockMetrics.totalProducao.toLocaleString() + ' kg'}
          change={mockMetrics.diferenca}
          icon={BarChart3}
          color="primary"
        />
        <MetricCard
          title="Eficiência Média"
          value={mockMetrics.eficienciaMedia + '%'}
          change={+2.1}
          icon={TrendingUp}
          color="success"
        />
        <MetricCard
          title="Meta Diária"
          value={mockMetrics.metaDiaria.toLocaleString() + ' kg'}
          icon={Target}
          color="efficiency"
        />
        <MetricCard
          title="Status vs Meta"
          value="96.4%"
          change={-0.6}
          icon={Calendar}
          color="warning"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produção por Turno */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Produção por Turno</CardTitle>
            <CardDescription>Comparativo planejado vs realizado</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData.producaoPorTurno}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="turno" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="planejado" fill="hsl(var(--primary))" name="Planejado" />
                  <Bar dataKey="realizado" fill="hsl(var(--success))" name="Realizado" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Evolução Diária */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Evolução Diária</CardTitle>
            <CardDescription>Tendência da produção semanal</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData.evolucaoDiaria}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="producao" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    name="Produção"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="meta" 
                    stroke="hsl(var(--warning))" 
                    strokeDasharray="5 5"
                    name="Meta"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Produtos */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle>Top Produtos</CardTitle>
            <CardDescription>Produtos mais produzidos hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData.topProdutos} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis dataKey="produto" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="hsl(var(--efficiency))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status vs Metas */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Status vs Metas</CardTitle>
            <CardDescription>Percentual de metas atingidas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockChartData.statusVsMetas}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {mockChartData.statusVsMetas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;