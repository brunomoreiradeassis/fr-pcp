
import React, { useState } from 'react';
import { Plus, Search, Edit2, History, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePCPData } from '@/hooks/usePCPData';
import { ProdutoData } from '@/types/pcp';

const produtoSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  maquina: z.string().min(1, 'Máquina é obrigatória'),
  embalagem: z.string().min(1, 'Embalagem é obrigatória'),
  unCx: z.number().min(1, 'UN/CX deve ser maior que 0'),
  pesoLiqUnitKg: z.number().min(0.01, 'Peso deve ser maior que 0'),
  batchReceitaKg: z.number().min(0.01, 'Batch receita deve ser maior que 0'),
  classificacao: z.string().min(1, 'Classificação é obrigatória'),
  ativo: z.boolean().default(true)
});

const Produtos: React.FC = () => {
  const { produtos, addProduto } = usePCPData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof produtoSchema>>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      codigo: '',
      descricao: '',
      maquina: '',
      embalagem: '',
      unCx: 1,
      pesoLiqUnitKg: 0,
      batchReceitaKg: 0,
      classificacao: '',
      ativo: true
    }
  });

  const filteredProdutos = produtos.filter(produto => 
    produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.maquina.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: z.infer<typeof produtoSchema>) => {
    try {
      await addProduto(data as Omit<ProdutoData, 'id'>);
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
    }
  };

  const maquinas = [...new Set(produtos.map(p => p.maquina))].filter(Boolean);
  const embalagens = [...new Set(produtos.map(p => p.embalagem))].filter(Boolean);
  const classificacoes = [...new Set(produtos.map(p => p.classificacao))].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Produtos</h1>
          <p className="text-muted-foreground">Cadastro e gestão de produtos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Produto</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: PR001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="classificacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classificação</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar classificação" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">Classe A</SelectItem>
                            <SelectItem value="B">Classe B</SelectItem>
                            <SelectItem value="C">Classe C</SelectItem>
                            {classificacoes.map(classif => (
                              <SelectItem key={classif} value={classif}>{classif}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Descrição do produto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maquina"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máquina</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar máquina" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="M1">Máquina 1</SelectItem>
                            <SelectItem value="M2">Máquina 2</SelectItem>
                            <SelectItem value="M3">Máquina 3</SelectItem>
                            {maquinas.map(maq => (
                              <SelectItem key={maq} value={maq}>{maq}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="embalagem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Embalagem</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar embalagem" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Caixa 10kg">Caixa 10kg</SelectItem>
                            <SelectItem value="Caixa 20kg">Caixa 20kg</SelectItem>
                            <SelectItem value="Saco 25kg">Saco 25kg</SelectItem>
                            {embalagens.map(emb => (
                              <SelectItem key={emb} value={emb}>{emb}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="unCx"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UN/CX</FormLabel>
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
                    name="pesoLiqUnitKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso Unit. (KG)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.001"
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
                    name="batchReceitaKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch Receita (KG)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.001"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Produto Ativo</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Produto disponível para produção
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Cadastrar</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por código, descrição ou máquina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-4">
          <Card>
            <CardContent className="flex items-center gap-2 py-3 px-4">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{produtos.length}</p>
                <p className="text-xs text-muted-foreground">Total produtos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-2 py-3 px-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">{produtos.filter(p => p.ativo).length}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Máquina</TableHead>
                  <TableHead>Embalagem</TableHead>
                  <TableHead>UN/CX</TableHead>
                  <TableHead>Peso Unit.</TableHead>
                  <TableHead>Batch Receita</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-mono">{produto.codigo}</TableCell>
                    <TableCell>{produto.descricao}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{produto.maquina}</Badge>
                    </TableCell>
                    <TableCell>{produto.embalagem}</TableCell>
                    <TableCell>{produto.unCx || 0}</TableCell>
                    <TableCell>{(produto.pesoLiqUnitKg || 0).toFixed(3)} kg</TableCell>
                    <TableCell>{(produto.batchReceitaKg || 0).toFixed(1)} kg</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          produto.classificacao === 'A' ? 'default' : 
                          produto.classificacao === 'B' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {produto.classificacao}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={produto.ativo ? "default" : "secondary"}>
                        {produto.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <History className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Produtos;
