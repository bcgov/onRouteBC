import { useQuery } from "@tanstack/react-query";
import { httpGETRequest } from "../apiManager/httpRequestHandler";
import { VEHICLES_URL } from "../apiManager/endpoints/endpoints";
import { useAuth } from "react-oidc-context";

/**
 * Fetch the FeatureFlags from the API.
 * @returns An object containing the feature flags.
 */
export const getFeatureFlags = async (): Promise<Record<string, string>> => {
  const url = `${VEHICLES_URL}/feature-flags`;
  return httpGETRequest(url).then((response) => response.data);
};

/**
 * A custom react query hook that fetches the feature flags.
 */
export const useFeatureFlagsQuery = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["featureFlags"],
    queryFn: getFeatureFlags,
    enabled: !!user,
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false, // prevent unnecessary multiple queries on page showing up in foreground
  });
};
