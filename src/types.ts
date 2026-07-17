/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GeometryType {
  BEAM = 'Beam',
  PLATE = 'Plate',
  CYLINDER = 'Cylinder',
}

export enum DefectType {
  CRACK = 'Crack',
  VOID = 'Void',
  THINNING = 'Thinning',
  SCRATCH = 'Scratch',
}

export interface Material {
  id: string;
  name: string;
  elasticModulus: number; // GPa
  tensileStrength: number; // MPa
  fatigueLimit: number; // MPa
  snSlope: number; // For S-N curve approximation
}

export interface LoadCondition {
  type: 'Tension' | 'Compression' | 'Bending' | 'Torsion';
  value: number; // MPa (Stress)
  cyclesPerDay: number;
}

export interface Defect {
  type: DefectType;
  x: number;
  y: number;
  z: number;
  length: number;
  width: number;
  depth: number;
}

export interface AnalysisReport {
  id: string;
  createdAt: string;
  projectName: string;
  geometry: GeometryType;
  material: Material;
  load: LoadCondition;
  defect: Defect;
  stressConcentrationFactor: number; // Kt
  peakStress: number; // MPa
  remainingLifeCycles: number;
  remainingLifeDays: number;
  status: 'Use-as-is' | 'Repair' | 'Reject';
}
