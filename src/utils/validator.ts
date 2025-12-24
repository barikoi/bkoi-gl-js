/**
 * Checks if a style URL is a Barikoi style
 * @param style - The style URL to check
 * @returns True if the style is a Barikoi style
 */
export function isBarikoiStyle(style: string): boolean {
  return style.includes('barikoi.com') || style.includes('map.barikoi');
}
