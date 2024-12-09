import { VehicleSubType } from "../../../../manageVehicles/types/Vehicle";

/**
 * Sort vehicle subtypes alphabetically.
 * @param vehicleType Vehicle type
 * @param subtypeOptions Vehicle subtype options
 * @returns Sorted list of vehicle subtypes
 */
export const sortVehicleSubtypes = (
  vehicleType: string,
  subtypeOptions: VehicleSubType[],
) => {
  if (!vehicleType) return [];

  // Make copy of original array (original shouldn't be changed)
  const sorted = [...subtypeOptions];
  sorted.sort((subtype1, subtype2) => subtype1.type.localeCompare(subtype2.type));

  return sorted;
};
