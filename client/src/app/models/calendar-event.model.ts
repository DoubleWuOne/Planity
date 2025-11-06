export type Task ={
  id: number;
  title: string;
  description?: string;
  allDayEvent?: boolean;
  date: string;
  startTime?: string;
  endTime?: string;
}
