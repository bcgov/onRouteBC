import { httpGETRequest } from "../../../common/apiManager/httpRequestHandler";
import { POLICY_CONFIG_API_ROUTES } from "./endpoints/endpoints";
import { RequiredOrNull } from "../../../common/types/common";
import { PolicyConfiguration } from "../types/PolicyConfiguration";

/**
 * Get the policy configuration.
 * @param isCurrent Whether or not to get the most current policy configuration
 * @returns Policy configuration
 */
export const getPolicyConfiguration = async (
  isCurrent: boolean,
): Promise<RequiredOrNull<PolicyConfiguration>> => {
  const response = await httpGETRequest(
    POLICY_CONFIG_API_ROUTES.GET_ALL(isCurrent),
  );

  const policyConfigurations = response.data as PolicyConfiguration[];
  return policyConfigurations.length > 0 ? policyConfigurations[0] : null;
};

