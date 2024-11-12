import { Nullable } from "../../../common/types/common";

export const QUERY_KEYS = {
  POWER_UNIT_SUBTYPES: () => ["powerUnitSubTypes"],
  POWER_UNITS: () => ["powerUnits"],
  POWER_UNIT: (companyId: string | number, vehicleId?: Nullable<string>) =>
    ["powerUnit", vehicleId, companyId],
  TRAILER_SUBTYPES: () => ["trailerSubTypes"],
  TRAILERS: () => ["trailers"],
  TRAILER: (companyId: string | number, vehicleId?: Nullable<string>) =>
    ["trailer", vehicleId, companyId],
};
