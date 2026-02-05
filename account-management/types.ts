
export interface Account {
  id: string;
  name: string;
  arr: number;
  loginsPerMonth: number;
  sessionDuration: number;
  notes: string;
  expansionProbability: number; // 0-100
  stakeholderProbability: number; // 0-100
  createdAt: number;
}

export enum Category {
  GROW_SCALE = 'Grow & Scale',
  INCUBATE = 'Incubate',
  PROTECT = 'Protect',
  MAINTAIN_EXIT = 'Maintain / Exit',
}

export interface CalculatedAccount extends Account {
  engagement: number;
  engagementScore: number;
  expansionScore: number;
  stakeholderScore: number;
  volumeScore: number;
  potentialScore: number;
  category: Category;
}

export interface PortfolioStats {
  arrMax: number;
  engagementMax: number;
}
