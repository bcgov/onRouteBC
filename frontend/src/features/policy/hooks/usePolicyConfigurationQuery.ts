import { useQuery } from "@tanstack/react-query";

import { getPolicyConfiguration } from "../apiManager/policy";

const QUERY_KEYS = {
  POLICY_CONFIG: () => ["policy-config"],
};

/**
 * Hook to fetch the policy configuration.
 * @returns Query result of the policy configuration
 */
export const usePolicyConfigurationQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.POLICY_CONFIG(),
    queryFn: () => {
      return getPolicyConfiguration(true);
    },
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
};
