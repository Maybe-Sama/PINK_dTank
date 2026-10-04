import { GameState } from '../types';

export interface Button {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  hoverColor: string;
}

export class MenuManager {
  private buttons: Button[] = [];
  private hoveredButtonId: string | null = null;
  private showInstructionsModal: boolean = false;

  public render(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    width: number,
    height: number,
    mousePos: { x: number; y: number },
    currentRound: number,
    currentScore: number,
    highScore: number,
    bestRound: number
  ): void {
    this.buttons = [];
    this.updateHoverState(mousePos);

    ctx.save();

    if (gameState === GameState.MENU) {
      if (this.showInstructionsModal) {
        this.renderInstructionsModal(ctx, width, height);
      } else {
        this.renderMainMenu(ctx, width, height, highScore, bestRound);
      }
    } else if (gameState === GameState.PAUSED) {
      this.renderPauseMenu(ctx, width, height);
    } else if (gameState === GameState.ROUND_CLEAR) {
      this.renderRoundClearOverlay(ctx, width, height, currentRound, currentScore);
    } else if (gameState === GameState.GAME_OVER) {
      this.renderGameOverMenu(ctx, width, height, currentRound, currentScore, highScore);
    }

    // Render interactive buttons
    this.buttons.forEach(btn => {
      const isHovered = this.hoveredButtonId === btn.id;
      ctx.fillStyle = isHovered ? btn.hoverColor : btn.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    });

    ctx.restore();
  }

  private updateHoverState(mousePos: { x: number; y: number }): void {
    this.hoveredButtonId = null;
    for (const btn of this.buttons) {
      if (
        mousePos.x >= btn.x &&
        mousePos.x <= btn.x + btn.w &&
        mousePos.y >= btn.y &&
        mousePos.y <= btn.y + btn.h
      ) {
        this.hoveredButtonId = btn.id;
        break;
      }
    }
  }

  public handleCanvasClick(mousePos: { x: number; y: number }): string | null {
    for (const btn of this.buttons) {
      if (
        mousePos.x >= btn.x &&
        mousePos.x <= btn.x + btn.w &&
        mousePos.y >= btn.y &&
        mousePos.y <= btn.y + btn.h
      ) {
        if (btn.id === 'INSTRUCTIONS_BACK') {
          this.showInstructionsModal = false;
          return null;
        }
        if (btn.id === 'OPCIONES') {
          this.showInstructionsModal = true;
          return null;
        }
        return btn.id;
      }
    }
    return null;
  }

  private renderMainMenu(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    highScore: number,
    bestRound: number
  ): void {
    // Backdrop dark translucent box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, width, height);

    // Title Banner
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.font = 'black 54px sans-serif';
    ctx.fillText('TANQUES 2D', width / 2, 160);

    ctx.shadowBlur = 0;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('❄️ Edición Montaña Nevada & Patitos Rosas 🦆', width / 2, 205);

    // High Score Box
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`RÉCORD DE PUNTOS: ${highScore}  |  MEJOR RONDA: ${bestRound}`, width / 2, 255);

    // Buttons
    const btnW = 220;
    const btnH = 50;
    const btnX = width / 2 - btnW / 2;

    this.buttons.push({
      id: 'JUGAR',
      label: '▶ JUGAR',
      x: btnX,
      y: 310,
      w: btnW,
      h: btnH,
      color: '#2563eb',
      hoverColor: '#3b82f6'
    });

