import { RoutineCompletion } from "./routine-completion.model";

export type Routine = {
  id: number;
  title: string;
  description?: string | null;
  time?: string | null; // HH:MM
  // optional history of completions (by date)
  completions?: RoutineCompletion[];
}
