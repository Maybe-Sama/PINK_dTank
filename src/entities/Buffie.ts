import { Entity } from './Entity';
import { BuffType } from '../types';

export class Buffie extends Entity {
  public buffType: BuffType;
  public lifetimeTimer: number = 12; // 12s despawn timer
  public pulsePhase: number = Math.random() * Math.PI * 2;

  constructor(x: number, y: number, type: BuffType) {
    super(x, y, 14);
    this.buffType = type;
  }

  public update(dt: number): void {
    this.lifetimeTimer -= dt;
    this.pulsePhase += dt * 4;

    if (this.lifetimeTimer <= 0) {
      this.active = false;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    const pulseScale = 1 + Math.sin(this.pulsePhase) * 0.12;
    ctx.scale(pulseScale, pulseScale);

    let color = '#3b82f6';
    let iconStr = '⚡';

    switch (this.buffType) {
      case BuffType.SPEED:
        color = '#06b6d4'; // Cyan Speed
        iconStr = '⚡';
        break;
      case BuffType.DAMAGE:
        color = '#ef4444'; // Red Damage
        iconStr = '💥';
        break;
      case BuffType.CADENCE:
        color = '#eab308'; // Yellow Cadence
        iconStr = '🔫';
        break;
      case BuffType.HEAL:
        color = '#22c55e'; // Green Heal
        iconStr = '❤️';
        break;
    }

    // Outer glowing ring
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Inner icon text
    ctx.shadowBlur = 0;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(iconStr, 0, 1);

    ctx.restore();
  }
}
