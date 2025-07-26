
import { PCPData } from '@/types/pcp';

export const usePCPCalculations = () => {
  const calculateCTP1 = (kg: number, turno1: number): number => {
    if (turno1 === 0) return 0;
    return Math.round((kg / turno1) * 100 * 100) / 100;
  };

  const calculateCTP2 = (kg2: number, turno2: number): number => {
    if (turno2 === 0) return 0;
    return Math.round((kg2 / turno2) * 100 * 100) / 100;
  };

  const calculatePlanoDiarioCx = (turno1: number, turno2: number, pesoLiqUnitKg: number, unCx: number): number => {
    const denominator = pesoLiqUnitKg * unCx;
    if (denominator === 0) return 0;
    return Math.round(((turno1 + turno2) / denominator) * 100) / 100;
  };

  const calculateBatchReceitaUn = (turno1: number, turno2: number, batchReceitaKg: number): number => {
    if (batchReceitaKg === 0) return 0;
    return Math.round(((turno1 + turno2) / batchReceitaKg) * 100) / 100;
  };

  const calculateKGTD = (kg: number, kg2: number): number => {
    return Math.round((kg + kg2) * 100) / 100;
  };

  const calculateCXSTD = (cxs: number, cx2: number): number => {
    return Math.round((cxs + cx2) * 100) / 100;
  };

  const calculateDiferencaPrKg = (kgtd: number, turno1: number, turno2: number): number => {
    return Math.round((kgtd - (turno1 + turno2)) * 100) / 100;
  };

  const calculateCTPTD = (kgtd: number, turno1: number, turno2: number): number => {
    const totalTurnos = turno1 + turno2;
    if (totalTurnos === 0) return 0;
    return Math.round((kgtd / totalTurnos) * 100 * 100) / 100;
  };

  const processFullCalculations = (data: Partial<PCPData>): PCPData => {
    const {
      turno1 = 0,
      turno2 = 0,
      kg = 0,
      kg2 = 0,
      cxs = 0,
      cx2 = 0,
      pesoLiqUnitKg = 0,
      unCx = 0,
      batchReceitaKg = 0,
      ...rest
    } = data;

    const planoDiarioCx = calculatePlanoDiarioCx(turno1, turno2, pesoLiqUnitKg, unCx);
    const batchReceitaUn = calculateBatchReceitaUn(turno1, turno2, batchReceitaKg);
    const ctp1 = calculateCTP1(kg, turno1);
    const ctp2 = calculateCTP2(kg2, turno2);
    const kgtd = calculateKGTD(kg, kg2);
    const cxstd = calculateCXSTD(cxs, cx2);
    const diferencaPrKg = calculateDiferencaPrKg(kgtd, turno1, turno2);
    const ctptd = calculateCTPTD(kgtd, turno1, turno2);

    return {
      turno1,
      turno2,
      kg,
      kg2,
      cxs,
      cx2,
      pesoLiqUnitKg,
      unCx,
      batchReceitaKg,
      planoDiarioCx,
      batchReceitaUn,
      ctp1,
      ctp2,
      kgtd,
      cxstd,
      diferencaPrKg,
      ctptd,
      cxRespectiva: planoDiarioCx,
      ...rest
    } as PCPData;
  };

  return {
    calculateCTP1,
    calculateCTP2,
    calculatePlanoDiarioCx,
    calculateBatchReceitaUn,
    calculateKGTD,
    calculateCXSTD,
    calculateDiferencaPrKg,
    calculateCTPTD,
    processFullCalculations
  };
};
