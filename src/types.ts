export type UpscCategory = 'Polity & Governance' | 'Economy & Development' | 'Environment & Ecology' | 'International Relations' | 'Science & Technology' | 'General Studies';

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed index of correct option
  explanation: string;
}

export interface ArticleAnalysis {
  id: string;
  url: string;
  title: string;
  source: string;
  scrapedContent?: string;
  summary: string[]; // Strict 5-point summary
  category: UpscCategory;
  keywords: string[];
  mcq: MCQ;
  revisionSheet: string; // Markdown or detailed text notes
  createdAt: string;
  userId?: string;
  isBookmarked?: boolean;
}

export interface UserStats {
  scannedCount: number;
  solvedCount: number;
  correctCount: number;
  currentStreak: number;
  lastActive: string | null;
}
