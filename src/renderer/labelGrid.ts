/**
 * Grid-based label collision detection.
 * Divides the viewport into cells and tracks which cells are occupied.
 */

export class LabelGrid {
  private cellSize: number;
  private cells: Map<string, LabelBounds[]>;

  constructor(cellSize = 150) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  reset(_viewportWidth: number, _viewportHeight: number): void {
    this.cells.clear();
  }

  hasOverlap(x: number, y: number, w: number, h: number): boolean {
    const cs = this.cellSize;
    const c0 = Math.floor(x / cs);
    const c1 = Math.floor((x + w) / cs);
    const r0 = Math.floor(y / cs);
    const r1 = Math.floor((y + h) / cs);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const bounds = this.cells.get(cellKey(r, c));
        if (!bounds) continue;
        for (const candidate of bounds) {
          if (intersects(x, y, w, h, candidate)) return true;
        }
      }
    }
    return false;
  }

  register(x: number, y: number, w: number, h: number): void {
    const bounds = { x, y, width: w, height: h };
    const cs = this.cellSize;
    const c0 = Math.floor(x / cs);
    const c1 = Math.floor((x + w) / cs);
    const r0 = Math.floor(y / cs);
    const r1 = Math.floor((y + h) / cs);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const key = cellKey(r, c);
        const cell = this.cells.get(key);
        if (cell) cell.push(bounds);
        else this.cells.set(key, [bounds]);
      }
    }
  }
}

interface LabelBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

function cellKey(row: number, column: number): string {
  return `${row}:${column}`;
}

function intersects(
  x: number,
  y: number,
  width: number,
  height: number,
  bounds: LabelBounds,
): boolean {
  return (
    x < bounds.x + bounds.width &&
    x + width > bounds.x &&
    y < bounds.y + bounds.height &&
    y + height > bounds.y
  );
}
