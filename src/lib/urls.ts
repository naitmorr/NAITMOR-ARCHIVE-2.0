/** Build an internal URL relative to the Astro base, including on GitHub Pages. */
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const relativePath = path.replace(/^\/+/, '');

  return `${base}/${relativePath}`;
}
