import { useQuery } from "@tanstack/react-query";

import { VEHICLE_TYPES, VehicleType } from "../types/Vehicle";
import { QUERY_KEYS } from "./queryKeys";
import { getPowerUnit, getTrailer } from "../apiManager/vehiclesAPI";
import { getDefaultRequiredVal } from "../../../common/helpers/util";
import { Nullable } from "../../../common/types/common";

/**
 * Hook that fetches vehicle details for a company.
 * @param companyId Id of company to fetch vehicle details for
 * @param vehicleType Type of the vehicle to be fetched
 * @param vehicleId Id of the vehicle to be fetched
 * @returns Query Results
 */
export const useVehicleByIdQuery = (
  companyId: number,
  vehicleType: VehicleType,
  vehicleId?: Nullable<string>,
) => {
  const queryKey = vehicleType === VEHICLE_TYPES.POWER_UNIT
    ? QUERY_KEYS.POWER_UNIT(companyId, vehicleId)
    : QUERY_KEYS.TRAILER(companyId, vehicleId);

  const vehicleIdStr = getDefaultRequiredVal("", vehicleId);
  
  return useQuery({
    queryKey,
    queryFn: async () => vehicleType === VEHICLE_TYPES.POWER_UNIT
      ? await getPowerUnit(vehicleIdStr, companyId)
      : await getTrailer(vehicleIdStr, companyId),
    retry: false,
    refetchOnMount: "always", // always fetch when component is mounted
    refetchOnWindowFocus: false, // prevent unnecessary multiple queries on page showing up in foreground
    enabled: Boolean(companyId) && Boolean(vehicleId), // does not perform the query at all if company or vehicle id is empty
    gcTime: 0, // Do not store in cache - Refetch always
  });
};
