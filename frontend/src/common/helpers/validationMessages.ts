import validationMessages from "../constants/validation_messages.json";

const replacePlaceholders = (
  messageTemplate: string,
  placeholders: string[],
  ...args: (string | number | boolean)[]
) => {
  let errMsg = messageTemplate;
  placeholders.forEach((placeholderText, index) => {
    errMsg = errMsg.replaceAll(placeholderText, `${args[index]}`);
  });
  return errMsg;
};

export const requiredMessage = () => validationMessages.required.defaultMessage;
export const selectionRequired = () =>
  validationMessages.selectionRequired.defaultMessage;
export const invalidNumber = () => validationMessages.NaN.defaultMessage;
export const mustBeGreaterThan = (val: number) => {
  const { messageTemplate, placeholders } = validationMessages.greaterThan;
  return replacePlaceholders(messageTemplate, placeholders, val);
};

export const mustBeLessThan = (val: number) => {
  const { messageTemplate, placeholders } = validationMessages.lessThan;
  return replacePlaceholders(messageTemplate, placeholders, val);
};

export const mustBeGreaterThanOrEqualTo = (val: number) => {
  const { messageTemplate, placeholders } = validationMessages.greaterThanOrEq;
  return replacePlaceholders(messageTemplate, placeholders, val);
};

export const mustBeLessThanOrEqualTo = (val: number) => {
  const { messageTemplate, placeholders } = validationMessages.lessThanOrEq;
  return replacePlaceholders(messageTemplate, placeholders, val);
};

export const invalidCountryCode = () =>
  validationMessages.country.defaultMessage;
export const invalidProvinceCode = () =>
  validationMessages.province.defaultMessage;
export const invalidDate = () => validationMessages.date.defaultMessage;
export const invalidPastStartDate = () =>
  validationMessages.date.start.past.defaultMessage;

export const warnPastStartDate = () =>
  validationMessages.date.start.past.warningMessage;

export const invalidMaxStartDate = (max: number) => {
  const { messageTemplate, placeholders } = validationMessages.date.start.max;
  return replacePlaceholders(messageTemplate, placeholders, max);
};

export const expiryMustBeAfterStart = () => {
  return validationMessages.date.expiry.beforeStart.defaultMessage;
};

export const pastStartOrExpiryDate = () =>
  validationMessages.date.startOrExpiry.past.defaultMessage;

export const invalidEmail = () => validationMessages.email.defaultMessage;

export const invalidPhoneLength = (min: number, max: number) => {
  const { messageTemplate, placeholders } = validationMessages.phone.length;
  return replacePlaceholders(messageTemplate, placeholders, min, max);
};

export const invalidExtension = () => validationMessages.extension.defaultMessage;

export const invalidExtensionLength = (max: number) => {
  const { messageTemplate, placeholders } = validationMessages.extension.length;
  return replacePlaceholders(messageTemplate, placeholders, max);
};

export const invalidAddressLength = (min: number, max: number) => {
  const { messageTemplate, placeholders } = validationMessages.address.length;
  return replacePlaceholders(messageTemplate, placeholders, min, max);
};

export const invalidAddress = () => validationMessages.address.invalid;

export const invalidCityLength = (min: number, max: number) => {
  const { messageTemplate, placeholders } = validationMessages.city.length;
  return replacePlaceholders(messageTemplate, placeholders, min, max);
};

export const invalidPostalCode = () =>
  validationMessages.postalCode.defaultMessage;

export const invalidFirstNameLength = (min: number, max: number) => {
  const { messageTemplate, placeholders } = validationMessages.firstName.length;
  return replacePlaceholders(messageTemplate, placeholders, min, max);
};

export const invalidLastNameLength = (min: number, max: number) => {
  const { messageTemplate, placeholders } = validationMessages.lastName.length;
  return replacePlaceholders(messageTemplate, placeholders, min, max);
};

export const invalidYearMin = (min: number | string) => {
  const { messageTemplate, placeholders } = validationMessages.year.min;
  return replacePlaceholders(messageTemplate, placeholders, min);
};

export const invalidVINLength = (len: number) => {
  const { messageTemplate, placeholders } = validationMessages.vin.length.equal;
  return replacePlaceholders(messageTemplate, placeholders, len);
};

export const invalidPlateLength = (max: number) => {
  const { messageTemplate, placeholders } = validationMessages.plate.length.max;
  return replacePlaceholders(messageTemplate, placeholders, max);
};

export const licensedGVWExceeded = (max: number, localizeNumber?: boolean) => {
  const { messageTemplate, placeholders } = validationMessages.licensedGVW.max;
  return replacePlaceholders(
    messageTemplate,
    placeholders,
    localizeNumber ? max.toLocaleString() : max,
  );
};

export const invalidDBALength = (min: number, max: number) => {
  const { messageTemplate, placeholders } = validationMessages.dba.length;
  return replacePlaceholders(messageTemplate, placeholders, min, max);
};

export const invalidTranactionIdLength = (max: number) => {
  const { messageTemplate, placeholders } =
    validationMessages.transactionId.length;
  return replacePlaceholders(messageTemplate, placeholders, max);
};

export const uploadSizeExceeded = () => {
  return validationMessages.upload.fileSize.exceeded;
};

export const invalidUploadFormat = () => {
  return validationMessages.upload.fileFormat.defaultMessage;
};

export const requiredUpload = (uploadItem: string) => {
  const { messageTemplate, placeholders } = validationMessages.upload.required;
  return replacePlaceholders(messageTemplate, placeholders, uploadItem);
};

export const requiredHighway = () => validationMessages.highway.missing;

export const requiredPowerUnit = () => validationMessages.powerUnit.required;

/**
 * Checks if a given string is
 * null, empty or conforms to length requirements if it has a value.
 *
 * @param value The value to be validated.
 * @param {number} options.minLength: The minimum length of the field. Defaults to 1.
 * @param {number} options.maxLength: The maximum length of the field. Required.
 * @returns A boolean
 */
export const isValidOptionalString = (
  value: string | undefined,
  { maxLength, minLength = 1 }: { maxLength: number; minLength?: number },
): boolean => {
  return Boolean(
    !value || (value && value.length >= minLength && value.length <= maxLength),
  );
};
