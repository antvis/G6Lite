// Rewrite prose URLs for static deployments without changing copied code.
export function prefixMarkdownLinks(markdown: string, basePath: string): string {
  const base = basePath.replace(/\/$/, '');
  if (!base) return markdown;
  const prefix = (url: string) => {
    if (!url.startsWith('/') || url.startsWith('//') || url === base || url.startsWith(base + '/')) return url;
    return base + url;
  };
  let fence: { character: string; length: number } | undefined;
  return markdown.split('\n').map((line) => {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (!fence) fence = { character: marker[0], length: marker.length };
      else if (marker[0] === fence.character && marker.length >= fence.length) fence = undefined;
      return line;
    }
    if (fence) return line;
    const prose = (text: string) => text
      .replace(/(\]\()([^\s)]+)([^)]*\))/g, (_all, start: string, url: string, end: string) => start + prefix(url) + end)
      .replace(/\b(href|src)="([^"]+)"/g, (_all, name: string, url: string) => name + '="' + prefix(url) + '"');
    let cursor = 0;
    let result = '';
    const inline = /(`+)(.*?)\1/g;
    for (const match of line.matchAll(inline)) {
      result += prose(line.slice(cursor, match.index)) + match[0];
      cursor = match.index! + match[0].length;
    }
    return result + prose(line.slice(cursor));
  }).join('\n');
}
