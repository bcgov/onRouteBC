import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { Nullable } from "../../../common/types/common";
import {
  createLOA,
  getLOADetail,
  getLOAs,
  removeLOA,
  removeLOADocument,
  updateLOA,
} from "../apiManager/loa";

const QUERY_KEYS = {
  LOAS: (expired: boolean) => ["loas", expired],
  LOA: (loaId?: Nullable<number>) => ["loa", loaId],
};

/**
 * Hook to fetch the LOAs for a company.
 * @param companyId Company id of the company to fetch LOAs for
 * @param expired Whether or not to only fetch expired LOAs
 * @returns Query result of the company's LOAs
 */
export const useFetchLOAs = (companyId: number | string, expired: boolean) => {
  return useQuery({
    queryKey: QUERY_KEYS.LOAS(expired),
    queryFn: () => getLOAs(companyId, expired),
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch the LOA details for a company's LOA.
 * @param companyId Company id of the company to fetch LOA for
 * @param loaId id of the LOA to fetch
 * @returns Query result of the LOA details
 */
export const useFetchLOADetail = (companyId: number, loaId?: Nullable<number>) => {
  return useQuery({
    queryKey: QUERY_KEYS.LOA(loaId),
    queryFn: () => {
      if (!loaId) return undefined;
      return getLOADetail(companyId, loaId);
    },
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    enabled: Boolean(loaId),
  });
};

/**
 * Hook to create an LOA for a company.
 * @returns Result of creating the LOA
 */
export const useCreateLOAMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLOA,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LOAS(false),
      });
    },
  });
};

/**
 * Hook to update an LOA for a company.
 * @returns Result of updating the LOA
 */
export const useUpdateLOAMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLOA,
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LOAS(false),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LOAS(true),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LOA(response.data.loaId),
      });
    },
  });
};

/**
 * Hook to remove an LOA for a company.
 * @returns Result of removing the LOA
 */
export const useRemoveLOAMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeLOA,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LOAS(false),
      });
    },
  });
};

/**
 * Hook to remove the document for an LOA.
 * @returns Result of removing the LOA document
 */
export const useRemoveLOADocumentMutation = () => {
  return useMutation({
    mutationFn: removeLOADocument,
  });
};
