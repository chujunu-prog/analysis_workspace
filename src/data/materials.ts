import { Material } from '../types';

export const MATERIALS: Material[] = [
  {
    id: 'rha-steel',
    name: 'RHA (Rolled Homogeneous Armor)',
    elasticModulus: 210,
    tensileStrength: 1000,
    fatigueLimit: 450,
    snSlope: -0.1,
  },
  {
    id: 'al-7075',
    name: 'Aluminum 7075-T6',
    elasticModulus: 71,
    tensileStrength: 570,
    fatigueLimit: 160,
    snSlope: -0.12,
  },
  {
    id: 'sus-304',
    name: 'Stainless Steel 304',
    elasticModulus: 193,
    tensileStrength: 505,
    fatigueLimit: 240,
    snSlope: -0.08,
  },
];
