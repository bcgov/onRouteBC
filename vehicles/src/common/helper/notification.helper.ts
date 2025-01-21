/**
 * Validates a list of email addresses, removing duplicates and empty values.
 *
 * @param {string[]} emailList - The list of email addresses to validate.
 * @returns {string[]} The validated list of email addresses, without duplicates or empty values.
 */
export const validateEmailList = (emailList: string[]): string[] => {
  return Array.from(new Set(emailList?.filter(Boolean)));
};
