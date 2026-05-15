/** Parse hex "#rrggbb" or "#rgb" to [r,g,b] 0-1. Cached to avoid repeated regex+parseInt. */
const cache = new Map<string, [number, number, number] | null>();

export function parseColor(hex: string): [number, number, number] {
  // Handle transparent
  if (hex === 'transparent' || hex === 'none') {
    return [0, 0, 0]; // Will be handled by opacity in shader
  }
  let c = cache.get(hex);
  if (c !== undefined) return c ?? [0.2, 0.4, 0.8];
  const m = hex.slice(1).match(hex.length <= 4 ? /^(.)(.)(.)$/ : /^(..)(..)(..)$/);
  if (!m) {
    cache.set(hex, null);
    return [0.2, 0.4, 0.8];
  }
  const scale = hex.length <= 4 ? 0x11 : 0x1;
  c = [
    parseInt(m[1], 16) * scale / 255,
    parseInt(m[2], 16) * scale / 255,
    parseInt(m[3], 16) * scale / 255,
  ];
  cache.set(hex, c);
  return c;
}
