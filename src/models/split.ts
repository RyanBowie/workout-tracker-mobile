export interface SplitInterval {
  duration: number; // seconds
  repeat: number;
}

export interface Split {
  name: string;
  intervals: SplitInterval[];
}
