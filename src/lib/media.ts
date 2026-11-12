import type { ImageMetadata } from 'astro';
import { withBase } from './urls.ts';

const images = import.meta.glob<ImageMetadata>(
  '/src/assets/images/**/*.{avif,webp,png,jpg,jpeg,svg}',
  { eager: true, import: 'default' },
);

/** Resolve a validated content path into Astro image metadata at build time. */
export function resolveContentImage(src: string): ImageMetadata {
  const image = images[`/${src}`];
  if (!image) throw new Error(`Content image is not available: ${src}`);
  return image;
}

export function resolveAudioUrl(src: string): string {
  if (src.startsWith('https://')) return src;
  if (!src.startsWith('public/audio/previews/')) throw new Error(`Unsupported audio path: ${src}`);
  return withBase(src.slice('public/'.length));
}
