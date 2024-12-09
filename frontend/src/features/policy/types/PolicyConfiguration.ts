import { PolicyDefinition } from "onroute-policy-engine/types";

export interface PolicyConfiguration {
  policyConfigId: number;
  effectiveDate: string;
  isDraft: boolean;
  changeDescription: string;
  policy: PolicyDefinition;
}
