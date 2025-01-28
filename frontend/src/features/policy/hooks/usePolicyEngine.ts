import { useMemo } from "react";
import { Policy } from "onroute-policy-engine";

import { usePolicyConfigurationQuery } from "./usePolicyConfigurationQuery";
import { isNull } from "../../../common/types/common";
import { SpecialAuthorizationData } from "../../settings/types/SpecialAuthorization";

/**
 * Hook that instantiates the policy engine instance.
 * The hook will return undefined when policy configuration is still loading,
 * and null when there's a problem getting the policy configuration.
 * @returns The instantiated policy engine, or undefined when loading, and null on error 
 */
export const usePolicyEngine = (specialAuthorizations?: SpecialAuthorizationData) => {
  const { data: policyConfiguration } = usePolicyConfigurationQuery();

  const policyEngine = useMemo(() => {
    if (isNull(policyConfiguration)) return null;
    if (!policyConfiguration) return undefined;

    return new Policy(policyConfiguration.policy);
  }, [policyConfiguration]);

  if (specialAuthorizations) {
    policyEngine?.setSpecialAuthorizations(specialAuthorizations);
  }

  return policyEngine;
};
