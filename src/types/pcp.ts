
export interface PCPData {
  id?: string;
  codigo: string;
  descricaoProduto: string;
  maquina: string;
  embalagem: string;
  unCx: number;
  turno1: number;
  turno2: number;
  planoDiarioCx: number;
  cxRespectiva: number;
  pesoLiqUnitKg: number;
  batchReceitaUn: number;
  batchReceitaKg: number;
  classificacao: string;
  kg: number;
  cxs: number;
  ctp1: number;
  kg2: number;
  cx2: number;
  ctp2: number;
  kgtd: number;
  cxstd: number;
  diferencaPrKg: number;
  ctptd: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProdutoData {
  id?: string;
  codigo: string;
  descricao: string;
  maquina: string;
  embalagem: string;
  unCx: number;
  pesoLiqUnitKg: number;
  batchReceitaKg: number;
  classificacao: string;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MetasData {
  id?: string;
  metaDiaria: number;
  metaMensal: number;
  parametrosCtp: {
    fatorConversao: number;
    toleranciaEficiencia: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
