
import React, { useState, useEffect } from 'react';
import { Clock, Database, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ExcelImporter from '@/components/ExcelImporter';
import { usePCPData } from '@/hooks/usePCPData';
import { usePCPCalculations } from '@/hooks/usePCPCalculations';
import { PCPData } from '@/types/pcp';

const PrimeiroTurno: React.FC = () => {
  const { pcpData, addPCPData, updatePCPData, loading } = usePCPData();
  const { processFullCalculations } = usePCPCalculations();
  const [importedData, setImportedData] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const turno1Data = pcpData.filter(item => item.turno1 > 0);

  const expectedColumns = [
    'CÓDIGO', 'DESCRIÇÃO PRODUTO', 'MÁQUINA', 'EMBALAGEM', 
    'UN/CX', '1 TURNO', 'PESO LIQ UNIT KG', 'BATCH RECEITA KG',
    'CLASSIFICAÇÃO', 'KG', 'CXS'
  ];

  const handleDataImported = async (data: any[]) => {
    console.log('Processando dados do 1° turno:', data);
    setImportedData(data);

    // Processar cada linha e salvar no Firestore
    for (const row of data) {
      try {
        const pcpItem: Partial<PCPData> = {
          codigo: String(row['CÓDIGO'] || row['CODIGO'] || ''),
          descricaoProduto: String(row['DESCRIÇÃO PRODUTO'] || row['DESCRICAO PRODUTO'] || ''),
          maquina: String(row['MÁQUINA'] || row['MAQUINA'] || ''),
          embalagem: String(row['EMBALAGEM'] || ''),
          unCx: Number(row['UN/CX'] || row['UN_CX'] || 0),
          turno1: Number(row['1 TURNO'] || row['TURNO1'] || 0),
          turno2: 0, // Inicialmente zero para o 1° turno
          pesoLiqUnitKg: Number(row['PESO LIQ UNIT KG'] || row['PESO_LIQ_UNIT_KG'] || 0),
          batchReceitaKg: Number(row['BATCH RECEITA KG'] || row['BATCH_RECEITA_KG'] || 0),
          classificacao: String(row['CLASSIFICAÇÃO'] || row['CLASSIFICACAO'] || ''),
          kg: Number(row['KG'] || 0),
          cxs: Number(row['CXS'] || 0),
          kg2: 0,
          cx2: 0
        };

        // Processar cálculos automáticos
        const processedData = processFullCalculations(pcpItem);
        
        // Verificar se já existe um registro com o mesmo código
        const existingItem = pcpData.find(item => item.codigo === processedData.codigo);
        
        if (existingItem) {
          // Atualizar dados do 1° turno mantendo dados do 2° turno
          const updatedData = {
            ...processedData,
            turno2: existingItem.turno2,
            kg2: existingItem.kg2,
            cx2: existingItem.cx2
          };
          const finalData = processFullCalculations(updatedData);
          await updatePCPData(existingItem.id!, finalData);
        } else {
          await addPCPData(processedData);
        }
      } catch (error) {
        console.error('Erro ao processar linha:', row, error);
      }
    }
    
    setLastSync(new Date());
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">1° Turno</h1>
          <p className="text-muted-foreground">Gestão e apontamento do primeiro turno</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="default" className="px-3 py-1">
            <Clock className="w-4 h-4 mr-1" />
            1° Turno
          </Badge>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Última sincronização</p>
            <p className="text-sm font-medium">{formatDateTime(lastSync)}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Importação</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <ExcelImporter
            onDataImported={handleDataImported}
            expectedColumns={expectedColumns}
            turno={1}
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
                <div className="text-2xl font-bold">{turno1Data.length}</div>
                <p className="text-xs text-muted-foreground">
                  produtos no 1° turno
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
                  {turno1Data.reduce((sum, item) => sum + item.kg, 0).toLocaleString('pt-BR')}
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
                  {turno1Data.length > 0 
                    ? (turno1Data.reduce((sum, item) => sum + item.ctp1, 0) / turno1Data.length).toFixed(1)
                    : '0.0'
                  }%
                </div>
                <p className="text-xs text-muted-foreground">
                  CTP1 médio
                </p>
              </CardContent>
            </Card>
          </div>

          {turno1Data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dados do 1° Turno</CardTitle>
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
                        <TableHead>CTP1 (%)</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {turno1Data.slice(0, 10).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono">{item.codigo}</TableCell>
                          <TableCell>{item.descricaoProduto}</TableCell>
                          <TableCell>{item.maquina}</TableCell>
                          <TableCell>{item.turno1.toLocaleString('pt-BR')}</TableCell>
                          <TableCell>{item.kg.toLocaleString('pt-BR')}</TableCell>
                          <TableCell>{item.cxs.toLocaleString('pt-BR')}</TableCell>
                          <TableCell>
                            <Badge variant={item.ctp1 >= 100 ? "default" : item.ctp1 >= 80 ? "secondary" : "destructive"}>
                              {item.ctp1.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.kg >= item.turno1 ? "default" : "destructive"}>
                              {item.kg >= item.turno1 ? "Meta atingida" : "Abaixo da meta"}
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

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Importações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Última importação</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(lastSync)}
                    </p>
                  </div>
                  <Badge variant="default">Sincronizado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrimeiroTurno;
