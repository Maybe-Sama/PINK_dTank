export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  ROUND_CLEAR = 'ROUND_CLEAR',
  GAME_OVER = 'GAME_OVER'
}

export enum EnemyType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  HEAVY = 'HEAVY'
}

export enum BuffType {
  SPEED = 'SPEED',
  DAMAGE = 'DAMAGE',
  CADENCE = 'CADENCE',
  HEAL = 'HEAL'
}

export interface ActiveBuff {
  type: BuffType;
  remainingTime: number; // in seconds
  duration: number; // initial duration in seconds
  value: number; // effect multiplier or bonus value
}

export interface PlayerStatsConfig {
  initialHp: number;
  damage: number;
  speed: number;
  cadence: number; // cooldown in seconds between shots
  projectileSpeed: number;
  size: number;
}

export interface EnemyStatsConfig {
  hp: number;
  damage: number;
  speed: number;
  cadence: number;
  projectileSpeed: number;
  buffDropChance: number; // 0.0 to 1.0
  scoreValue: number;
  size: number;
  color: string;
}

export interface RoundConfig {
  roundNumber: number;
  duration: number; // in seconds
  totalEnemies: number;
  basicRatio: number;
  fastRatio: number;
  heavyRatio: number;
}
