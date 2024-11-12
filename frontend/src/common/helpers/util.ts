import { BCeIDUserRoleType, BCeID_USER_ROLE } from "../authentication/types";
import {
  Nullable,
  Optional,
  RequiredOrNull,
  SORT_DIRECTIONS,
  SortingConfig,
} from "../types/common";

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
      // eslint-disable-next-line
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
 * Convers a string to a number.
 * (Applicable for number fields in forms).
 *
 * @param str The string value.
 * @param valueToReturnWhenInvalid The value to return if invalid.
 * @returns A number or valueToReturnWhenInvalid.
 */
export const convertToNumberIfValid = (
  str?: Nullable<string>,
  valueToReturnWhenInvalid?: 0 | Nullable<number> | Nullable<string>,
) => {
  // return input as a number if it's a valid number value,
  // or original value if invalid number
  return str != null && str !== "" && !isNaN(Number(str))
    ? Number(str)
    : valueToReturnWhenInvalid;
};

/**
 * Returns a label for the userRole.
 * @param userRole The userRole the user belongs to.
 * @returns A string representing the label of the user.
 */
export const getLabelForBCeIDUserRole = (
  userRole: BCeIDUserRoleType,
): string => {
  if (userRole === BCeID_USER_ROLE.COMPANY_ADMINISTRATOR) {
    return "Administrator";
  }
  return "Permit Applicant";
};

/**
 * Converts sorting state to a format that APIs accept.
 *
 * @param sortArray The sorting state of type MRT_SortingState provided
 *                  by Material React Table.
 * @returns A string of the format: "column1:DESC,column2:ASC"
 *
 */
export const stringifyOrderBy = (sortArray: SortingConfig[]): string => {
  return sortArray
    .map(({ descending, column }) => {
      const stringifiedValue = `${column}:`;
      if (descending) {
        return stringifiedValue.concat(SORT_DIRECTIONS.DESCENDING);
      } else {
        return stringifiedValue.concat(SORT_DIRECTIONS.ASCENDING);
      }
    }) // Output of map function: ["column1:DESC","column2:ASC"]
    .join(","); // Output of join: "column1:DESC,column2:ASC"
};

/**
 * Sets a redirect URI in the session storage if valid.
 *
 * This function checks if a 'r' query parameter exists in the current window location URL,
 * parses it, and if it's a valid URL belonging to the same hostname, stores it in the session storage.
 * This is useful for post-login redirections.
 *
 * @returns Nothing is explicitly returned, but may modify session storage.
 *
 */
export const setRedirectInSession = (redirectUri: string) => {
  if (redirectUri) {
    try {
      const url = new URL(redirectUri);
      // Confirm that the URL is not trying to redirect elsewhere.
      if (location.hostname === url.hostname) {
        sessionStorage.setItem(
          "onrouteBC.postLogin.redirect",
          url.pathname + url.search, // Save only the subpath and params.
        );
      }
    } catch (error) {
      console.log("Unable to parse redirect URL:", error);
    }
  }
};
