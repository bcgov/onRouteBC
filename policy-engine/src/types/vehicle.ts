import {
  SelfIssuable,
  SizeDimension,
  PowerUnitWeightDimension,
  TrailerWeightDimension,
} from 'onroute-policy-engine/types';

export type Vehicle = SelfIssuable & {
  type: string;
};

export type VehicleSizeConfiguration = Vehicle & {
  trailers: Array<TrailerSize>;
};

export type TrailerSize = Vehicle & {
  sizeDimensions?: Array<SizeDimension>;
  jeep: boolean;
  booster: boolean;
};

export type PowerUnitWeight = Vehicle & {
  weightDimensions?: Array<PowerUnitWeightDimension>;
};

export type TrailerWeight = Vehicle & {
  weightDimensions?: Array<TrailerWeightDimension>;
};
