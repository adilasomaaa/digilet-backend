/**
 * Get nested value from object using dot notation
 * Supports nested paths like "studyProgram.name"
 * 
 * @param obj - The object to extract value from
 * @param path - Dot-notation path to the value (e.g., "user.profile.name")
 * @returns The value at the specified path, or undefined if not found
 * 
 * @example
 * const obj = { user: { profile: { name: 'John' } } };
 * getNestedValue(obj, 'user.profile.name'); // Returns 'John'
 */
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) {
    return undefined;
  }

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}
