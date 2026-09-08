/**
 * Duration Display Helpers
 * Standardized duration formatting based on API provider documentation
 */

/**
 * Format duration number to display text
 * @param duration Duration in nights
 * @returns Formatted string (e.g., "7 Nights", "14 Nights")
 */
export function formatDuration(duration: number | string): string {
  const nights = typeof duration === "string" ? parseInt(duration, 10) : duration;
  
  if (isNaN(nights) || nights < 1) {
    return "Invalid Duration";
  }
  
  return nights === 1 ? "1 Night" : `${nights} Nights`;
}

/**
 * Format duration with days
 * @param duration Duration in nights
 * @returns Formatted string (e.g., "7 Nights / 8 Days")
 */
export function formatDurationWithDays(duration: number | string): string {
  const nights = typeof duration === "string" ? parseInt(duration, 10) : duration;
  
  if (isNaN(nights) || nights < 1) {
    return "Invalid Duration";
  }
  
  const days = nights + 1;
  return `${formatDuration(nights)} / ${days} ${days === 1 ? "Day" : "Days"}`;
}

/**
 * Get duration range display
 * @param minNights Minimum duration
 * @param maxNights Maximum duration
 * @returns Formatted range (e.g., "7-14 Nights")
 */
export function formatDurationRange(minNights: number, maxNights: number): string {
  if (minNights === maxNights) {
    return formatDuration(minNights);
  }
  return `${minNights}-${maxNights} Nights`;
}

/**
 * Common duration options for dropdowns
 * Standard options: 2, 3, 4, 5, 7, 10, 14 nights
 */
export const COMMON_DURATIONS = [2, 3, 4, 5, 7, 10, 14];

/**
 * Get all common duration options with labels
 * @returns Array of {value, label} objects for dropdown options
 */
export function getCommonDurationOptions() {
  return COMMON_DURATIONS.map((nights) => ({
    value: nights,
    label: formatDuration(nights),
  }));
}

/**
 * Parse duration string to number
 * Handles various formats: "7", "7 nights", "7N", etc.
 */
export function parseDuration(duration: string | number): number {
  if (typeof duration === "number") return duration;
  
  // Extract first number from string
  const match = duration.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Validate duration value
 * @param duration Duration to validate
 * @param min Minimum allowed nights (default: 1)
 * @param max Maximum allowed nights (default: 365)
 * @returns true if valid
 */
export function isValidDuration(
  duration: number | string,
  min: number = 1,
  max: number = 365
): boolean {
  const nights = parseDuration(duration);
  return nights >= min && nights <= max;
}
