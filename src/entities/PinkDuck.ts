import { Entity } from './Entity';

export class PinkDuck extends Entity {
  private targetX: number;
  private targetY: number;
  private speed: number = 35;
  private bobPhase: number = Math.random() * Math.PI * 2;
  private isSurprised: boolean = false;
  private surpriseTimer: number = 0;
  private facingRight: boolean = true;
  private waitTimer: number = 0;

  constructor(x: number, y: number) {
    super(x, y, 12);
    this.targetX = x;
    this.targetY = y;
  }

  public update(dt: number, boundsWidth: number, boundsHeight: number): void {
    this.bobPhase += dt * 8;

    if (this.surpriseTimer > 0) {
      this.surpriseTimer -= dt;
      if (this.surpriseTimer <= 0) {
        this.isSurprised = false;
      }
    }

    if (this.waitTimer > 0) {
      this.waitTimer -= dt;
      return;
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 10) {
      // Pick a new random target in the map
      this.targetX = 60 + Math.random() * (boundsWidth - 120);
      this.targetY = 60 + Math.random() * (boundsHeight - 120);
      this.waitTimer = 1.5 + Math.random() * 3; // Pause between waddles
    } else {
      const currentSpeed = this.isSurprised ? this.speed * 2.5 : this.speed;
      this.vx = (dx / dist) * currentSpeed;
      this.vy = (dy / dist) * currentSpeed;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.facingRight = dx > 0;
    }

    // Keep inside bounds
    this.x = Math.max(20, Math.min(boundsWidth - 20, this.x));
    this.y = Math.max(20, Math.min(boundsHeight - 20, this.y));
  }

  public triggerSurprise(): void {
    this.isSurprised = true;
    this.surpriseTimer = 1.2;
    this.waitTimer = 0;
    // Pick immediate flee target
    this.targetX = Math.max(50, Math.min(1200, this.x + (Math.random() - 0.5) * 300));
    this.targetY = Math.max(50, Math.min(670, this.y + (Math.random() - 0.5) * 300));
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    const bobOffset = Math.sin(this.bobPhase) * 2;
    ctx.translate(0, bobOffset);

    if (!this.facingRight) {
      ctx.scale(-1, 1); // Flip horizontally
    }

    // Shadow on snow
    ctx.beginPath();
    ctx.ellipse(0, 8, 10, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(100, 130, 160, 0.3)';
    ctx.fill();

    // Duck Body (Pink!)
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f472b6'; // Bright Pink
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#db2777';
    ctx.stroke();

    // Duck Head
    ctx.beginPath();
    ctx.arc(6, -6, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#fb7185'; // Soft Pink Head
    ctx.fill();
    ctx.stroke();

    // Duck Beak (Orange)
    ctx.beginPath();
    ctx.ellipse(12, -5, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fb923c'; // Orange Beak
    ctx.fill();
    ctx.stroke();

    // Duck Eye
    ctx.beginPath();
    ctx.arc(8, -8, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Eye surprise dot highlight
    if (this.isSurprised) {
      ctx.beginPath();
      ctx.arc(8, -9, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Surprise exclamations
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('!', 4, -16);
    }

    // Little Wing
    ctx.beginPath();
    ctx.ellipse(-3, 0, 5, 3.5, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();

    ctx.restore();
  }
}
