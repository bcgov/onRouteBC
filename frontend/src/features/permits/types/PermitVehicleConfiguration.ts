import { Nullable } from "../../../common/types/common";

export interface VehicleInConfiguration {
  vehicleSubType: string;
}

export interface PermitVehicleConfiguration {
  overallLength?: Nullable<number>;
  overallWidth?: Nullable<number>;
  overallHeight?: Nullable<number>;
  frontProjection?: Nullable<number>;
  rearProjection?: Nullable<number>;
  trailers?: Nullable<VehicleInConfiguration[]>;
};
