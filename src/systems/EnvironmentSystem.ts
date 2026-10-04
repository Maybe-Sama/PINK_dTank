interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
}

interface SnowyTree {
  x: number;
  y: number;
  scale: number;
}

interface SnowyRock {
  x: number;
  y: number;
  size: number;
}

export class EnvironmentSystem {
  private snowflakes: Snowflake[] = [];
  private trees: SnowyTree[] = [];
  private rocks: SnowyRock[] = [];

  constructor(width: number, height: number) {
    this.initSnowflakes(width, height);
    this.initTerrainProps(width, height);
  }

  private initSnowflakes(width: number, height: number): void {
    const count = 70;
    for (let i = 0; i < count; i++) {
      this.snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1 + Math.random() * 2.5,
        speedY: 20 + Math.random() * 30,
        speedX: -10 + Math.random() * 20,
        opacity: 0.4 + Math.random() * 0.5
      });
    }
  }

  private initTerrainProps(width: number, height: number): void {
    // Pine trees along perimeter and background
    const treePositions = [
      { x: 50, y: 50 }, { x: 120, y: 40 }, { x: width - 60, y: 60 }, { x: width - 130, y: 45 },
      { x: 40, y: height - 50 }, { x: 110, y: height - 60 }, { x: width - 50, y: height - 60 },
      { x: width - 120, y: height - 40 }
    ];

    treePositions.forEach(p => {
      this.trees.push({
        x: p.x,
        y: p.y,
        scale: 0.8 + Math.random() * 0.4
      });
    });

    // Decorative snowy rocks
    const rockPositions = [
      { x: 180, y: 120 }, { x: width - 200, y: 140 },
      { x: 160, y: height - 120 }, { x: width - 180, y: height - 130 }
    ];

    rockPositions.forEach(p => {
      this.rocks.push({
        x: p.x,
        y: p.y,
        size: 14 + Math.random() * 10
      });
    });
  }

  public update(dt: number, width: number, height: number): void {
    // Update falling snowflakes
    this.snowflakes.forEach(flake => {
      flake.y += flake.speedY * dt;
      flake.x += flake.speedX * dt;

      if (flake.y > height) {
        flake.y = -10;
        flake.x = Math.random() * width;
      }
      if (flake.x < 0) flake.x = width;
      if (flake.x > width) flake.x = 0;
    });
  }

  public renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Base Snowy Mountain Field Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#e0f2fe'); // Soft Sky Ice Blue
    bgGradient.addColorStop(0.5, '#f0f9ff'); // Pure Snow White
    bgGradient.addColorStop(1, '#dbeafe'); // Soft Mountain Blue Tint
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle Snow Grid Tile Patterns
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Render Rocks
    this.rocks.forEach(rock => {
      ctx.save();
      ctx.translate(rock.x, rock.y);

      // Shadow
      ctx.beginPath();
      ctx.ellipse(0, rock.size * 0.4, rock.size, rock.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.fill();

      // Rock base
      ctx.beginPath();
      ctx.arc(0, 0, rock.size, 0, Math.PI * 2);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Snow Cap on Rock
      ctx.beginPath();
      ctx.arc(0, -rock.size * 0.3, rock.size * 0.75, Math.PI, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();
    });

    // Render Snowy Pine Trees
    this.trees.forEach(tree => {
      ctx.save();
      ctx.translate(tree.x, tree.y);
      ctx.scale(tree.scale, tree.scale);

      // Tree Shadow
      ctx.beginPath();
      ctx.ellipse(0, 25, 20, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
      ctx.fill();

      // Trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-5, 10, 10, 15);

      // 3 Layers of Pine Needles with Snow Tops
      const layers = [
        { y: 12, w: 32, h: 22 },
        { y: -2, w: 26, h: 20 },
        { y: -16, w: 20, h: 18 }
      ];

      layers.forEach(layer => {
        // Dark Pine Green Layer
        ctx.beginPath();
        ctx.moveTo(0, layer.y - layer.h);
        ctx.lineTo(-layer.w / 2, layer.y);
        ctx.lineTo(layer.w / 2, layer.y);
        ctx.closePath();
        ctx.fillStyle = '#064e3b';
        ctx.fill();

        // Snow overlay on top of layer
        ctx.beginPath();
        ctx.moveTo(0, layer.y - layer.h);
        ctx.lineTo(-layer.w / 4, layer.y - layer.h / 2);
        ctx.lineTo(layer.w / 4, layer.y - layer.h / 2);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      });

      ctx.restore();
    });
  }

  public renderSnowflakes(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    this.snowflakes.forEach(flake => {
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      ctx.fill();
    });
    ctx.restore();
  }
}
