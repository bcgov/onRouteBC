import { tros, trow } from "./termOversizeConstants.json";
import { Commodities } from "../types/application";

export const TROS_PERMIT_DURATIONS = [
  { value: 30, label: "30 Days" },
  { value: 60, label: "60 Days" },
  { value: 90, label: "90 Days" },
  { value: 120, label: "120 Days" },
  { value: 150, label: "150 Days" },
  { value: 180, label: "180 Days" },
  { value: 210, label: "210 Days" },
  { value: 240, label: "240 Days" },
  { value: 270, label: "270 Days" },
  { value: 300, label: "300 Days" },
  { value: 330, label: "330 Days" },
  { value: 365, label: "1 Year" },
];

// TROS
export const TROS_INELIGIBLE_POWERUNITS = [...tros.ineligiblePowerUnitSubtypes];
export const TROS_INELIGIBLE_TRAILERS = [...tros.ineligibleTrailerSubtypes];
export const TROS_COMMODITIES: Commodities[] = [...tros.commodities];

// TROW
export const TROW_INELIGIBLE_POWERUNITS = [...trow.ineligiblePowerUnitSubtypes];
export const TROW_INELIGIBLE_TRAILERS = [...trow.ineligibleTrailerSubtypes];
export const TROW_COMMODITIES: Commodities[] = [...trow.commodities];
