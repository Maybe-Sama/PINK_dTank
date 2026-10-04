import { Tank } from './Tank';
import { Projectile } from './Projectile';
import { EnemyType, EnemyStatsConfig } from '../types';

export class EnemyTank extends Tank {
  public enemyType: EnemyType;
  public stats: EnemyStatsConfig;
  private engagementDistance: number;
  private aimInaccuracy: number; // Inaccuracy angle offset in radians

  constructor(x: number, y: number, enemyType: EnemyType, accuracyMultiplier: number = 1.0) {
    const stats = EnemyTank.getEnemyStats(enemyType);
    let color = '#dc2626'; // Basic red
    if (enemyType === EnemyType.FAST) color = '#f59e0b'; // Amber/Yellow
    if (enemyType === EnemyType.HEAVY) color = '#475569'; // Heavy Dark Slate

    super(x, y, stats.size, stats.hp, color);
    this.enemyType = enemyType;
    this.stats = stats;

    this.engagementDistance = enemyType === EnemyType.HEAVY ? 160 : enemyType === EnemyType.FAST ? 220 : 190;
    // Initial random offset in cadence timer so enemies don't fire synchronously
    this.fireCooldownTimer = Math.random() * stats.cadence;
    
    // Inaccuracy decreases slightly with higher accuracy multiplier
    this.aimInaccuracy = Math.max(0.05, (0.35 / accuracyMultiplier) * (Math.random() > 0.5 ? 1 : -1));
  }

  public static getEnemyStats(type: EnemyType): EnemyStatsConfig {
    switch (type) {
      case EnemyType.BASIC:
        return {
          hp: 40,
          damage: 10,
          speed: 80,
          cadence: 1.5,
          projectileSpeed: 300,
          buffDropChance: 0.10,
          scoreValue: 100,
          size: 20,
          color: '#ef4444' // Red
        };
      case EnemyType.FAST:
        return {
          hp: 25,
          damage: 8,
          speed: 140,
          cadence: 1.8,
          projectileSpeed: 320,
          buffDropChance: 0.08,
          scoreValue: 150,
          size: 17,
          color: '#f59e0b' // Amber
        };
      case EnemyType.HEAVY:
        return {
          hp: 100,
          damage: 20,
          speed: 45,
          cadence: 2.5,
          projectileSpeed: 280,
          buffDropChance: 0.15,
          scoreValue: 300,
          size: 26,
          color: '#334155' // Slate Heavy
        };
    }
  }

  public update(dt: number, boundsWidth: number, boundsHeight: number, playerX?: number, playerY?: number): void {
    this.updateTimers(dt);

    if (playerX === undefined || playerY === undefined) return;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);

    // Target turret rotation towards player (with inaccuracy variation)
    const directAngle = Math.atan2(dy, dx);
    this.turretAngle = directAngle + this.aimInaccuracy * 0.5;

    // Movement AI logic: Move closer if far away, strafe/adjust if close enough
    let moveDx = 0;
    let moveDy = 0;

    if (dist > this.engagementDistance) {
      // Approach player
      moveDx = dx / dist;
      moveDy = dy / dist;
    } else if (dist < this.engagementDistance * 0.7) {
      // Back away slightly if too close
      moveDx = -dx / dist;
      moveDy = -dy / dist;
    } else {
      // Strafe sideways around player
      moveDx = -dy / dist * 0.4;
      moveDy = dx / dist * 0.4;
    }

    if (moveDx !== 0 || moveDy !== 0) {
      this.x += moveDx * this.stats.speed * dt;
      this.y += moveDy * this.stats.speed * dt;
      this.bodyAngle = Math.atan2(moveDy, moveDx);
    }

    // Clamp inside screen bounds with padding
    this.x = Math.max(this.radius + 10, Math.min(boundsWidth - this.radius - 10, this.x));
    this.y = Math.max(this.radius + 10, Math.min(boundsHeight - this.radius - 10, this.y));
  }

  public tryShoot(): Projectile | null {
    if (this.fireCooldownTimer <= 0) {
      this.fireCooldownTimer = this.stats.cadence * (0.9 + Math.random() * 0.2); // Small random variation

      const barrelLength = this.radius * 1.5;
      const muzzleX = this.x + Math.cos(this.turretAngle) * barrelLength;
      const muzzleY = this.y + Math.sin(this.turretAngle) * barrelLength;

      return new Projectile(
        muzzleX,
        muzzleY,
        this.turretAngle,
        this.stats.projectileSpeed,
        this.stats.damage,
        'ENEMY'
      );
    }
    return null;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.enemyType === EnemyType.BASIC) {
      this.drawTankBase(ctx, '#dc2626', '#f87171');
    } else if (this.enemyType === EnemyType.FAST) {
      this.drawTankBase(ctx, '#d97706', '#fbbf24');
    } else {
      // HEAVY
      this.drawTankBase(ctx, '#1e293b', '#64748b');
    }
  }
}
