export const showcaseIds = ['relationship', 'org-chart', 'mindmap', 'fishbone'] as const;
export type ShowcaseId = (typeof showcaseIds)[number];
export type ShowcaseTheme = 'light' | 'dark';
export type ShowcaseCode = { source: string; html: string };

export function getShowcaseOptionalLayout(id: ShowcaseId): 'mindmap' | 'fishbone' | undefined {
  return id === 'mindmap' || id === 'fishbone' ? id : undefined;
}
