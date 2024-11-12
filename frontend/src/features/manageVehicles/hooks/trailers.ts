import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "./queryKeys";
import {
  addTrailer,
  deleteTrailers,
  getAllTrailers,
  getTrailerSubTypes,
  updateTrailer,
} from "../apiManager/vehiclesAPI";

/**
 * Hook that fetches a list of trailer subtypes.
 * @returns Query object for fetching trailer subtypes
 */
export const useTrailerSubTypesQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.TRAILER_SUBTYPES(),
    queryFn: getTrailerSubTypes,
    retry: false,
    refetchOnWindowFocus: false, // prevents unnecessary queries
  });
};

/**
 * Hook that fetches all trailers of a given company.
 * @param companyId Id of company to fetch power units from
 * @param staleTime Number of milliseconds before refetching
 * @returns Query object for fetching trailers
 */
export const useTrailersQuery = (
  companyId: number,
  staleTime?: number,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.TRAILERS(),
    queryFn: () => getAllTrailers(companyId),
    placeholderData: (prev) => keepPreviousData(prev),
    staleTime,
    enabled: Boolean(companyId),
  });
};

/**
 * Hook that creates a trailer.
 * @returns Mutation object for creating a trailer
 */
export const useAddTrailerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTrailer,
    onSuccess: (response) => {
      if (response.status === 200) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAILERS(),
        });
      } else {
        // Display Error in the form.
      }
    },
  });
};

/**
 * Hook that updates an existing trailer.
 * @returns Mutation object for updating trailer
 */
export const useUpdateTrailerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTrailer,
    onSuccess: (response) => {
      if (response.status === 200) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAILERS(),
        });
      } else {
        // Display Error in the form.
      }
    },
  });
};

/**
 * Hook that deletes one or more trailers.
 * @returns Mutation object for deleting trailers
 */
export const useDeleteTrailersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      vehicleIds,
    }: {
      companyId: number;
      vehicleIds: string[];
    }) => deleteTrailers(vehicleIds, companyId),
    onSuccess: (response) => {
      if (response.status === 200) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAILERS(),
        });
      }
    },
  });
};
