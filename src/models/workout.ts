export interface Exercise {
  id: string;
  name: string;
  type: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight';
  primaryMuscle: string;
  secondaryMuscles?: string[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: string[]; // exercise IDs
}

export interface WorkoutSet {
  kg: number;
  reps: number;
  timestamp: number;
  exerciseId: string;
}

export interface WorkoutEntry {
  id: string;
  templateId: string;
  date: string;
  sets: WorkoutSet[];
}
