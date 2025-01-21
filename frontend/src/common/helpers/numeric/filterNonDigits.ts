/**
 * Filter out any non-digit characters from a string.
 * @param input Any string input
 * @returns String containing only digits
 */
export const filterNonDigits = (input: string) =>
  input.replace(/[^0-9]/g, "");
