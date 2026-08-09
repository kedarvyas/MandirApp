/**
 * Phone number formatting for US numbers.
 *
 * Stored values are inconsistent: Supabase `members.phone` holds digits without
 * the plus ("15555550123"), while auth returns E.164 ("+15555550123"). Both
 * normalize to the same 10 local digits here.
 */

/** Strip formatting and drop a leading US country code, leaving bare digits. */
function toLocalDigits(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length > 10 && digits.startsWith('1') ? digits.slice(1) : digits;
}

/**
 * Format a stored phone number as "(555) 555-0123".
 *
 * Anything that isn't a 10-digit US number (international numbers, truncated
 * data) falls back to the original value rather than a half-formatted string.
 * Returns '' for empty input so callers can chain `|| 'N/A'`.
 */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '';

  const digits = toLocalDigits(value);
  if (digits.length !== 10) return value;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Format partial input as the user types, for a phone TextInput's value.
 *
 * Unlike formatPhone this shows incomplete numbers as they build up, and caps
 * at 10 digits so extra keystrokes are ignored.
 */
export function formatPhoneInput(value: string): string {
  const limited = toLocalDigits(value).slice(0, 10);

  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  }
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
}

/** Convert a display-formatted number to the E.164 form the API expects. */
export function toE164(value: string): string {
  return '+1' + toLocalDigits(value);
}
