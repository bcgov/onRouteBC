import { useEffect, useState } from "react";

/**
 * Hook that memoizes an object.
 * The memoized object only changes when its contents change.
 * eg. If obj === {a: 1, b: 2}, and later {b: 2, a: 1} is passed in,
 * the hook returns the same obj {a: 1, b: 2}.
 * @param obj An object
 * @param equalFn Function that determines whether or not two objects are equal
 * @returns Memoized object
 */
export const useMemoizedObject = <T>(
  obj: T,
  equalFn: (obj1: T, obj2: T) => boolean,
) => {
  const [memoizedObj, setMemoizedObj] = useState<T>(obj);

  useEffect(() => {
    if (!equalFn(memoizedObj, obj)) {
      setMemoizedObj(obj);
    }
  }, [obj]);

  return memoizedObj;
};

