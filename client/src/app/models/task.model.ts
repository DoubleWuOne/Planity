export type Task ={
  id: number;
  title: string;
  description: string;
  dueDate?: string;
  isCompleted?: boolean;
  /** Optional color used as card/accent color (hex like #7c3aed) */
  color?: string;
  /** Optional task type (informational) */
  type?: string;
}
