import type { TypingResult, LessonProgress } from '../types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: (results: TypingResult[], progress: LessonProgress[]) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-step', title: 'First Step', description: 'Complete your first lesson.', earned: (_r, p) => p.some(x => x.completed) },
  { id: 'twenty', title: 'Getting Serious', description: 'Complete 20 lessons.', earned: (_r, p) => p.filter(x => x.completed).length >= 20 },
  { id: 'wpm30', title: '30 WPM Club', description: 'Reach 30 net WPM.', earned: r => r.some(x => x.stats.netWpm >= 30) },
  { id: 'wpm50', title: '50 WPM Club', description: 'Reach 50 net WPM.', earned: r => r.some(x => x.stats.netWpm >= 50) },
  { id: 'wpm70', title: '70 WPM Club', description: 'Reach 70 net WPM.', earned: r => r.some(x => x.stats.netWpm >= 70) },
  { id: 'accuracy98', title: 'Sharpshooter', description: '98% accuracy in a test.', earned: r => r.some(x => x.kind === 'test' && x.stats.accuracy >= 98) },
  { id: 'ten-results', title: 'Persistent', description: 'Record 10 sessions.', earned: r => r.length >= 10 },
];
