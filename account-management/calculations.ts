
import { Account, CalculatedAccount, Category, PortfolioStats } from './types';

/**
 * Pure function to calculate portfolio-wide maximums
 */
export const calculatePortfolioStats = (accounts: Account[]): PortfolioStats => {
  if (accounts.length === 0) return { arrMax: 0, engagementMax: 0 };

  const stats = accounts.reduce(
    (acc, account) => {
      const engagement = account.loginsPerMonth * account.sessionDuration;
      return {
        arrMax: Math.max(acc.arrMax, account.arr),
        engagementMax: Math.max(acc.engagementMax, engagement),
      };
    },
    { arrMax: 0, engagementMax: 0 }
  );

  return stats;
};

/**
 * Pure function to calculate scores and category for a single account
 */
export const calculateAccountScores = (
  account: Account,
  stats: PortfolioStats
): CalculatedAccount => {
  const engagement = account.loginsPerMonth * account.sessionDuration;
  
  // Scoring logic
  const engagementScore = stats.engagementMax > 0 
    ? (engagement / stats.engagementMax) * 30 
    : 0;
    
  const expansionScore = (account.expansionProbability * 40) / 100;
  const stakeholderScore = (account.stakeholderProbability * 30) / 100;
  
  const volumeScore = stats.arrMax > 0 
    ? (account.arr / stats.arrMax) * 100 
    : 0;
    
  const potentialScore = engagementScore + expansionScore + stakeholderScore;

  // Category logic strictly based on 50/50 quadrant thresholds
  let category: Category;
  if (volumeScore >= 50) {
    category = potentialScore >= 50 ? Category.GROW_SCALE : Category.PROTECT;
  } else {
    category = potentialScore >= 50 ? Category.INCUBATE : Category.MAINTAIN_EXIT;
  }

  return {
    ...account,
    engagement,
    engagementScore,
    expansionScore,
    stakeholderScore,
    volumeScore,
    potentialScore,
    category,
  };
};

/**
 * Category color helper
 */
export const getCategoryColor = (category: Category): string => {
  switch (category) {
    case Category.GROW_SCALE: return '#22c55e'; // Green
    case Category.INCUBATE: return '#3b82f6';   // Blue
    case Category.PROTECT: return '#ef4444';    // Red
    case Category.MAINTAIN_EXIT: return '#94a3b8'; // Grey/Slate
  }
};
