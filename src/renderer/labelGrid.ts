/**
 * Grid-based label collision detection.
 * Divides the viewport into cells and tracks which cells are occupied.
 */

export class LabelGrid {
  private cellSize: number;
  private cols: number;
  private occupied: Set<number>;

  constructor(cellSize = 150) {
    this.cellSize = cellSize;
    this.cols = 0;
    this.occupied = new Set();
  }

  reset(viewportWidth: number, _viewportHeight: number): void {
    this.cols = Math.ceil(viewportWidth / this.cellSize) || 1;
    this.occupied.clear();
  }

  hasOverlap(x: number, y: number, w: number, h: number): boolean {
    const cs = this.cellSize;
    const c0 = Math.floor(x / cs);
    const c1 = Math.floor((x + w) / cs);
    const r0 = Math.floor(y / cs);
    const r1 = Math.floor((y + h) / cs);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (this.occupied.has(r * this.cols + c)) return true;
      }
    }
    return false;
  }

  register(x: number, y: number, w: number, h: number): void {
    const cs = this.cellSize;
    const c0 = Math.floor(x / cs);
    const c1 = Math.floor((x + w) / cs);
    const r0 = Math.floor(y / cs);
    const r1 = Math.floor((y + h) / cs);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        this.occupied.add(r * this.cols + c);
      }
    }
  }
}
