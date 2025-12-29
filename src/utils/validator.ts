/**
 * Checks if a style URL is a Barikoi style
 * @param style - The style URL to check
 * @returns True if the style is a Barikoi style
 */
export function isBarikoiStyle(style: string | null | undefined): boolean {
  if (!style || typeof style !== 'string') {
    return false;
  }

  // Check if it's a Barikoi domain
  if (!style.includes('barikoi.com') && !style.includes('map.barikoi')) {
    return false;
  }

  // Check for the specific Barikoi style URL pattern: /styles/{style-name}/style.json
  const barikoiStylePattern = /^https:\/\/map\.barikoi\.com\/styles\/[^/]+\/style\.json$/;
  return barikoiStylePattern.test(style);
}
