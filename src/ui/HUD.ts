import { PlayerTank } from '../entities/PlayerTank';
import { WaveManager } from '../systems/WaveManager';
import { BuffType } from '../types';

export class HUD {
  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    player: PlayerTank,
    waveManager: WaveManager,
    score: number,
    highScore: number
  ): void {
    ctx.save();

    // 1. Top HUD Bar Background Banner
    const barHeight = 44;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, width, barHeight);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, barHeight);
    ctx.lineTo(width, barHeight);
    ctx.stroke();

    // 2. Health Bar Section (Left Top)
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('VIDA:', 15, barHeight / 2);

    const hpBarX = 60;
    const hpBarY = barHeight / 2 - 9;
    const hpBarW = 160;
    const hpBarH = 18;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(hpBarX, hpBarY, hpBarW, hpBarH);

    const hpPercent = Math.max(0, player.hp / player.maxHp);
    const hpColor = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillStyle = hpColor;
    ctx.fillRect(hpBarX + 1, hpBarY + 1, (hpBarW - 2) * hpPercent, hpBarH - 2);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(player.hp)} / ${player.maxHp}`, hpBarX + hpBarW / 2, barHeight / 2);

    // 3. Round Number Section (Center Top)
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(`RONDA: ${waveManager.currentRound}`, width / 2 - 90, barHeight / 2);

    // 4. Timer Section (Center Top)
    const timeRemaining = Math.ceil(waveManager.roundTimeRemaining);
    const timeColor = timeRemaining <= 5 ? '#ef4444' : '#f59e0b';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`TIEMPO: `, width / 2 + 50, barHeight / 2);
    ctx.fillStyle = timeColor;
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${timeRemaining}s`, width / 2 + 105, barHeight / 2);

    // 5. Score Section (Right Top)
    ctx.textAlign = 'right';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`PUNTOS: ${score}`, width - 20, barHeight / 2 - 7);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`RÉCORD: ${Math.max(score, highScore)}`, width - 20, barHeight / 2 + 10);

    // 6. Active Buffies Indicators (Bottom Left Corner)
    const activeBuffs = player.getActiveBuffsList();
    if (activeBuffs.length > 0) {
      let startY = 580;
      const startX = 20;

      activeBuffs.forEach(buff => {
        let label = '⚡ Velocidad';
        let color = '#06b6d4';

        if (buff.type === BuffType.DAMAGE) {
          label = '💥 Daño';
          color = '#ef4444';
        } else if (buff.type === BuffType.CADENCE) {
          label = '🔫 Cadencia';
          color = '#eab308';
        }

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'left';
        ctx.fillText(label, startX, startY);

        const progressW = 100;
        const progressH = 8;
        const progressX = startX + 90;
        const progressY = startY - 6;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillRect(progressX, progressY, progressW, progressH);

        const ratio = Math.max(0, buff.remainingTime / buff.duration);
        ctx.fillStyle = color;
        ctx.fillRect(progressX, progressY, progressW * ratio, progressH);

        startY -= 24;
      });
    }

    ctx.restore();
  }
}
