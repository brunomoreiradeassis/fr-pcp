
import React, { useState, useEffect } from 'react';
import { Calculator, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { usePCPData } from '@/hooks/usePCPData';
import { usePCPCalculations } from '@/hooks/usePCPCalculations';

const Processamento: React.FC = () => {
  const { pcpData, updatePCPData } = usePCPData();
  const { processFullCalculations } = usePCPCalculations();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessing, setLastProcessing] = useState<Date>(new Date());

  // Dados consolidados
  const consolidatedData = pcpData.filter(item => item.turno1 > 0 || item.turno2 > 0);
  const totalItems = consolidatedData.length;
  
  // Métricas totais
  const totals = consolidatedData.reduce((acc, item) => ({
    kgtd: acc.kgtd + item.kgtd,
    cxstd: acc.cxstd + item.cxstd,
    planejadoKg: acc.planejadoKg + item.turno1 + item.turno2,
    diferenca: acc.diferenca + item.diferencaPrKg,
    eficienciaMedia: acc.eficienciaMedia + item.ctptd
  }), {
    kgtd: 0,
    cxstd: 0,
    planejadoKg: 0,
    diferenca: 0,
    eficienciaMedia: 0
  });

  const eficienciaGeral = totalItems > 0 ? totals.eficienciaMedia / totalItems : 0;
  const percentualDiferenca = totals.planejadoKg > 0 ? (totals.diferenca / totals.planejadoKg) * 100 : 0;

  const handleRecalculate = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Iniciando recálculo automático...');
      
      for (const item of pcpData) {
        const recalculatedData = processFullCalculations(item);
        
        // Atualizar apenas se houver diferenças nos cálculos
        const needsUpdate = 
          item.ctp1 !== recalculatedData.ctp1 ||
          item.ctp2 !== recalculatedData.ctp2 ||
          item.ctptd !== recalculatedData.ctptd ||
          item.kgtd !== recalculatedData.kgtd ||
          item.cxstd !== recalculatedData.cxstd ||
          item.diferencaPrKg !== recalculatedData.diferencaPrKg;

        if (needsUpdate && item.id) {
          await updatePCPData(item.id, recalculatedData);
          console.log(`Recalculado item: ${item.codigo}`);
        }
      }
      
      setLastProcessing(new Date());
      console.log('Recálculo concluído!');
    } catch (error) {
      console.error('Erro no recálculo:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-recálculo quando dados mudam
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pcpData.length > 0) {
        handleRecalculate();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [pcpData.length]);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Processamento</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Resultados dos cálculos automáticos</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button 
            onClick={handleRecalculate} 
            disabled={isProcessing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? 'Processando...' : 'Recalcular'}
          </Button>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-muted-foreground">Último processamento</p>
            <p className="text-xs sm:text-sm font-medium">{formatDateTime(lastProcessing)}</p>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Produzido</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{totals.kgtd.toLocaleString('pt-BR')} KG</div>
            <p className="text-xs text-muted-foreground">
              {totals.cxstd.toLocaleString('pt-BR')} caixas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Eficiência Geral</CardTitle>
            <Calculator className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{eficienciaGeral.toFixed(1)}%</div>
            <Progress 
              value={Math.min(eficienciaGeral, 100)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Diferença P/R</CardTitle>
            {totals.diferenca >= 0 ? 
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" /> : 
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
            }
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className={`text-lg sm:text-2xl font-bold ${totals.diferenca >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.diferenca >= 0 ? '+' : ''}{totals.diferenca.toLocaleString('pt-BR')} KG
            </div>
            <p className="text-xs text-muted-foreground">
              {percentualDiferenca >= 0 ? '+' : ''}{percentualDiferenca.toFixed(1)}% da meta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Itens Processados</CardTitle>
            <Calculator className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              produtos em produção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Resultados Processados */}
      {consolidatedData.length > 0 && (
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg">Resultados do Processamento</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Código</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Produto</TableHead>
                    <TableHead className="text-xs sm:text-sm">KGTD</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">CXSTD</TableHead>
                    <TableHead className="text-xs sm:text-sm">CTP1 (%)</TableHead>
                    <TableHead className="text-xs sm:text-sm">CTP2 (%)</TableHead>
                    <TableHead className="text-xs sm:text-sm">CTPTD (%)</TableHead>
                    <TableHead className="text-xs sm:text-sm">Dif. P/R</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consolidatedData.slice(0, 15).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs sm:text-sm">{item.codigo}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell truncate max-w-32">{item.descricaoProduto}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{item.kgtd.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{item.cxstd.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.ctp1 >= 100 ? "default" : item.ctp1 >= 80 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {item.ctp1.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.ctp2 >= 100 ? "default" : item.ctp2 >= 80 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {item.ctp2.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.ctptd >= 100 ? "default" : item.ctptd >= 80 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {item.ctptd.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs sm:text-sm ${item.diferencaPrKg >= 0 ? "text-green-600" : "text-red-600"}`}>
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
      )}
    </div>
  );
};

export default Processamento;
