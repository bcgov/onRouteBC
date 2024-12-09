import { Nullable } from "../../../common/types/common";

export type Vehicle = PowerUnit | Trailer;

export const VEHICLE_TYPES = {
  POWER_UNIT: "powerUnit",
  TRAILER: "trailer",
} as const;

export type VehicleType = (typeof VEHICLE_TYPES)[keyof typeof VEHICLE_TYPES];

/**
 * A base vehicle type. This is an incomplete object and meant to be extended for use.
 */
export interface BaseVehicle {
  unitNumber?: string;
  plate: string;
  provinceCode: string;
  countryCode: string;
  make: string;
  vin: string;
  year: Nullable<number>;
  createdDateTime?: Nullable<string>;
  updatedDateTime?: Nullable<string>;
  vehicleType?: VehicleType;
}

export interface PowerUnit extends BaseVehicle {
  powerUnitId?: string;
  licensedGvw?: Nullable<number>;
  steerAxleTireSize?: Nullable<number>;
  powerUnitTypeCode: string;
}

export interface Trailer extends BaseVehicle {
  trailerId?: string;
  trailerTypeCode: string;
  emptyTrailerWidth?: Nullable<number>;
}

/**
 * Object type for power unit and trailer subtypes.
 */
export interface VehicleSubType {
  typeCode: string;
  type: string;
  description: string;
}

/**
 * Request data type for creating a power unit.
 */
export type PowerUnitCreateData = PowerUnit;

/**
 * Request data type for creating a trailer.
 */
export type TrailerCreateData = Trailer;

/**
 * Request data type for updating a power unit.
 */
export type PowerUnitUpdateData = PowerUnit;

/**
 * Request data type for updating a trailer.
 */
export type TrailerUpdateData = Trailer;

/**
 * Enum indicating the options of axle front group.
 */
export enum AxleFrontGroup {
  Single = "Single",
  Tandem = "Tandem",
  Tridem = "Tridem",
}

/**
 * Enum indicating the types of axle.
 */
export enum AxleType {
  Steering = "Steering",
  Drive = "Drive",
}

/**
 * Object type for an axle group.
 */
export interface AxleGroup {
  axleFrontGroup: AxleFrontGroup;
  axleTypeFront: AxleType;
  axleTypeRear: AxleType;
  axleGroupNumber: number;
  axleGroupSpacing: number;
  interaxleSpreadFront: number;
  interaxleSpreadRear: number;
  numberOfTiresFront: number;
  numberOfTiresRear: number;
}
