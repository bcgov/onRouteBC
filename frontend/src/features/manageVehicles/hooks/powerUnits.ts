import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { QUERY_KEYS } from "./queryKeys";
import {
  addPowerUnit,
  deletePowerUnits,
  getAllPowerUnits,
  getPowerUnitSubTypes,
  updatePowerUnit,
} from "../apiManager/vehiclesAPI";

/**
 * Hook for fetching a list of power unit subtypes.
 * @returns Query object for fetching power unit subtypess
 */
export const usePowerUnitSubTypesQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.POWER_UNIT_SUBTYPES(),
    queryFn: getPowerUnitSubTypes,
    retry: false,
    refetchOnWindowFocus: false, // prevents unnecessary queries
  });
};

/**
 * Hook that fetches all power units of a given company.
 * @param companyId Id of company to fetch power units from
 * @param staleTime Number of milliseconds before refetching
 * @returns Query object for fetching power units
 */
export const usePowerUnitsQuery = (
  companyId: number,
  staleTime?: number,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.POWER_UNITS(),
    queryFn: () => getAllPowerUnits(companyId),
    placeholderData: (prev) => keepPreviousData(prev),
    staleTime,
    enabled: Boolean(companyId),
  });
};

/**
 * Hook that creates a power unit.
 * @returns Mutation object for creating a power unit
 */
export const useAddPowerUnitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPowerUnit,
    onSuccess: (response) => {
      if (response.status === 201) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.POWER_UNITS(),
        });
      } else {
        // Display Error in the form.
      }
    },
  });
};

/**
 * Hook that updates an existing power unit.
 * @returns Mutation object for updating a power unit
 */
export const useUpdatePowerUnitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePowerUnit,
    onSuccess: (response) => {
      if (response.status === 200) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.POWER_UNITS(),
        });
      } else {
        // Display Error in the form.
      }
    },
  });
};

/**
 * Hook that deletes one or more power units.
 * @returns Mutation object for deleting power units
 */
export const useDeletePowerUnitsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      vehicleIds,
    }: {
      companyId: number;
      vehicleIds: string[];
    }) => deletePowerUnits(vehicleIds, companyId),
    onSuccess: (response) => {
      if (response.status === 200) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.POWER_UNITS(),
        });
      }
    },
  });
};
