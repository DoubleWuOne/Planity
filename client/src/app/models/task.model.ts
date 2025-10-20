export interface Task {
  id: number;
  title: string;
  description: string;
  date?: string;
  completed?: boolean;
  /** Optional color used as card/accent color (hex like #7c3aed) */
  color?: string;
  /** Optional task type (informational) */
  type?: string;
}
