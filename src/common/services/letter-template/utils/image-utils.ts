import * as fs from 'fs';
import { join } from 'path';

/**
 * Get full image path by combining base URL with relative image path
 */
export function getImagePath(imagePath: string, baseUrl: string): string {
  if (!imagePath) return '';

  // Remove leading slash from imagePath if present
  const cleanPath = imagePath.replace(/^\//, '');

  return `${baseUrl}/${cleanPath}`;
}

/**
 * Convert a local image file to a Base64 data URL string.
 *
 * The `imagePath` parameter is expected to be a relative path stored in the
 * database (e.g. `uploads/letterheads/logo.png`).  The file is resolved from
 * the `public/` directory at the project root.
 *
 * If the file does not exist or cannot be read the function returns an empty
 * string instead of throwing, so the caller can safely fall back to no image.
 */
export function imageFileToBase64(imagePath?: string | null): string {
  if (!imagePath) return '';

  // If it's already a Base64 data URL, return as-is
  if (imagePath.startsWith('data:')) return imagePath;

  // Strip a leading slash so join() doesn't treat it as absolute
  const cleanPath = imagePath.replace(/^\//, '');

  // Files are stored under <project-root>/public/
  const absolutePath = join(process.cwd(), 'public', cleanPath);

  if (!fs.existsSync(absolutePath)) {
    console.warn(`[imageFileToBase64] File not found: ${absolutePath}`);
    return '';
  }

  try {
    const buffer = fs.readFileSync(absolutePath);

    // Infer MIME type from extension
    const ext = cleanPath.split('.').pop()?.toLowerCase() ?? '';
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };
    const mime = mimeMap[ext] ?? 'image/png';

    return `data:${mime};base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.error(`[imageFileToBase64] Failed to read file: ${absolutePath}`, err);
    return '';
  }
}

/**
 * Generate an HTML img tag with the given path
 */
export function getImageTag(path: string, baseUrl: string, alt: string): string {
  const imagePath = getImagePath(path, baseUrl);
  return `<img src="${imagePath}" alt="${alt}" />`;
}
