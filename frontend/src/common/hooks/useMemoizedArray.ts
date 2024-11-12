import { useEffect, useState } from "react";
import { doUniqueArraysHaveSameObjects } from "../helpers/equality";

/**
 * Hook that memoizes an array of objects.
 * The memoized array only changes when the items in the array change.
 * eg. If items === [{a: 1}, {a: 2}], and later [{a: 2}, {a: 1}] is passed in,
 * the hook returns the same items [{a: 1}, {a: 2}].
 * @param items Array of objects
 * @param key Function that returns identifier for each object
 * @param equalFn Function that determines whether or not two objects are equal
 * @returns Memoized array of objects
 */
export const useMemoizedArray = <T, K extends (number | string)>(
  items: T[],
  key: (item: T) => K,
  equalFn: (item1: T, item2: T) => boolean,
) => {
  const [arrayItems, setArrayItems] = useState<T[]>(items);

  useEffect(() => {
    if (!doUniqueArraysHaveSameObjects(
      arrayItems,
      items,
      key,
      equalFn,
    )) {
      setArrayItems(items);
    }
  }, [items]);

  return arrayItems;
};
