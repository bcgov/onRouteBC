import { useQuery } from "@tanstack/react-query";

import { httpGETGeocoder } from "../apiManager/geocoder";
import { GeocoderQueryOptions } from "../types/geocoder";

const QUERY_KEYS = {
  ADDRESS: (
    address: string,
    queryOptions?: GeocoderQueryOptions,
  ) => ["address", address, queryOptions] as const,
} as const;

export const useGeocoder = ({
  address,
  enableSearch,
  queryOptions,
}: {
  address: string;
  enableSearch: boolean;
  queryOptions?: GeocoderQueryOptions;
}) => {
  return useQuery({
    queryKey: QUERY_KEYS.ADDRESS(address, queryOptions),
    queryFn: () => httpGETGeocoder(address, queryOptions),
    retry: false,
    refetchOnWindowFocus: false, // prevents unnecessary queries
    enabled: enableSearch,
  });
};
