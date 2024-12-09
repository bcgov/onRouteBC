import { POLICY_URL } from "../../../../common/apiManager/endpoints/endpoints";

const POLICY_CONFIG_API_BASE = `${POLICY_URL}/policy-configurations`;

export const POLICY_CONFIG_API_ROUTES = {
  GET_ALL: (isCurrent: boolean) => `${POLICY_CONFIG_API_BASE}?isCurrent=${isCurrent}`,
  GET: (policyConfigId: number | string) => `${POLICY_CONFIG_API_BASE}/${policyConfigId}`,
  GET_DRAFT: () => `${POLICY_CONFIG_API_BASE}/draft`,
};
