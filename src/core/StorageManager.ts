export class StorageManager {
  private static readonly HIGH_SCORE_KEY = 'tanques2d_high_score';
  private static readonly BEST_ROUND_KEY = 'tanques2d_best_round';

  public static getHighScore(): number {
    try {
      const val = localStorage.getItem(this.HIGH_SCORE_KEY);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  public static saveHighScore(score: number): boolean {
    const currentHigh = this.getHighScore();
    if (score > currentHigh) {
      try {
        localStorage.setItem(this.HIGH_SCORE_KEY, score.toString());
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  public static getBestRound(): number {
    try {
      const val = localStorage.getItem(this.BEST_ROUND_KEY);
      return val ? parseInt(val, 10) || 1 : 1;
    } catch {
      return 1;
    }
  }

  public static saveBestRound(round: number): boolean {
    const currentBest = this.getBestRound();
    if (round > currentBest) {
      try {
        localStorage.setItem(this.BEST_ROUND_KEY, round.toString());
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}
