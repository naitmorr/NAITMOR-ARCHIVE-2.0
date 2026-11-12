export function isPublished(data: { draft: boolean; demo: boolean }): boolean {
  return !data.draft && !data.demo;
}
