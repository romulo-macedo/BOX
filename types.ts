export type ViewMode = 'DASHBOARD' | 'TRAINING' | 'CORNERMAN' | 'SETTINGS';

export interface Combo {
  id: string;
  name: string;
  sequence: string[]; // e.g., ["Jab", "Cross", "Hook"]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
}

export interface TrainingStats {
  punchesThrown: number;
  caloriesBurned: number;
  avgSpeed: number; // imaginary unit
  durationSec: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// Stats for the graph
export interface PerformanceData {
  day: string;
  intensity: number;
  accuracy: number;
}
