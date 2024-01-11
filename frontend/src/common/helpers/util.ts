import { Nullable, Optional, RequiredOrNull } from "../types/common";

/**
 * Remove all the null, undefined and empty fields (including arrays).
 * @param obj The object to remove empty values from.
 * @returns An Object with only valid values.
 *
 * @see https://bobbyhadz.com/blog/javascript-remove-null-values-from-object
 */
export const removeEmptyValues = (obj: object): object => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_key, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value != null && value !== "";
      })
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return [key, value];
        }
        return [
          key,
          typeof value === "object" ? removeEmptyValues(value) : value,
        ];
      }),
  );
};

/**
 * Replace undefined and empty fields with null (including arrays).
 * 
 * The function takes an obj parameter, which can be any JavaScript object.
 * If the object is an array, it calls the replaceEmptyWithNull function recursively on each item in the array and returns the resulting array.
 * If the object is an object (i.e., not an array and not null), it uses Object.entries to get an array of [key, value] pairs for each property in the object. It then reduces that array into a new object with the same keys, but with each value replaced by the result of calling replaceEmptyWithNull on it.
 * If the object is not an array and not an object, it checks whether the value is undefined or an empty string (''). If it is, it returns null. Otherwise, it returns the original value.

 * @param obj The object to replace empty values from.
 * @returns An Object with only valid values
 *
 * @see https://dev.to/typescripttv/what-is-the-difference-between-null-and-undefined-5h76
 */
export const replaceEmptyValuesWithNull = (
  obj: object,
): RequiredOrNull<object> => {
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceEmptyValuesWithNull(item));
  } else if (typeof obj === "object" && obj !== null) {
    // acc is a shorthand name for the accumulator object that's being built up by the reduce function
    return Object.entries(obj).reduce((acc: any, [key, value]) => {
      acc[key] = replaceEmptyValuesWithNull(value);
      return acc;
    }, {});
  } else {
    return obj === undefined || obj === "" ? null : obj;
  }
};

/**
 * Apply a function to an input value only when the input is non-nullable/undefined.
 *
 * Eg. applyWhenNotNullable(someFn, "abc", "") === someFn("abc")
 *
 * Eg. applyWhenNotNullable(someFn, null, 123) === 123
 *
 * @param applyFn Function to apply when inputVal is non-nullable
 * @param inputVal Potentially nullable/undefined input value
 * @param explicitDefaultVal Explicit (optional) default value to return when input is nullable
 *
 * @returns Result of applyFn, or explicitDefaultVal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const applyWhenNotNullable = <T>(
  applyFn: (val: T) => any,
  inputVal?: Nullable<T>,
  explicitDefaultVal?: any,
) => {
  return inputVal != null ? applyFn(inputVal) : explicitDefaultVal;
};

/**
 * Get the first non-null/undefined value from a list of provided values (ordered from nullable to non-nullable).
 *
 * Eg. getDefaultNullableVal(undefined, 0) === 0
 *
 * Eg. getDefaultNullableVal(undefined, null, null) === undefined
 *
 * @param defaultVals List of provided possibly nullable values (ordered from nullable to non-nullable)
 *
 * @returns The first non-nullable value from defaultVals, or undefined if there are no non-nullable values.
 */
export const getDefaultNullableVal = <T>(
  ...defaultVals: Nullable<T>[]
): Optional<T> => {
  return defaultVals.find((val) => val != null) ?? undefined;
};

/**
 * Get the first non-nullable value from a list of provided values (ordered from nullable to non-nullable).
 *
 * Eg. getDefaultRequiredVal(0, undefined, null) === 0
 *
 * Eg. getDefaultRequiredVal("", null, undefined, "somestr") === "somestr"
 *
 * @param fallbackDefault Required non-nullable default value to return if all other provided default values are null/undefined
 * @param defaultVals List of provided possibly nullable values (ordered from nullable to non-nullable)
 *
 * @returns The first non-nullable value from defaultVals, or fallbackDefault if there are no non-nullable values.
 */
export const getDefaultRequiredVal = <T>(
  fallbackDefault: T,
  ...defaultVals: Nullable<T>[]
): T => {
  return defaultVals.find((val) => val != null) ?? fallbackDefault;
};

/**
 * Check if two nullable values are different.
 * @param val1 First nullable value to be compared
 * @param val2 Second nullable value to be compared
 * @returns boolean value indicating if values are different.
 */
export const areValuesDifferent = <T>(
  val1?: Nullable<T>,
  val2?: Nullable<T>,
): boolean => {
  if (!val1 && !val2) return false; // both empty === equal

  if ((val1 && !val2) || (!val1 && val2) || (val1 && val2 && val1 !== val2)) {
    return true; // one empty, or both non-empty but different === different
  }

  return false; // values are equal otherwise
};

/**
 * Returns the file name for a file from API response.
 * @param headers The collection of headers in an API response.
 * @returns string | undefined.
 */
export const getFileNameFromHeaders = (
  headers: Headers,
): string | undefined => {
  const contentDisposition = headers.get("content-disposition");
  if (!contentDisposition) return undefined;
  const matchRegex = /filename=(.+)/;
  const filenameMatch = matchRegex.exec(contentDisposition);
  if (filenameMatch && filenameMatch.length > 1) {
    return filenameMatch[1];
  }
  return undefined;
};

/**
 * Downloads a file using stream.
 * @param response The Axios response containing file details.
 * @returns The file.
 */
export const streamDownloadFile = async (response: Response) => {
  const filename = getFileNameFromHeaders(response.headers);
  if (!filename) {
    throw new Error("Unable to download pdf, file not available");
  }
  if (!response.body) {
    throw new Error("Unable to download pdf, no response found");
  }
  const reader = response.body.getReader();
  const stream = new ReadableStream({
    start: (controller) => {
      const processRead = async () => {
        const { done, value } = await reader.read();
        if (done) {
          // When no more data needs to be consumed, close the stream
          controller.close();
          return;
        }
        // Enqueue the next data chunk into our target stream
        controller.enqueue(value);
        await processRead();
      };
      processRead();
    },
  });
  const newRes = new Response(stream);
  const blobObj = await newRes.blob();
  return { blobObj, filename };
};

/**
 * Encrypts a string and returns its hex value.
 * @param message The message to be 
 * @returns The hashvalue from SHA256 encryption.
 * 
 * Code copied from: 
 * https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
 */
export async function getSHA256HexValue(message: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}