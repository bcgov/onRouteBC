import { useEffect, useMemo } from "react";

import { PermitVehicleDetails } from "../types/PermitVehicleDetails";
import { getUpdatedVehicleDetailsForLOAs } from "../helpers/permitLOA";
import { PermitLOA } from "../types/PermitLOA";
import { getEligibleSubtypeOptions } from "../helpers/permitVehicles";
import {
  PowerUnit,
  Trailer,
  VEHICLE_TYPES,
  VehicleSubType,
} from "../../manageVehicles/types/Vehicle";

export const usePermitVehicleForLOAs = (
  vehicleFormData: PermitVehicleDetails,
  vehicleOptions: (PowerUnit | Trailer)[],
  selectedLOAs: PermitLOA[],
  powerUnitSubtypes: VehicleSubType[],
  trailerSubtypes: VehicleSubType[],
  ineligiblePowerUnitSubtypes: VehicleSubType[],
  ineligibleTrailerSubtypes: VehicleSubType[],
  onClearVehicle: () => void,
) => {
  // Check to see if vehicle details is still valid after LOA has been deselected
  const {
    updatedVehicle,
    filteredVehicleOptions,
  } = useMemo(() => {
    return getUpdatedVehicleDetailsForLOAs(
      selectedLOAs,
      vehicleOptions,
      vehicleFormData,
      ineligiblePowerUnitSubtypes.map(({ typeCode }) => typeCode),
      ineligibleTrailerSubtypes.map(({ typeCode }) => typeCode),
    );
  }, [
    selectedLOAs,
    vehicleOptions,
    vehicleFormData,
    ineligiblePowerUnitSubtypes,
    ineligibleTrailerSubtypes,
  ]);

  const vehicleIdInForm = vehicleFormData.vehicleId;
  const updatedVehicleId = updatedVehicle.vehicleId;
  useEffect(() => {
    // If vehicle originally selected exists but the updated vehicle is cleared, clear the vehicle
    if (vehicleIdInForm && !updatedVehicleId) {
      onClearVehicle();
    }
  }, [
    vehicleIdInForm,
    updatedVehicleId,
  ]);

  // Get vehicle subtypes that are allowed by LOAs
  const vehicleType = vehicleFormData.vehicleType;
  const {
    subtypeOptions,
    isSelectedLOAVehicle,
  } = useMemo(() => {
    const permittedLOAPowerUnitIds = new Set([
      ...selectedLOAs.map(loa => loa.powerUnits)
        .reduce((prevPowerUnits, currPowerUnits) => [
          ...prevPowerUnits,
          ...currPowerUnits,
        ], []),
    ]);
  
    const permittedLOATrailerIds = new Set([
      ...selectedLOAs.map(loa => loa.trailers)
        .reduce((prevTrailers, currTrailers) => [
          ...prevTrailers,
          ...currTrailers,
        ], []),
    ]);
  
    // Try to find all of the unfiltered vehicles in the inventory, and get a list of their subtypes
    // as some of these unfiltered subtypes can potentially be used by a selected LOA
    const powerUnitsInInventory = vehicleOptions
      .filter(vehicle => vehicle.vehicleType === VEHICLE_TYPES.POWER_UNIT) as PowerUnit[];
  
    const trailersInInventory = vehicleOptions
      .filter(vehicle => vehicle.vehicleType === VEHICLE_TYPES.TRAILER) as Trailer[];
  
    const permittedLOAPowerUnitSubtypes = powerUnitsInInventory
      .filter(powerUnit => permittedLOAPowerUnitIds.has(powerUnit.powerUnitId as string))
      .map(powerUnit => powerUnit.powerUnitTypeCode);
  
    const permittedLOATrailerSubtypes = trailersInInventory
      .filter(trailer => permittedLOATrailerIds.has(trailer.trailerId as string))
      .map(trailer => trailer.trailerTypeCode);
  
    // Check if selected vehicle is an LOA vehicle
    const isSelectedLOAVehicle = Boolean(vehicleIdInForm)
      && (
        permittedLOAPowerUnitIds.has(vehicleIdInForm as string)
        || permittedLOATrailerIds.has(vehicleIdInForm as string)
      )
      && (
        powerUnitsInInventory.map(powerUnit => powerUnit.powerUnitId)
          .includes(vehicleIdInForm as string)
        || trailersInInventory.map(trailer => trailer.trailerId)
          .includes(vehicleIdInForm as string)
      );
  
    const subtypeOptions = getEligibleSubtypeOptions(
      powerUnitSubtypes,
      trailerSubtypes,
      ineligiblePowerUnitSubtypes,
      ineligibleTrailerSubtypes,
      permittedLOAPowerUnitSubtypes,
      permittedLOATrailerSubtypes,
      vehicleType,
    );

    return {
      subtypeOptions,
      isSelectedLOAVehicle,
    };
  }, [
    selectedLOAs,
    vehicleOptions,
    vehicleType,
    vehicleIdInForm,
    powerUnitSubtypes,
    trailerSubtypes,
    ineligiblePowerUnitSubtypes,
    ineligibleTrailerSubtypes,
  ]);

  return {
    filteredVehicleOptions,
    subtypeOptions,
    isSelectedLOAVehicle,
  };
};
