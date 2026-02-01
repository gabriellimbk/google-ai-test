
import { Salt } from './types';

export const SALTS: Salt[] = [
  {
    id: 'agcl',
    name: 'Silver Chloride',
    formula: 'AgCl',
    ksp: 1.77e-10,
    cations: 'Ag+',
    anions: 'Cl-',
    cationCharge: 1,
    anionCharge: -1,
    stoichiometry: [1, 1],
    color: '#E2E8F0' // White-ish
  },
  {
    id: 'pbi2',
    name: 'Lead(II) Iodide',
    formula: 'PbI2',
    ksp: 7.1e-9,
    cations: 'Pb2+',
    anions: 'I-',
    cationCharge: 2,
    anionCharge: -1,
    stoichiometry: [1, 2],
    color: '#FDE047' // Yellow
  },
  {
    id: 'baso4',
    name: 'Barium Sulfate',
    formula: 'BaSO4',
    ksp: 1.1e-10,
    cations: 'Ba2+',
    anions: 'SO4 2-',
    cationCharge: 2,
    anionCharge: -2,
    stoichiometry: [1, 1],
    color: '#F1F5F9'
  },
  {
    id: 'caco3',
    name: 'Calcium Carbonate',
    formula: 'CaCO3',
    ksp: 3.3e-9,
    cations: 'Ca2+',
    anions: 'CO3 2-',
    cationCharge: 2,
    anionCharge: -2,
    stoichiometry: [1, 1],
    color: '#CBD5E1'
  },
  {
    id: 'mgf2',
    name: 'Magnesium Fluoride',
    formula: 'MgF2',
    ksp: 5.2e-11,
    cations: 'Mg2+',
    anions: 'F-',
    cationCharge: 2,
    anionCharge: -1,
    stoichiometry: [1, 2],
    color: '#F8FAFC'
  }
];

export const MOLAR_MASSES: Record<string, number> = {
  'AgCl': 143.32,
  'PbI2': 461.01,
  'BaSO4': 233.39,
  'CaCO3': 100.09,
  'MgF2': 62.30
};
