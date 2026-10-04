import { EnemyTank } from '../entities/EnemyTank';
import { EnemyType, RoundConfig } from '../types';

export class WaveManager {
  public currentRound: number = 1;
  public roundTimeRemaining: number = 15;
  public roundTotalDuration: number = 15;
  public enemiesRemainingToSpawn: number = 3;
  public spawnTimer: number = 0;
  public spawnInterval: number = 2.0; // seconds between enemy spawns
  public isRoundComplete: boolean = false;

  public static getRoundConfig(round: number): RoundConfig {
    // Exact specs from design document table #15
    const roundTable: { [key: number]: { duration: number; count: number } } = {
      1: { duration: 15, count: 3 },
      2: { duration: 20, count: 5 },
      3: { duration: 25, count: 7 },
      4: { duration: 30, count: 9 },
      5: { duration: 35, count: 12 },
      6: { duration: 40, count: 14 },
      7: { duration: 45, count: 16 },
      8: { duration: 50, count: 18 },
      9: { duration: 55, count: 20 },
      10: { duration: 60, count: 23 }
    };

    let duration = 60;
    let totalEnemies = 25;

    if (roundTable[round]) {
      duration = roundTable[round].duration;
      totalEnemies = roundTable[round].count;
    } else {
      // Round 11+: Formula Dificultad = 1 + (Round - 1) * 0.15
      duration = 60 + (round - 10) * 5;
      const difficultyMultiplier = 1 + (round - 1) * 0.15;
      totalEnemies = Math.floor(23 * difficultyMultiplier * 0.6);
    }

    // Determine enemy composition ratios by round
    let basicRatio = 1.0;
    let fastRatio = 0.0;
    let heavyRatio = 0.0;

    if (round === 2) {
      basicRatio = 0.9;
      fastRatio = 0.1;
    } else if (round === 3) {
      basicRatio = 0.7;
      fastRatio = 0.3;
    } else if (round === 4) {
      basicRatio = 0.6;
      fastRatio = 0.25;
      heavyRatio = 0.15;
    } else if (round >= 5) {
      basicRatio = Math.max(0.35, 0.6 - (round - 5) * 0.03);
      fastRatio = Math.min(0.40, 0.25 + (round - 5) * 0.02);
      heavyRatio = Math.min(0.35, 0.15 + (round - 5) * 0.02);
    }

    return {
      roundNumber: round,
      duration,
      totalEnemies,
      basicRatio,
      fastRatio,
      heavyRatio
    };
  }

  public startRound(round: number): void {
    this.currentRound = round;
    const config = WaveManager.getRoundConfig(round);
    this.roundTotalDuration = config.duration;
    this.roundTimeRemaining = config.duration;
    this.enemiesRemainingToSpawn = config.totalEnemies;
    this.spawnInterval = Math.max(0.6, config.duration / (config.totalEnemies * 0.75));
    this.spawnTimer = 0.5; // Quick initial spawn
    this.isRoundComplete = false;
  }

  public getDifficultyMultiplier(): number {
    return 1 + (this.currentRound - 1) * 0.15;
  }

  public update(dt: number, activeEnemyCount: number, playerX: number, playerY: number, width: number, height: number): EnemyTank | null {
    if (this.isRoundComplete) return null;

    // Countdown round timer
    if (this.roundTimeRemaining > 0) {
      this.roundTimeRemaining -= dt;
      if (this.roundTimeRemaining <= 0) {
        this.roundTimeRemaining = 0;
      }
    }

    // Check round victory condition:
    // 1. Time ran out OR 2. All round enemies spawned and destroyed
    if ((this.roundTimeRemaining <= 0) || (this.enemiesRemainingToSpawn === 0 && activeEnemyCount === 0)) {
      this.isRoundComplete = true;
      return null;
    }

    // Process spawning timer
    if (this.enemiesRemainingToSpawn > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.spawnInterval;
        this.enemiesRemainingToSpawn--;
        return this.spawnEnemy(playerX, playerY, width, height);
      }
    }

    return null;
  }

  private spawnEnemy(playerX: number, playerY: number, width: number, height: number): EnemyTank {
    const config = WaveManager.getRoundConfig(this.currentRound);
    
    // Select enemy type based on ratios
    let enemyType = EnemyType.BASIC;
    const roll = Math.random();
    if (roll < config.heavyRatio) {
      enemyType = EnemyType.HEAVY;
    } else if (roll < config.heavyRatio + config.fastRatio) {
      enemyType = EnemyType.FAST;
    }

    // Find spawn location > 250px safe distance from player (per doc section #14)
    const MIN_SAFE_DIST = 250;
    let spawnX = 0;
    let spawnY = 0;
    let attempts = 0;

    do {
      attempts++;
      const side = Math.floor(Math.random() * 4); // 0: Top, 1: Right, 2: Bottom, 3: Left
      if (side === 0) {
        spawnX = Math.random() * width;
        spawnY = 40;
      } else if (side === 1) {
        spawnX = width - 40;
        spawnY = Math.random() * height;
      } else if (side === 2) {
        spawnX = Math.random() * width;
        spawnY = height - 40;
      } else {
        spawnX = 40;
        spawnY = Math.random() * height;
      }

      const distToPlayer = Math.hypot(spawnX - playerX, spawnY - playerY);
      if (distToPlayer >= MIN_SAFE_DIST || attempts > 20) {
        break;
      }
    } while (attempts <= 20);

    const accuracyMultiplier = this.getDifficultyMultiplier();
    return new EnemyTank(spawnX, spawnY, enemyType, accuracyMultiplier);
  }
}
