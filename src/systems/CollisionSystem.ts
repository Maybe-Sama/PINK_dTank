import { PlayerTank } from '../entities/PlayerTank';
import { EnemyTank } from '../entities/EnemyTank';
import { Projectile } from '../entities/Projectile';
import { Buffie } from '../entities/Buffie';
import { PinkDuck } from '../entities/PinkDuck';
import { ParticleSystem } from './ParticleSystem';
import { AudioManager } from '../core/AudioManager';
import { BuffType } from '../types';

export interface CollisionResults {
  scoreGained: number;
  newBuffies: Buffie[];
  playerDestroyed: boolean;
}

export class CollisionSystem {
  private static readonly MAX_ACTIVE_BUFFIES = 3;

  public static processCollisions(
    player: PlayerTank,
    enemies: EnemyTank[],
    projectiles: Projectile[],
    buffies: Buffie[],
    ducks: PinkDuck[],
    particles: ParticleSystem,
    audio: AudioManager
  ): CollisionResults {
    const results: CollisionResults = {
      scoreGained: 0,
      newBuffies: [],
      playerDestroyed: false
    };

    // 1. Process Projectiles
    for (let pIdx = projectiles.length - 1; pIdx >= 0; pIdx--) {
      const proj = projectiles[pIdx];
      if (!proj.active) continue;

      if (proj.owner === 'PLAYER') {
        // Player projectile -> Enemy tanks
        for (let eIdx = enemies.length - 1; eIdx >= 0; eIdx--) {
          const enemy = enemies[eIdx];
          if (!enemy.active) continue;

          if (proj.collidesWith(enemy)) {
            proj.active = false;
            particles.createHitSparks(proj.x, proj.y, '#ef4444', 6);
            audio.playHit();

            const isDead = enemy.takeDamage(proj.damage);

            if (isDead) {
              particles.createExplosion(enemy.x, enemy.y, enemy.color, 24);
              audio.playExplosion();
              results.scoreGained += enemy.stats.scoreValue;

              // Check buffie drop chance (Max 3 active buffies total)
              const totalActiveBuffies = buffies.filter(b => b.active).length + results.newBuffies.length;
              if (totalActiveBuffies < CollisionSystem.MAX_ACTIVE_BUFFIES) {
                if (Math.random() <= enemy.stats.buffDropChance) {
                  const buffType = CollisionSystem.getRandomBuffType();
                  results.newBuffies.push(new Buffie(enemy.x, enemy.y, buffType));
                }
              }
            }
            break;
          }
        }
      } else if (proj.owner === 'ENEMY') {
        // Enemy projectile -> Player tank
        if (player.active && proj.collidesWith(player)) {
          proj.active = false;
          particles.createHitSparks(proj.x, proj.y, '#f59e0b', 8);
          audio.playHit();

          const isDead = player.takeDamage(proj.damage);
          if (isDead) {
            particles.createExplosion(player.x, player.y, '#3b82f6', 32);
            audio.playExplosion();
            results.playerDestroyed = true;
          }
        }
      }

      // Check projectile proximity to Pink Ducks for surprise quack!
      ducks.forEach(duck => {
        if (proj.active && proj.collidesWith(duck)) {
          duck.triggerSurprise();
          audio.playDuckQuack();
        }
      });
    }

    // 2. Process Player -> Buffies pickup
    buffies.forEach(buffie => {
      if (buffie.active && player.active && player.collidesWith(buffie)) {
        buffie.active = false;
        player.applyBuff(buffie.buffType);
        particles.createBuffSparkles(buffie.x, buffie.y, '#38bdf8', 16);
        audio.playBuffPickup();
      }
    });

    // 3. Process Player -> Duck bumps
    ducks.forEach(duck => {
      if (player.active && player.collidesWith(duck)) {
        duck.triggerSurprise();
        audio.playDuckQuack();
      }
    });

    return results;
  }

  private static getRandomBuffType(): BuffType {
    const roll = Math.random();
    // Heal is rarer (15% chance), others 28.3% each
    if (roll < 0.283) return BuffType.SPEED;
    if (roll < 0.566) return BuffType.DAMAGE;
    if (roll < 0.850) return BuffType.CADENCE;
    return BuffType.HEAL;
  }
}
