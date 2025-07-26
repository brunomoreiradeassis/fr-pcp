
import React, { useState } from 'react';
import { Settings, Users, Database, Shield, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePCPData } from '@/hooks/usePCPData';

const metasSchema = z.object({
  metaDiaria: z.number().min(1, 'Meta diária deve ser maior que 0'),
  metaMensal: z.number().min(1, 'Meta mensal deve ser maior que 0'),
  fatorConversao: z.number().min(0.1, 'Fator de conversão inválido'),
  toleranciaEficiencia: z.number().min(1, 'Tolerância deve ser pelo menos 1%')
});

const Sistema: React.FC = () => {
  const { metas, updateMetas } = usePCPData();
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);

  const form = useForm<z.infer<typeof metasSchema>>({
    resolver: zodResolver(metasSchema),
    defaultValues: {
      metaDiaria: metas?.metaDiaria || 1000,
      metaMensal: metas?.metaMensal || 30000,
      fatorConversao: metas?.parametrosCtp?.fatorConversao || 1.0,
      toleranciaEficiencia: metas?.parametrosCtp?.toleranciaEficiencia || 5
    }
  });

  const onSubmit = async (data: z.infer<typeof metasSchema>) => {
    try {
      await updateMetas({
        metaDiaria: data.metaDiaria,
        metaMensal: data.metaMensal,
        parametrosCtp: {
          fatorConversao: data.fatorConversao,
          toleranciaEficiencia: data.toleranciaEficiencia
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar metas:', error);
    }
  };

  const systemLogs = [
    { timestamp: new Date(), user: 'Admin', action: 'Atualização de metas', status: 'success' },
    { timestamp: new Date(), user: 'Operador1', action: 'Importação 1° turno', status: 'success' },
    { timestamp: new Date(), user: 'Supervisor', action: 'Exportação relatório', status: 'info' },
  ];

  const usuarios = [
    { id: 1, nome: 'Administrador', email: 'admin@frpcp.com', role: 'Admin', ativo: true },
    { id: 2, nome: 'Operador 1', email: 'op1@frpcp.com', role: 'Operador', ativo: true },
    { id: 3, nome: 'Supervisor', email: 'sup@frpcp.com', role: 'Supervisor', ativo: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Sistema</h1>
          <p className="text-muted-foreground">Configurações e administração</p>
        </div>
        <Badge variant="default" className="px-3 py-1">
          <Database className="w-4 h-4 mr-1" />
          Online
        </Badge>
      </div>

      <Tabs defaultValue="metas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metas">Metas</TabsTrigger>
          <TabsTrigger value="parametros">Parâmetros</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="personalizacao">Personalização</TabsTrigger>
        </TabsList>

        <TabsContent value="metas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuração de Metas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="metaDiaria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Diária (KG)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaMensal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Mensal (KG)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Parâmetros de Cálculo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fatorConversao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fator de Conversão</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="toleranciaEficiencia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tolerância Eficiência (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit">Salvar Configurações</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parametros" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cálculos CTP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">CTP1 - Eficiência Turno 1</h4>
                  <code className="text-sm">CTP1 = (KG ÷ 1° TURNO) × 100</code>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">CTP2 - Eficiência Turno 2</h4>
                  <code className="text-sm">CTP2 = (KG2 ÷ 2° TURNO) × 100</code>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">CTPTD - Eficiência Total</h4>
                  <code className="text-sm">CTPTD = (KGTD ÷ (1° + 2° TURNO)) × 100</code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">KG → CX</p>
                    <p className="text-sm text-muted-foreground">Peso Líq. Unit. × UN/CX</p>
                  </div>
                  <Badge variant="outline">Automático</Badge>
                </div>

                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Batch Receita</p>
                    <p className="text-sm text-muted-foreground">Total ÷ Batch KG</p>
                  </div>
                  <Badge variant="outline">Configurável</Badge>
                </div>

                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Backup Automático</p>
                    <p className="text-sm text-muted-foreground">Firestore sincronização</p>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Gerenciamento de Usuários</h3>
            <Button>
              <Users className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            usuario.role === 'Admin' ? 'default' : 
                            usuario.role === 'Supervisor' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {usuario.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={usuario.ativo ? "default" : "secondary"}>
                          {usuario.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Editar</Button>
                          <Button size="sm" variant="outline">Permissões</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Logs de Atividades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.status === 'success' ? 'bg-green-500' :
                        log.status === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">Por: {log.user}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{log.timestamp.toLocaleString('pt-BR')}</p>
                      <Badge variant={
                        log.status === 'success' ? 'default' :
                        log.status === 'error' ? 'destructive' :
                        'secondary'
                      }>
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personalizacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Personalização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Tema Escuro</h4>
                  <p className="text-sm text-muted-foreground">Alternar entre tema claro e escuro</p>
                </div>
                <Switch 
                  checked={theme === 'dark'} 
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificações</h4>
                  <p className="text-sm text-muted-foreground">Receber alertas do sistema</p>
                </div>
                <Switch 
                  checked={notifications} 
                  onCheckedChange={setNotifications} 
                />
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Configurações de Layout</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Densidade da Tabela</h5>
                    <select className="w-full p-2 border rounded">
                      <option>Compacta</option>
                      <option>Normal</option>
                      <option>Espaçada</option>
                    </select>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Atualização Automática</h5>
                    <select className="w-full p-2 border rounded">
                      <option>5 segundos</option>
                      <option>10 segundos</option>
                      <option>30 segundos</option>
                      <option>1 minuto</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sistema;
