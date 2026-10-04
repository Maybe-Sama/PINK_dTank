import { GameState } from '../types';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { StorageManager } from './StorageManager';
import { PlayerTank } from '../entities/PlayerTank';
import { EnemyTank } from '../entities/EnemyTank';
import { Projectile } from '../entities/Projectile';
import { Buffie } from '../entities/Buffie';
import { PinkDuck } from '../entities/PinkDuck';
import { EnvironmentSystem } from '../systems/EnvironmentSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { WaveManager } from '../systems/WaveManager';
import { HUD } from '../ui/HUD';
import { MenuManager } from '../ui/MenuManager';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 1280;
  private height: number = 720;

  private gameState: GameState = GameState.MENU;

  private inputManager: InputManager;
  private audioManager: AudioManager;
  private environmentSystem: EnvironmentSystem;
  private particleSystem: ParticleSystem;
  private waveManager: WaveManager;
  private hud: HUD;
  private menuManager: MenuManager;

  private player: PlayerTank;
  private enemies: EnemyTank[] = [];
  private projectiles: Projectile[] = [];
  private buffies: Buffie[] = [];
  private ducks: PinkDuck[] = [];

  private score: number = 0;
  private highScore: number = 0;
  private bestRound: number = 1;

  private roundClearTimer: number = 0;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = context;

    this.inputManager = new InputManager(this.canvas);
    this.audioManager = new AudioManager();
    this.environmentSystem = new EnvironmentSystem(this.width, this.height);
    this.particleSystem = new ParticleSystem();
    this.waveManager = new WaveManager();
    this.hud = new HUD();
    this.menuManager = new MenuManager();

    // Instantiate Player at bottom center
    this.player = new PlayerTank(this.width / 2, this.height - 120);

    // Instantiate cute Pink Ducks in the snowy landscape!
    this.initPinkDucks();

    // Load saved high score and max round from LocalStorage
    this.highScore = StorageManager.getHighScore();
    this.bestRound = StorageManager.getBestRound();

    this.initCanvasClickListener();
  }

  private initPinkDucks(): void {
    this.ducks = [];
    // Spawn 5 friendly pink ducks roaming the snow
    const positions = [
      { x: 180, y: 220 },
      { x: 1050, y: 240 },
      { x: 300, y: 550 },
      { x: 950, y: 520 },
      { x: 640, y: 360 }
    ];
    positions.forEach(p => {
      this.ducks.push(new PinkDuck(p.x, p.y));
    });
  }

  private initCanvasClickListener(): void {
    this.canvas.addEventListener('click', (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      const action = this.menuManager.handleCanvasClick({ x: mouseX, y: mouseY });
      if (action) {
        this.handleMenuAction(action);
      }
    });
  }

  private handleMenuAction(action: string): void {
    if (action === 'JUGAR') {
      this.startNewGame();
    } else if (action === 'CONTINUAR') {
      this.gameState = GameState.PLAYING;
    } else if (action === 'REINICIAR' || action === 'RETRY') {
      this.startNewGame();
    } else if (action === 'MENU_PRINCIPAL') {
      this.gameState = GameState.MENU;
    }
  }

  private startNewGame(): void {
    this.score = 0;
    this.enemies = [];
    this.projectiles = [];
    this.buffies = [];
    this.particleSystem.clear();
    this.player.resetPosition(this.width / 2, this.height - 120);

    this.waveManager.startRound(1);
    this.gameState = GameState.PLAYING;
  }

  public start(): void {
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  private gameLoop(currentTime: number): void {
    const dt = Math.min(0.05, (currentTime - this.lastTime) / 1000); // Clamp max frame time delta to prevent huge jumps
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  private update(dt: number): void {
    const mousePos = this.inputManager.getMousePos();

    // Check pause key input
    if (this.inputManager.consumePausePressed()) {
      if (this.gameState === GameState.PLAYING) {
        this.gameState = GameState.PAUSED;
      } else if (this.gameState === GameState.PAUSED) {
        this.gameState = GameState.PLAYING;
      }
    }

    // Always update environment animations (snowflakes, duck waddling)
    this.environmentSystem.update(dt, this.width, this.height);

    if (this.gameState === GameState.PLAYING) {
      // 1. Update Player Movement & Mouse Aim
      const inputVec = this.inputManager.getMovementVector();
      this.player.update(dt, this.width, this.height, inputVec, mousePos);

      // 2. Process Player Shooting (Left Click or holding mouse down)
      if (this.inputManager.getIsMouseDown()) {
        const newProj = this.player.tryShoot();
        if (newProj) {
          this.projectiles.push(newProj);
          this.audioManager.playPlayerShoot();
        }
      }

      // 3. Update Wave Spawning & Check Round Victory
      const activeEnemyCount = this.enemies.filter(e => e.active).length;
      const spawnedEnemy = this.waveManager.update(
        dt,
        activeEnemyCount,
        this.player.x,
        this.player.y,
        this.width,
        this.height
      );

      if (spawnedEnemy) {
        this.enemies.push(spawnedEnemy);
      }

      if (this.waveManager.isRoundComplete) {
        // Round Clear!
        this.audioManager.playVictory();
        this.score += this.waveManager.currentRound * 500; // Round victory bonus score
        StorageManager.saveHighScore(this.score);
        StorageManager.saveBestRound(this.waveManager.currentRound + 1);
        this.highScore = StorageManager.getHighScore();
        this.bestRound = StorageManager.getBestRound();

        this.gameState = GameState.ROUND_CLEAR;
        this.roundClearTimer = 2.0; // 2 seconds clear screen banner
      }

      // 4. Update Enemy Tanks AI & Enemy Shooting
      this.enemies.forEach(enemy => {
        if (enemy.active) {
          enemy.update(dt, this.width, this.height, this.player.x, this.player.y);
          const enemyProj = enemy.tryShoot();
          if (enemyProj) {
            this.projectiles.push(enemyProj);
            this.audioManager.playEnemyShoot();
          }
        }
      });

      // 5. Update Projectiles
      this.projectiles.forEach(p => {
        if (p.active) p.update(dt, this.width, this.height);
      });

      // 6. Update Buffies lifetime
      this.buffies.forEach(b => {
        if (b.active) b.update(dt);
      });

      // 7. Update Ducks
      this.ducks.forEach(duck => {
        duck.update(dt, this.width, this.height);
      });

      // 8. Process Collisions
      const colResults = CollisionSystem.processCollisions(
        this.player,
        this.enemies,
        this.projectiles,
        this.buffies,
        this.ducks,
        this.particleSystem,
        this.audioManager
      );

      this.score += colResults.scoreGained;
      if (colResults.newBuffies.length > 0) {
        this.buffies.push(...colResults.newBuffies);
      }

      if (colResults.playerDestroyed) {
        this.audioManager.playGameOver();
        StorageManager.saveHighScore(this.score);
        StorageManager.saveBestRound(this.waveManager.currentRound);
        this.highScore = StorageManager.getHighScore();
        this.bestRound = StorageManager.getBestRound();
        this.gameState = GameState.GAME_OVER;
      }

      // 9. Update Particle System
      this.particleSystem.update(dt);

      // Clean inactive entities
      this.enemies = this.enemies.filter(e => e.active);
      this.projectiles = this.projectiles.filter(p => p.active);
      this.buffies = this.buffies.filter(b => b.active);

    } else if (this.gameState === GameState.ROUND_CLEAR) {
      this.roundClearTimer -= dt;
      if (this.roundClearTimer <= 0) {
        // Advance to next round!
        const nextRound = this.waveManager.currentRound + 1;
        this.enemies = [];
        this.projectiles = [];
        this.waveManager.startRound(nextRound);
        this.gameState = GameState.PLAYING;
      }
    }
  }

  private render(): void {
    // 1. Draw Snowy Mountain Background Terrain & Trees
    this.environmentSystem.renderBackground(this.ctx, this.width, this.height);

    // 2. Render Pink Ducks waddling on snow
    this.ducks.forEach(duck => duck.render(this.ctx));

    // 3. Render Buffies
    this.buffies.forEach(b => {
      if (b.active) b.render(this.ctx);
    });

    // 4. Render Enemy Tanks
    this.enemies.forEach(e => {
      if (e.active) e.render(this.ctx);
    });

    // 5. Render Player Tank
    if (this.player.active) {
      this.player.render(this.ctx);
    }

    // 6. Render Projectiles
    this.projectiles.forEach(p => {
      if (p.active) p.render(this.ctx);
    });

    // 7. Render Explosions and Hit Particles
    this.particleSystem.render(this.ctx);

    // 8. Render Falling Snowflakes Overlay
    this.environmentSystem.renderSnowflakes(this.ctx);

    // 9. Render HUD when playing or round clear
    if (this.gameState === GameState.PLAYING || this.gameState === GameState.ROUND_CLEAR || this.gameState === GameState.PAUSED) {
      this.hud.render(this.ctx, this.width, this.player, this.waveManager, this.score, this.highScore);
    }

    // 10. Render Menus & Overlays
    const mousePos = this.inputManager.getMousePos();
    this.menuManager.render(
      this.ctx,
      this.gameState,
      this.width,
      this.height,
      mousePos,
      this.waveManager.currentRound,
      this.score,
      this.highScore,
      this.bestRound
    );
  }
}
