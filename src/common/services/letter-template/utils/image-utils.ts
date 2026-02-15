/**
 * Get full image path by combining base URL with relative image path
 * 
 * @param imagePath - Relative path to the image
 * @param baseUrl - Base URL of the application
 * @returns Full URL to the image
 */
export function getImagePath(imagePath: string, baseUrl: string): string {
  if (!imagePath) return '';

  // Remove leading slash from imagePath if present
  const cleanPath = imagePath.replace(/^\//, '');
  
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Generate an HTML img tag with the given path
 * 
 * @param path - Relative path to the image
 * @param baseUrl - Base URL of the application
 * @param alt - Alt text for the image
 * @returns HTML img tag string
 */
export function getImageTag(path: string, baseUrl: string, alt: string): string {
  const imagePath = getImagePath(path, baseUrl);
  return `<img src="${imagePath}" alt="${alt}" />`;
}