    this.buttons.push({
      id: 'OPCIONES',
      label: '📖 INSTRUCCIONES',
      x: btnX,
      y: 380,
      w: btnW,
      h: btnH,
      color: '#475569',
      hoverColor: '#64748b'
    });
  }

  private renderInstructionsModal(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(0, 0, width, height);

    const boxW = 760;
    const boxH = 520;
    const boxX = width / 2 - boxW / 2;
    const boxY = height / 2 - boxH / 2;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('CÓMO JUGAR & CONTROLES', width / 2, boxY + 45);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#f8fafc';
    ctx.font = '15px sans-serif';

    const lines = [
      '🎮 CONTROLES:',
      '  • W / A / S / D (o Flechas): Desplazar el tanque por la nieve.',
      '  • Mover Ratón: Apuntar la torreta giratoria 360°.',
      '  • Clic Izquierdo: Disparar proyectiles rojos.',
      '  • Tecla ESC: Pausar el juego.',
      '',
      '💣 ENEMIGOS:',
      '  • Tanque Básico (Rojo): Vida 40 | Rápido de destruir.',
      '  • Tanque Rápido (Amarillo): Vida 25 | Muy veloz.',
      '  • Tanque Pesado (Gris): Vida 100 | Gran resistencia y daño.',
      '',
      '✨ BUFFIES (POTENCIADORES):',
      '  • ⚡ Velocidad (+15%)  |  💥 Daño (+20%)  |  🔫 Cadencia (+15%)  |  ❤️ Vida (+15 HP)',
      '',
      '🦆 PATITOS ROSAS:',
      '  • ¡Los patitos rosas caminan felizmente por la nieve! Roza con ellos para escuchar su cuac.'
    ];

    let startY = boxY + 95;
    lines.forEach(line => {
      ctx.fillText(line, boxX + 40, startY);
      startY += 24;
    });

    this.buttons.push({
      id: 'INSTRUCTIONS_BACK',
      label: '← VOLVER',
      x: width / 2 - 90,
      y: boxY + boxH - 60,
      w: 180,
      h: 42,
      color: '#2563eb',
      hoverColor: '#3b82f6'
    });
  }

  private renderPauseMenu(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('PAUSA', width / 2, height / 2 - 120);

    const btnW = 200;
    const btnH = 46;
    const btnX = width / 2 - btnW / 2;

    this.buttons.push({
      id: 'CONTINUAR',
      label: 'CONTINUAR',
      x: btnX,
      y: height / 2 - 40,
      w: btnW,
      h: btnH,
      color: '#22c55e',
      hoverColor: '#16a34a'
    });

    this.buttons.push({
      id: 'REINICIAR',
      label: 'REINICIAR',
      x: btnX,
      y: height / 2 + 25,
      w: btnW,
      h: btnH,
      color: '#f59e0b',
      hoverColor: '#d97706'
    });

    this.buttons.push({
      id: 'MENU_PRINCIPAL',
      label: 'MENÚ PRINCIPAL',
      x: btnX,
      y: height / 2 + 90,
      w: btnW,
      h: btnH,
      color: '#ef4444',
      hoverColor: '#dc2626'
    });
  }

  private renderRoundClearOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    round: number,
    score: number
  ): void {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 20;
    ctx.font = 'black 48px sans-serif';
    ctx.fillText('¡RONDA COMPLETADA!', width / 2, height / 2 - 50);

    ctx.shadowBlur = 0;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Preparando Ronda ${round + 1}...`, width / 2, height / 2 + 10);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Puntuación acumulada: ${score}`, width / 2, height / 2 + 45);
  }

  private renderGameOverMenu(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    round: number,
    score: number,
    highScore: number
  ): void {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 25;
    ctx.font = 'black 56px sans-serif';
    ctx.fillText('GAME OVER', width / 2, height / 2 - 130);

    ctx.shadowBlur = 0;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Has caído en la Ronda ${round}`, width / 2, height / 2 - 70);

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Puntuación final: ${score}`, width / 2, height / 2 - 40);

    if (score >= highScore && score > 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('🏆 ¡NUEVO RÉCORD DE PUNTUACIÓN! 🏆', width / 2, height / 2 - 10);
    }

    const btnW = 200;
    const btnH = 48;
    const btnX = width / 2 - btnW / 2;

    this.buttons.push({
      id: 'RETRY',
      label: '🔄 REINTENTAR',
      x: btnX,
      y: height / 2 + 30,
      w: btnW,
      h: btnH,
      color: '#2563eb',
      hoverColor: '#3b82f6'
    });

    this.buttons.push({
      id: 'MENU_PRINCIPAL',
      label: '🏠 MENÚ PRINCIPAL',
      x: btnX,
      y: height / 2 + 95,
      w: btnW,
      h: btnH,
      color: '#475569',
      hoverColor: '#64748b'
    });
  }
}
