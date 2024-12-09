import { VEHICLE_CHOOSE_FROM, VehicleChooseFrom } from "../../constants/constants";
import {
  BaseVehicle,
  Vehicle,
  VEHICLE_TYPES,
} from "../../../manageVehicles/types/Vehicle";

/**
 * Compare two vehicles by plate.
 * @param vehicle1 First vehicle
 * @param vehicle2 Second vehicle
 * @returns Result of the compare operation between the two vehicles' plates
 */
const compareVehiclesByPlate = (vehicle1: BaseVehicle, vehicle2: BaseVehicle) => {
  return vehicle1.plate.localeCompare(vehicle2.plate);
};

/**
 * Compare two vehicles by unit number.
 * @param vehicle1 First vehicle
 * @param vehicle2 Second vehicle
 * @returns Result of the compare operation between the two vehicles' unit numbers
 */
const compareVehiclesByUnitNumber = (vehicle1: BaseVehicle, vehicle2: BaseVehicle) => {
  if (!vehicle1.unitNumber && !vehicle2.unitNumber)
    return 0;

  if (!vehicle1.unitNumber) return 1;
  if (!vehicle2.unitNumber) return -1;
  return vehicle1.unitNumber.localeCompare(vehicle2.unitNumber);
};

/**
 * Compare two vehicles by vehicle type.
 * @param vehicle1 First vehicle
 * @param vehicle2 Second vehicle
 * @returns Result of the compare operation between the two vehicles' types
 */
const compareVehiclesByVehicleType = (vehicle1: BaseVehicle, vehicle2: BaseVehicle) => {
  if (!vehicle1.vehicleType && !vehicle2.vehicleType)
    return 0;

  if (!vehicle1.vehicleType) return 1;
  if (!vehicle2.vehicleType) return -1;
  if (vehicle1.vehicleType === vehicle2.vehicleType) return 0;

  return vehicle1.vehicleType === VEHICLE_TYPES.POWER_UNIT ? -1 : 1;
};

/**
 * Sort vehicles (by plate or unit number) alphabetically.
 * @param vehicles Vehicles to sort
 * @param sortBy Sort key (by plate or unit number)
 * @returns Sorted vehicles
 */
export const sortVehicles = (
  vehicles: Vehicle[],
  sortBy: VehicleChooseFrom,
) => {
  // We shouldn't change original array, but make an copy and sort on that instead
  const sortedVehicles = [...vehicles];
  sortedVehicles.sort((vehicle1, vehicle2) => {
    const compareByVehicleTypeResult = compareVehiclesByVehicleType(vehicle1, vehicle2);
    if (compareByVehicleTypeResult !== 0) return compareByVehicleTypeResult;

    if (sortBy === VEHICLE_CHOOSE_FROM.PLATE) {
      return compareVehiclesByPlate(vehicle1, vehicle2);
    }
    return compareVehiclesByUnitNumber(vehicle1, vehicle2);
  });

  return sortedVehicles;
};
