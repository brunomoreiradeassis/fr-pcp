
import React, { useState } from 'react';
import { Clock, Database, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ExcelImporter from '@/components/ExcelImporter';
import { usePCPData } from '@/hooks/usePCPData';
import { usePCPCalculations } from '@/hooks/usePCPCalculations';
import { PCPData } from '@/types/pcp';

const SegundoTurno: React.FC = () => {
  const { pcpData, addPCPData, updatePCPData } = usePCPData();
  const { processFullCalculations } = usePCPCalculations();
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [divergencias, setDivergencias] = useState<string[]>([]);

  const turno2Data = pcpData.filter(item => item.turno2 > 0);
  const comparativeData = pcpData.filter(item => item.turno1 > 0 && item.turno2 > 0);

  const expectedColumns = [
    'CÓDIGO', 'DESCRIÇÃO PRODUTO', 'MÁQUINA', 'EMBALAGEM', 
    'UN/CX', '2 TURNO', 'PESO LIQ UNIT KG', 'BATCH RECEITA KG',
    'CLASSIFICAÇÃO', 'KG2', 'CX2'
  ];

  const handleDataImported = async (data: any[]) => {
    console.log('Processando dados do 2° turno:', data);
    const newDivergencias: string[] = [];

    for (const row of data) {
      try {
        const codigo = String(row['CÓDIGO'] || row['CODIGO'] || '');
        
        // Verificar se existe dados do 1° turno
        const existingItem = pcpData.find(item => item.codigo === codigo);
        
        if (!existingItem || existingItem.turno1 === 0) {
          newDivergencias.push(`Produto ${codigo}: Sem dados do 1° turno`);
        }

        const pcpItem: Partial<PCPData> = {
          codigo,
          descricaoProduto: String(row['DESCRIÇÃO PRODUTO'] || row['DESCRICAO PRODUTO'] || ''),
          maquina: String(row['MÁQUINA'] || row['MAQUINA'] || ''),
          embalagem: String(row['EMBALAGEM'] || ''),
          unCx: Number(row['UN/CX'] || row['UN_CX'] || 0),
          turno1: existingItem?.turno1 || 0,
          turno2: Number(row['2 TURNO'] || row['TURNO2'] || 0),
          pesoLiqUnitKg: Number(row['PESO LIQ UNIT KG'] || row['PESO_LIQ_UNIT_KG'] || 0),
          batchReceitaKg: Number(row['BATCH RECEITA KG'] || row['BATCH_RECEITA_KG'] || 0),
          classificacao: String(row['CLASSIFICAÇÃO'] || row['CLASSIFICACAO'] || ''),
          kg: existingItem?.kg || 0,
          cxs: existingItem?.cxs || 0,
          kg2: Number(row['KG2'] || row['KG'] || 0),
          cx2: Number(row['CX2'] || row['CXS'] || 0)
        };

        const processedData = processFullCalculations(pcpItem);
        
        if (existingItem) {
          await updatePCPData(existingItem.id!, processedData);
        } else {
          await addPCPData(processedData);
        }
      } catch (error) {
        console.error('Erro ao processar linha:', row, error);
      }
    }
    
    setDivergencias(newDivergencias);
    setLastSync(new Date());
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR');
  };

  const calcularDivergencia = (turno1: number, turno2: number) => {
    const diferenca = Math.abs(turno1 - turno2);
    const media = (turno1 + turno2) / 2;
    return media > 0 ? (diferenca / media) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">2° Turno</h1>
          <p className="text-muted-foreground">Gestão e apontamento do segundo turno</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            <Clock className="w-4 h-4 mr-1" />
            2° Turno
          </Badge>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Última sincronização</p>
            <p className="text-sm font-medium">{formatDateTime(lastSync)}</p>
          </div>
        </div>
      </div>

      {/* Alertas de divergência */}
      {divergencias.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Divergências detectadas:</p>
              {divergencias.slice(0, 3).map((div, index) => (
                <p key={index} className="text-sm">• {div}</p>
              ))}
              {divergencias.length > 3 && (
                <p className="text-sm">... e mais {divergencias.length - 3} divergências</p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Importação</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="comparison">Comparativo</TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <ExcelImporter
            onDataImported={handleDataImported}
            expectedColumns={expectedColumns}
            turno={2}
            className="w-full"
          />
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{turno2Data.length}</div>
                <p className="text-xs text-muted-foreground">
                  produtos no 2° turno
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total KG</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {turno2Data.reduce((sum, item) => sum + item.kg2, 0).toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground">
                  produzidos no turno
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiência Média</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {turno2Data.length > 0 
                    ? (turno2Data.reduce((sum, item) => sum + item.ctp2, 0) / turno2Data.length).toFixed(1)
                    : '0.0'
                  }%
                </div>
                <p className="text-xs text-muted-foreground">
                  CTP2 médio
                </p>
              </CardContent>
            </Card>
          </div>

          {turno2Data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dados do 2° Turno</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Máquina</TableHead>
                        <TableHead>Meta (KG)</TableHead>
                        <TableHead>Produzido (KG)</TableHead>
                        <TableHead>CXS</TableHead>
                        <TableHead>CTP2 (%)</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {turno2Data.slice(0, 10).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono">{item.codigo}</TableCell>
                          <TableCell>{item.descricaoProduto}</TableCell>
                          <TableCell>{item.maquina}</TableCell>
                          <TableCell>{item.turno2.toLocaleString('pt-BR')}</TableCell>
                          <TableCell>{item.kg2.toLocaleString('pt-BR')}</TableCell>
                          <TableCell>{item.cx2.toLocaleString('pt-BR')}</TableCell>
                          <TableCell>
                            <Badge variant={item.ctp2 >= 100 ? "default" : item.ctp2 >= 80 ? "secondary" : "destructive"}>
                              {item.ctp2.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.kg2 >= item.turno2 ? "default" : "destructive"}>
                              {item.kg2 >= item.turno2 ? "Meta atingida" : "Abaixo da meta"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo 1° vs 2° Turno</CardTitle>
            </CardHeader>
            <CardContent>
              {comparativeData.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>1° Turno (KG)</TableHead>
                        <TableHead>2° Turno (KG)</TableHead>
                        <TableHead>Diferença</TableHead>
                        <TableHead>Divergência %</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparativeData.map((item) => {
                        const diferenca = item.kg2 - item.kg;
                        const divergencia = calcularDivergencia(item.kg, item.kg2);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono">{item.codigo}</TableCell>
                            <TableCell>{item.descricaoProduto}</TableCell>
                            <TableCell>{item.kg.toLocaleString('pt-BR')}</TableCell>
                            <TableCell>{item.kg2.toLocaleString('pt-BR')}</TableCell>
                            <TableCell>
                              <span className={diferenca >= 0 ? "text-green-600" : "text-red-600"}>
                                {diferenca >= 0 ? '+' : ''}{diferenca.toLocaleString('pt-BR')}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={divergencia < 10 ? "default" : divergencia < 25 ? "secondary" : "destructive"}>
                                {divergencia.toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={divergencia < 10 ? "default" : "destructive"}>
                                {divergencia < 10 ? "Normal" : "Atenção"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dado comparativo disponível. Importe dados de ambos os turnos.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SegundoTurno;
