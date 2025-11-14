/**
 * Phone number formatting utility for SMS compliance
 * Normalizes phone numbers to E.164 format (+[country code][number])
 */

/**
 * Formats a phone number to E.164 format
 * @param phoneNumber - Phone number in any format
 * @returns Formatted phone number in E.164 format, or null if invalid
 */
export function formatPhoneNumber(phoneNumber: string | null | undefined): string | null {
  if (!phoneNumber) {
    return null;
  }

  // Remove all non-digit characters except leading +
  let cleaned = phoneNumber.trim();
  
  // If it doesn't start with +, assume US number and add +1
  if (!cleaned.startsWith('+')) {
    // Remove any leading 1 if present (US country code)
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      cleaned = '+' + cleaned;
    } else {
      // Assume US number, add +1
      cleaned = '+1' + cleaned.replace(/\D/g, '');
    }
  } else {
    // Already has +, just remove non-digits after the +
    const plus = cleaned[0];
    const digits = cleaned.slice(1).replace(/\D/g, '');
    cleaned = plus + digits;
  }

  // Validate E.164 format: + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  if (!e164Regex.test(cleaned)) {
    console.warn(`Invalid phone number format: ${phoneNumber} -> ${cleaned}`);
    return null;
  }

  return cleaned;
}

/**
 * Validates if a phone number is in valid E.164 format
 * @param phoneNumber - Phone number to validate
 * @returns true if valid E.164 format, false otherwise
 */
export function isValidE164(phoneNumber: string): boolean {
  if (!phoneNumber) {
    return false;
  }
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

