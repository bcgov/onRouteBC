import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSpecialAuthorizations, updateLCV, updateNoFee } from "../apiManager/specialAuthorization";

const QUERY_KEYS = {
  SPECIAL_AUTH: (companyId: number | string) => ["special-auth", `${companyId}`],
};

/**
 * Hook to fetch the special authorizations info for a company.
 * @param companyId Company id of the company to fetch special authorizations info for
 * @returns Query result of the company's special authorizations info
 */
export const useFetchSpecialAuthorizations = (
  companyId: number | string,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.SPECIAL_AUTH(companyId),
    queryFn: () => {
      return getSpecialAuthorizations(companyId);
    },
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    enabled,
  });
};

/**
 * Hook to update the no-fee permit flag for a company.
 * @returns Result of updating the no-fee permit flag
 */
export const useUpdateNoFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNoFee,
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SPECIAL_AUTH(response.data.companyId),
      });
    },
  });
};

/**
 * Hook to update the LCV flag for a company.
 * @returns Result of updating the LCV flag
 */
export const useUpdateLCV = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLCV,
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SPECIAL_AUTH(response.data.companyId),
      });
    },
    onError: () => {
      console.error("Error updating LCV");
    },
  });
};
