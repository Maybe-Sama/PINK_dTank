import { Entity } from './Entity';

export type ProjectileOwner = 'PLAYER' | 'ENEMY';

export class Projectile extends Entity {
  public owner: ProjectileOwner;
  public damage: number;
  public speed: number;
  public angle: number;

  constructor(x: number, y: number, angle: number, speed: number, damage: number, owner: ProjectileOwner) {
    super(x, y, owner === 'PLAYER' ? 5 : 6);
    this.angle = angle;
    this.speed = speed;
    this.damage = damage;
    this.owner = owner;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  public update(dt: number, boundsWidth: number, boundsHeight: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Destroy if out of canvas bounds
    if (
      this.x < -20 ||
      this.x > boundsWidth + 20 ||
      this.y < -20 ||
      this.y > boundsHeight + 20
    ) {
      this.active = false;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.owner === 'PLAYER') {
      // Glow effect for Player's Red Energy Shell
      ctx.shadowColor = '#ff2222';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444'; // Bright Red
      ctx.fill();

      // Inner core highlight
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fca5a5';
      ctx.fill();
    } else {
      // Glow effect for Enemy's Yellow/Orange Shell
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b'; // Bright Amber/Yellow
      ctx.fill();

      // Inner core highlight
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
    }

    ctx.restore();
  }
}
