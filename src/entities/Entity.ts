export abstract class Entity {
  public x: number;
  public y: number;
  public radius: number;
  public active: boolean = true;
  public vx: number = 0;
  public vy: number = 0;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  public abstract update(dt: number, boundsWidth: number, boundsHeight: number): void;
  public abstract render(ctx: CanvasRenderingContext2D): void;

  public collidesWith(other: Entity): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distSq = dx * dx + dy * dy;
    const minDist = this.radius + other.radius;
    return distSq <= minDist * minDist;
  }
}
