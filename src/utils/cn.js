import { clsx } from 'clsx';

/**
 * Utility function for combining class names
 * @param {...any} inputs - Class names to combine
 * @returns {string} Combined class names
 */
export function cn(...inputs) {
  return clsx(inputs);
}
