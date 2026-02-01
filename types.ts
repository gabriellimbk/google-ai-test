
export interface Salt {
  id: string;
  name: string;
  formula: string;
  ksp: number;
  cations: string;
  anions: string;
  cationCharge: number;
  anionCharge: number;
  stoichiometry: [number, number]; // [cations, anions]
  color: string;
}

export interface SimulationState {
  selectedSalt: Salt;
  volumeL: number; // Liters
  addedMassMg: number; // Milligrams
  commonIonCation: number; // Molarity
  commonIonAnion: number; // Molarity
}

export interface CalculationResult {
  dissolvedMoles: number;
  precipitatedMoles: number;
  cationConc: number;
  anionConc: number;
  qsp: number;
  isSaturated: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
