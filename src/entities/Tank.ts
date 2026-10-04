import { Entity } from './Entity';

export abstract class Tank extends Entity {
  public hp: number;
  public maxHp: number;
  public bodyAngle: number = 0; // Chassis rotation in radians
  public turretAngle: number = 0; // Turret rotation in radians
  public fireCooldownTimer: number = 0;
  public hitFlashTimer: number = 0;
  public color: string;

  constructor(x: number, y: number, radius: number, maxHp: number, color: string) {
    super(x, y, radius);
    this.hp = maxHp;
    this.maxHp = maxHp;
    this.color = color;
  }

  public takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.hitFlashTimer = 0.12; // Flash white briefly when hit
    if (this.hp <= 0) {
      this.hp = 0;
      this.active = false;
      return true; // Destroyed
    }
    return false;
  }

  protected updateTimers(dt: number): void {
    if (this.fireCooldownTimer > 0) {
      this.fireCooldownTimer -= dt;
    }
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
    }
  }

  protected drawTankBase(ctx: CanvasRenderingContext2D, baseColor: string, accentColor: string): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Hit flash overlay calculation
    const isFlashing = this.hitFlashTimer > 0;

    // 1. Draw Tracks (Left & Right relative to chassis rotation)
    ctx.save();
    ctx.rotate(this.bodyAngle);
    
    const trackWidth = this.radius * 0.45;
    const trackLength = this.radius * 2.2;

    ctx.fillStyle = isFlashing ? '#ffffff' : '#2b3644';
    // Left Track
    ctx.fillRect(-trackLength / 2, -this.radius * 1.1, trackLength, trackWidth);
    // Right Track
    ctx.fillRect(-trackLength / 2, this.radius * 1.1 - trackWidth, trackLength, trackWidth);

    // Track details (segments)
    ctx.fillStyle = '#1a222d';
    for (let i = -trackLength / 2 + 2; i < trackLength / 2 - 2; i += 6) {
      ctx.fillRect(i, -this.radius * 1.1, 2, trackWidth);
      ctx.fillRect(i, this.radius * 1.1 - trackWidth, 2, trackWidth);
    }

    // 2. Draw Main Body (Chassis)
    ctx.beginPath();
    ctx.fillStyle = isFlashing ? '#ffffff' : baseColor;
    ctx.strokeStyle = '#1a222d';
    ctx.lineWidth = 3;
    ctx.roundRect(-this.radius, -this.radius * 0.8, this.radius * 2, this.radius * 1.6, 6);
    ctx.fill();
    ctx.stroke();

    // Chassis accent lines
    ctx.fillStyle = accentColor;
    ctx.fillRect(-this.radius * 0.7, -this.radius * 0.5, this.radius * 1.4, this.radius * 1);

    ctx.restore(); // Restore chassis rotation

    // 3. Draw Rotating Turret & Barrel
    ctx.save();
    ctx.rotate(this.turretAngle);

    // Barrel
    const barrelWidth = this.radius * 0.35;
    const barrelLength = this.radius * 1.5;

    ctx.fillStyle = isFlashing ? '#ffffff' : '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.fillRect(0, -barrelWidth / 2, barrelLength, barrelWidth);
    ctx.strokeRect(0, -barrelWidth / 2, barrelLength, barrelWidth);

    // Barrel muzzle break
    ctx.fillStyle = isFlashing ? '#ffffff' : '#1e293b';
    ctx.fillRect(barrelLength - 4, -barrelWidth * 0.6, 6, barrelWidth * 1.2);

    // Turret Dome
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = isFlashing ? '#ffffff' : baseColor;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // Turret hatch / detail
    ctx.beginPath();
    ctx.arc(-this.radius * 0.15, 0, this.radius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // Restore turret rotation

    // 4. HP Bar above tank
    if (this.hp < this.maxHp) {
      const barW = this.radius * 2.2;
      const barH = 5;
      const barX = -barW / 2;
      const barY = -this.radius * 1.5 - 6;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      const hpPercent = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(barX, barY, barW * hpPercent, barH);
    }

    ctx.restore();
  }
}
