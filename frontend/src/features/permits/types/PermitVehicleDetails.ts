import { Nullable } from "../../../common/types/common";
import { VEHICLE_TYPES } from "../../manageVehicles/types/Vehicle";

export interface PermitVehicleDetails {
  vin: string;
  plate: string;
  make: string;
  year: Nullable<number>;
  countryCode: string;
  provinceCode: string;
  vehicleType: string;
  vehicleSubType: string;
  saveVehicle?: Nullable<boolean>;
  unitNumber?: Nullable<string>;
  vehicleId: Nullable<string>; // either powerUnitId or trailerId, depending on vehicleType
  licensedGVW?: Nullable<number>;
}

export const DEFAULT_VEHICLE_TYPE = VEHICLE_TYPES.POWER_UNIT;

export const EMPTY_VEHICLE_DETAILS = {
  vehicleId: "",
  unitNumber: "",
  vin: "",
  plate: "",
  make: "",
  year: null,
  countryCode: "",
  provinceCode: "",
  vehicleType: DEFAULT_VEHICLE_TYPE,
  vehicleSubType: "",
  licensedGVW: null,
};
