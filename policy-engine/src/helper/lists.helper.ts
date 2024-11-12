import { IdentifiedObject } from 'onroute-policy-engine/types';

/**
 * Extracts a map containing just the ID and name of each of the supplied
 * identified objects.
 * @param objects List of identified objects to extract id and name from.
 * @param filter Optional list of IDs to constrain the map to. Only objects
 *   with an ID matching one of the elements in the filter will
 *   be returned. If no filter supplied, all objects will be returned.
 * @returns Map of object ID to object name.
 */
export function extractIdentifiedObjects(
  objects: Array<IdentifiedObject>,
  filter?: Array<string>,
): Map<string, string> {
  const objectMap: Map<string, string> = new Map<string, string>();
  objects.forEach((o) => {
    if (!filter || filter.includes(o.id)) {
      objectMap.set(o.id, o.name);
    }
  });
  return objectMap;
}

/**
 * Intersects two maps containing string id and string description to
 * return a new map containing those entries common to both.
 * This only checks that the keys are common, not the values. If the
 * values are different, this returns the value from the first map.
 * If any values in the first map are null or undefined, these will
 * be replaced with empty string.
 * @param first The first map
 * @param second The second map
 * @returns New map containing entries common to both input maps
 */
export function intersectIdMaps(
  first: Map<string, string>,
  second: Map<string, string>,
): Map<string, string> {
  const combinedMap = new Map<string, string>();
  for (const key in first.keys()) {
    if (second.has(key)) {
      combinedMap.set(key, first.get(key) ?? '');
    }
  }
  return combinedMap;
}

export function getIdFromName(
  list: Array<IdentifiedObject>,
  name: string,
): string | null {
  let id: string | null = null;

  const identifiedObject = list.find((i) => i.name == name);
  if (identifiedObject) {
    id = identifiedObject.id;
  }

  return id;
}
