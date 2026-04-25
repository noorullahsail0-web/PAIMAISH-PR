/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CalculationResult {
  id: string;
  timestamp: number;
  label: string;
  shape: 'rectangle' | 'triangle' | 'circle' | 'irregular';
  measurements: Record<string, number>;
  totalSqFt: number;
  units: {
    kanal: number;
    marla: number;
    sqft: number;
  };
}

export const UNIT_FACTORS = {
  SQFT_PER_MARLA: 272.25, // Default
  MARLAS_PER_KANAL: 20,
};

export function calculateRegionalUnits(sqft: number, sqftPerMarla: number) {
  const marla = sqft / sqftPerMarla;
  const kanal = Math.floor(marla / UNIT_FACTORS.MARLAS_PER_KANAL);
  const remainingMarla = marla % UNIT_FACTORS.MARLAS_PER_KANAL;
  const remainingSqFt = (remainingMarla - Math.floor(remainingMarla)) * sqftPerMarla;
  
  return {
    kanal,
    marla: Math.floor(remainingMarla),
    sqft: Math.round(remainingSqFt * 100) / 100,
    totalMarla: Math.round(marla * 1000) / 1000
  };
}
