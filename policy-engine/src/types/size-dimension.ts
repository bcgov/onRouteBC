import {
  DimensionModifier,
  RegionSizeOverride,
  SelfIssuable,
} from 'onroute-policy-engine/types';

export type SizeDimension = SelfIssuable & {
  fp?: number;
  rp?: number;
  w?: number;
  h?: number;
  l?: number;
  modifiers?: Array<DimensionModifier>;
  regions?: Array<RegionSizeOverride>;
};
