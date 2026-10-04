import { Tank } from './Tank';
import { Projectile } from './Projectile';
import { ActiveBuff, BuffType, PlayerStatsConfig } from '../types';

export class PlayerTank extends Tank {
  private activeBuffs: Map<BuffType, ActiveBuff> = new Map();
  private baseConfig: PlayerStatsConfig;

  constructor(x: number, y: number, config?: Partial<PlayerStatsConfig>) {
    const defaultConfig: PlayerStatsConfig = {
      initialHp: 100,
      damage: 20,
      speed: 200,
      cadence: 0.5, // 0.5 seconds between shots
      projectileSpeed: 500,
      size: 22
    };

    const finalConfig = { ...defaultConfig, ...config };
    super(x, y, finalConfig.size, finalConfig.initialHp, '#3b82f6'); // Cool icy blue tank player

    this.baseConfig = finalConfig;
  }

  // Getters for stats influenced by active buffies
  public getEffectiveSpeed(): number {
    let bonusRatio = 0;
    const buff = this.activeBuffs.get(BuffType.SPEED);
    if (buff) {
      // Speed buff: +15%, capped at max +30%
      bonusRatio = Math.min(0.30, buff.value);
    }
    return this.baseConfig.speed * (1 + bonusRatio);
  }

  public getEffectiveDamage(): number {
    let bonusRatio = 0;
    const buff = this.activeBuffs.get(BuffType.DAMAGE);
    if (buff) {
      // Damage buff: +20%, capped at max +40%
      bonusRatio = Math.min(0.40, buff.value);
    }
    return this.baseConfig.damage * (1 + bonusRatio);
  }

  public getEffectiveCadence(): number {
    let reductionRatio = 0;
    const buff = this.activeBuffs.get(BuffType.CADENCE);
    if (buff) {
      // Cadence buff: +15% faster firing, capped at max +30% faster (reduces cooldown)
      reductionRatio = Math.min(0.30, buff.value);
    }
    return this.baseConfig.cadence * (1 - reductionRatio);
  }

  public applyBuff(type: BuffType): void {
    if (type === BuffType.HEAL) {
      // Instant heal +15 HP, max 100
      this.hp = Math.min(this.maxHp, this.hp + 15);
      return;
    }

    const duration = 8; // 8 seconds duration
    const existing = this.activeBuffs.get(type);

    let stepValue = 0.15;
    if (type === BuffType.DAMAGE) stepValue = 0.20;

    let newValue = stepValue;
    if (existing) {
      newValue += existing.value;
    }

    // Apply cap limits
    if (type === BuffType.SPEED) newValue = Math.min(0.30, newValue);
    if (type === BuffType.DAMAGE) newValue = Math.min(0.40, newValue);
    if (type === BuffType.CADENCE) newValue = Math.min(0.30, newValue);

    this.activeBuffs.set(type, {
      type,
      remainingTime: duration,
      duration,
      value: newValue
    });
  }

  public getActiveBuffsList(): ActiveBuff[] {
    return Array.from(this.activeBuffs.values());
  }

  public update(dt: number, boundsWidth: number, boundsHeight: number, inputVec?: { x: number; y: number }, mousePos?: { x: number; y: number }): void {
    this.updateTimers(dt);

    // Update active buff timers
    for (const [type, buff] of Array.from(this.activeBuffs.entries())) {
      buff.remainingTime -= dt;
      if (buff.remainingTime <= 0) {
        this.activeBuffs.delete(type);
      }
    }

    // Process Movement (WASD)
    if (inputVec && (inputVec.x !== 0 || inputVec.y !== 0)) {
      const speed = this.getEffectiveSpeed();
      this.x += inputVec.x * speed * dt;
      this.y += inputVec.y * speed * dt;

      // Calculate chassis rotation smoothly
      const targetBodyAngle = Math.atan2(inputVec.y, inputVec.x);
      this.bodyAngle = targetBodyAngle;
    }

    // Process Turret Aiming (Mouse)
    if (mousePos) {
      const dx = mousePos.x - this.x;
      const dy = mousePos.y - this.y;
      this.turretAngle = Math.atan2(dy, dx);
    }

    // Screen Bounds Clamping
    this.x = Math.max(this.radius, Math.min(boundsWidth - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(boundsHeight - this.radius, this.y));
  }

  public tryShoot(): Projectile | null {
    if (this.fireCooldownTimer <= 0) {
      this.fireCooldownTimer = this.getEffectiveCadence();

      const barrelLength = this.radius * 1.5;
      const muzzleX = this.x + Math.cos(this.turretAngle) * barrelLength;
      const muzzleY = this.y + Math.sin(this.turretAngle) * barrelLength;

      return new Projectile(
        muzzleX,
        muzzleY,
        this.turretAngle,
        this.baseConfig.projectileSpeed,
        this.getEffectiveDamage(),
        'PLAYER'
      );
    }
    return null;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Player color theme: Blue chassis with bright cyan turret accent
    this.drawTankBase(ctx, '#2563eb', '#38bdf8');
  }

  public resetPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.hp = this.maxHp;
    this.active = true;
    this.activeBuffs.clear();
    this.fireCooldownTimer = 0;
  }
}
