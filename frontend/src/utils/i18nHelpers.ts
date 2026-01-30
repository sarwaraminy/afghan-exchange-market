/**
 * Translation Helper Utilities
 * Provides helper functions for multilingual field access
 */

/**
 * Gets the localized value of a field based on the current language
 *
 * @param obj - The object containing the fields
 * @param fieldName - The base field name (e.g., 'name', 'location')
 * @param language - Current language code ('en', 'fa', 'ps')
 * @returns The localized field value or empty string if not found
 *
 * @example
 * const hawaladar = {
 *   name: 'Sarai Shahzada',
 *   name_fa: 'سرای شاهزاده',
 *   name_ps: 'سرای شهزاده'
 * };
 *
 * getLocalizedField(hawaladar, 'name', 'fa'); // Returns: 'سرای شاهزاده'
 * getLocalizedField(hawaladar, 'name', 'en'); // Returns: 'Sarai Shahzada'
 */
export const getLocalizedField = <T extends Record<string, any>>(
  obj: T | null | undefined,
  fieldName: string,
  language: string
): string => {
  if (!obj) return '';

  // For Dari (Persian)
  if (language === 'fa') {
    return obj[`${fieldName}_fa`] || obj[fieldName] || '';
  }

  // For Pashto
  if (language === 'ps') {
    return obj[`${fieldName}_ps`] || obj[fieldName] || '';
  }

  // Default to English or base field
  return obj[fieldName] || '';
};

/**
 * Gets the localized name from an object
 * Convenience wrapper around getLocalizedField for 'name' field
 *
 * @param obj - The object containing name fields
 * @param language - Current language code
 * @returns The localized name or empty string
 */
export const getLocalizedName = <T extends Record<string, any>>(
  obj: T | null | undefined,
  language: string
): string => {
  return getLocalizedField(obj, 'name', language);
};

/**
 * Gets the localized location from an object
 * Convenience wrapper around getLocalizedField for 'location' field
 *
 * @param obj - The object containing location fields
 * @param language - Current language code
 * @returns The localized location or empty string
 */
export const getLocalizedLocation = <T extends Record<string, any>>(
  obj: T | null | undefined,
  language: string
): string => {
  return getLocalizedField(obj, 'location', language);
};
