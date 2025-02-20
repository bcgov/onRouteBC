import { useEffect, useState } from "react";
import { Policy } from "onroute-policy-engine";

import { PermitType } from "../types/PermitType";
import { ReplaceDayjsWithString } from "../types/utility";
import { PermitData } from "../types/PermitData";
import { Nullable } from "../../../common/types/common";
import { calculatePermitFee } from "../helpers/feeSummary";

/**
 * Hook that calculates the fee for a permit.
 * (The policy engine calculates the fee in an async manner, hence this hook acts as a utility hook
 * to get the fee in a synchronous manner.)
 * 
 * @param permit Object containing permit information (must have permitType and parts of permitData)
 * @param policyEngine Instance of policy engine, if it exists
 * @returns Fee to be paid for the permit
 */
export const useCalculatePermitFee = (
  permit: {
    permitType: PermitType;
    permitData: Partial<ReplaceDayjsWithString<PermitData>>;
  },
  policyEngine?: Nullable<Policy>,
) => {
  const [fee, setFee] = useState<number>(0);

  useEffect(() => {
    const updateFee = async () => {
      const updatedFee = await calculatePermitFee(permit, policyEngine);
      setFee(updatedFee);
    };

    updateFee();
  }, [permit, policyEngine]);

  return fee;
};
