import { Nullable } from "../types/common";
import { getDefaultRequiredVal } from "./util";

/**
 * Check if two nullable values are different.
 * @param val1 First nullable value to be compared
 * @param val2 Second nullable value to be compared
 * @returns true when only one of the values are empty, or both are non-empty and different, false otherwise
 */
export const areValuesDifferent = <T>(
  val1?: Nullable<T>,
  val2?: Nullable<T>,
): boolean => {
  if (!val1 && !val2) return false; // Both empty implicitly means that values are the same

  if ((val1 && !val2) || (!val1 && val2) || (val1 && val2 && val1 !== val2)) {
    return true; // Only one empty, or both are non-empty but different means that values are different
  }

  return false; // Values are considered equal otherwise
};

/**
 * Determine whether or not two arrays, each with only unique primitive values, have the same values.
 * @param arr1 First array consisting of only non-duplicate primitive values
 * @param arr2 Second array consisting of only non-duplicate primitive values
 * @returns Whether or not the two arrays have the same values
 */
export const doUniqueArraysHaveSameItems = <T extends (number | string)>(
  arr1: T[],
  arr2: T[],
) => {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  for (const val of set1) {
    if (!set2.has(val)) return false;
  }

  for (const val of set2) {
    if (!set1.has(val)) return false;
  }
  
  return true;
};

/**
 * Determine whether or not two arrays, each with objects of a certain type identifiable by keys,
 * have the same objects.
 * @param arr1 First array consisting of identifiable objects
 * @param arr2 Second array consisting of identifiable objects
 * @param key Function that returns the identifier of an object of the given type
 * @param equalFn Function that compares equality of two objects of the given type
 * @returns Whether or not the two arrays have the same objects
 */
export const doUniqueArraysHaveSameObjects = <T, K extends (number | string)>(
  arr1: T[],
  arr2: T[],
  key: (item: T) => K,
  equalFn: (item1: T, item2: T) => boolean,
) => {
  const map1 = new Map<K, T>(arr1.map(item => [key(item), item]));
  const map2 = new Map<K, T>(arr2.map(item => [key(item), item]));

  for (const [key, item] of map1) {
    const itemInOtherMapWithSameKey = map2.get(key);
    if (!itemInOtherMapWithSameKey || !equalFn(item, itemInOtherMapWithSameKey))
      return false;
  }

  for (const [key, item] of map2) {
    const itemInOtherMapWithSameKey = map1.get(key);
    if (!itemInOtherMapWithSameKey || !equalFn(item, itemInOtherMapWithSameKey))
      return false;
  }

  return true;
};

/**
 * Compare whether or not two ordered sequences are equal (ie. having same items in the same order).
 * @param sequence1 First array of sequential items
 * @param sequence2 Second array of sequential items
 * @returns Whether or not the two sequences have the same items in the same order
 */
export const areOrderedSequencesEqual = <T>(
  sequence1: Nullable<T[]>,
  sequence2: Nullable<T[]>,
  equalFn: (item1: T, item2: T) => boolean,
) => {
  const seq1 = getDefaultRequiredVal([], sequence1);
  const seq2 = getDefaultRequiredVal([], sequence2);
  
  if (seq1.length !== seq2.length) return false;
  return seq1.every((seqNumber, index) => equalFn(seqNumber, seq2[index]));
};
