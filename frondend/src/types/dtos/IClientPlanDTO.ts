export interface IClientPlan {
  id: string;
  name: string;
  startDate: string;
  goal: string;
  workouts: {
    id: string;
    name: string;
    level: string;
    sets: string;
    reps: string;
    rest: string;
  }[];
  diet: {
    id: string;
    name: string;
    description: string;
    calories: number;
    protein: number;
  }[];
  workoutCompletion: number;
  dietAdherence: number;
}