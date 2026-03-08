/** Parse hex "#rrggbb" or "#rgb" to [r,g,b] 0-1. */
export function parseColor(hex: string): [number, number, number] {
  const m = hex.slice(1).match(hex.length <= 4 ? /^(.)(.)(.)$/ : /^(..)(..)(..)$/);
  if (!m) return [0.2, 0.4, 0.8];
  const scale = hex.length <= 4 ? 0x11 : 0x1;
  return [
    parseInt(m[1], 16) * scale / 255,
    parseInt(m[2], 16) * scale / 255,
    parseInt(m[3], 16) * scale / 255,
  ];
}
