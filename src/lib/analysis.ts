import { GeometryType, DefectType, Material, LoadCondition, Defect } from '../types';

/**
 * Simplified calculation for Stress Concentration Factor (Kt)
 * Based on basic Peterson's formulas for common geometries.
 */
export function calculateKt(geometry: GeometryType, defect: Defect): number {
  let Kt = 1.0;

  switch (defect.type) {
    case DefectType.VOID:
      // Simple spherical/circular void approximation
      Kt = 3.0;
      break;
    case DefectType.CRACK:
      // Crack stress concentration is very high
      // Approximation: 1 + 2 * sqrt(half_length / radius_of_curvature)
      // Here we use a high penalty for cracks
      Kt = 5.0 + (defect.length / 2);
      break;
    case DefectType.THINNING:
      // Thinning increases nominal stress rather than concentration
      Kt = 1.2;
      break;
    case DefectType.SCRATCH:
      Kt = 2.0;
      break;
    default:
      Kt = 1.0;
  }

  // Geometry multipliers (Simplified)
  if (geometry === GeometryType.CYLINDER) Kt *= 1.1;
  
  return parseFloat(Kt.toFixed(2));
}

/**
 * Calculates remaining life cycles using Miner's Rule and Basquin's Equation
 * Basquin: S = A * (N)^b  => N = (S/A)^(1/b)
 */
export function calculateRemainingLife(
  material: Material,
  load: LoadCondition,
  Kt: number
): number {
  const peakStress = load.value * Kt;
  
  // If peak stress is below fatigue limit, infinite life (approximated)
  if (peakStress <= material.fatigueLimit) {
    return 10000000; // 10M cycles placeholder for "Infinite"
  }

  // Basquin parameters approximation
  // At N=1, S = Tensile Strength
  // At N=10^6, S = Fatigue Limit
  const b = (Math.log10(material.fatigueLimit) - Math.log10(material.tensileStrength)) / 6;
  const A = material.tensileStrength;

  // N = (S/A)^(1/b)
  const N = Math.pow(peakStress / A, 1 / b);
  
  return Math.max(0, Math.round(N));
}
