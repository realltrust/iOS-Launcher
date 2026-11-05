export type Role = 'learner' | 'teacher' | 'admin';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface UserRecord {
  id: string;
  username: string;
  salt: string;
  hash: string;
  role: Role;
  createdAt: number;
  settings: { theme: 'light' | 'dark' };
  teacherId?: string;
}

export interface TypingStats {
  wpm: number;
  netWpm: number;
  cpm: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  backspaces: number;
  keystrokes: number;
  elapsedMs: number;
  progress: number;
  consistency: number;
}

export interface TypingResult {
  id: string;
  userId: string;
  kind: 'lesson' | 'test' | 'game';
  refId: string;
  date: number;
  stats: TypingStats;
  meta?: Record<string, unknown>;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  bestWpm: number;
  bestAccuracy: number;
  attempts: number;
  lastAt: number;
}

export interface LessonDef {
  id: string;
  level: Level;
  title: string;
  description: string;
  focusKeys: string[];
  generate: () => string;
  minWpm?: number;
  minAccuracy?: number;
}
