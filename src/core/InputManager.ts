export class InputManager {
  private keys: Set<string> = new Set();
  private mousePos: { x: number; y: number } = { x: 0, y: 0 };
  private isMouseDown: boolean = false;
  private mouseClicked: boolean = false;
  private pausePressed: boolean = false;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.initListeners();
  }

  private initListeners(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      this.keys.add(key);

      if (e.key === 'Escape') {
        this.pausePressed = true;
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      this.keys.delete(key);
    });

    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mousePos.x = (e.clientX - rect.left) * scaleX;
      this.mousePos.y = (e.clientY - rect.top) * scaleY;
    });

    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 0) {
        this.isMouseDown = true;
        this.mouseClicked = true;
      }
    });

    window.addEventListener('mouseup', (e: MouseEvent) => {
      if (e.button === 0) {
        this.isMouseDown = false;
      }
    });
  }

  public isKeyDown(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  public getMovementVector(): { x: number; y: number } {
    let dx = 0;
    let dy = 0;

    if (this.isKeyDown('w') || this.isKeyDown('arrowup')) dy -= 1;
    if (this.isKeyDown('s') || this.isKeyDown('arrowdown')) dy += 1;
    if (this.isKeyDown('a') || this.isKeyDown('arrowleft')) dx -= 1;
    if (this.isKeyDown('d') || this.isKeyDown('arrowright')) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const length = Math.hypot(dx, dy);
      dx /= length;
      dy /= length;
    }

    return { x: dx, y: dy };
  }

  public getMousePos(): { x: number; y: number } {
    return { ...this.mousePos };
  }

  public getIsMouseDown(): boolean {
    return this.isMouseDown;
  }

  public consumeMouseClicked(): boolean {
    if (this.mouseClicked) {
      this.mouseClicked = false;
      return true;
    }
    return false;
  }

  public consumePausePressed(): boolean {
    if (this.pausePressed) {
      this.pausePressed = false;
      return true;
    }
    return false;
  }

  public reset(): void {
    this.keys.clear();
    this.isMouseDown = false;
    this.mouseClicked = false;
    this.pausePressed = false;
  }
}
