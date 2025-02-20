import { useEffect, useState } from "react";
import { Policy } from "onroute-policy-engine";

import { PermitType } from "../types/PermitType";
import { ReplaceDayjsWithString } from "../types/utility";
import { PermitData } from "../types/PermitData";
import { Nullable } from "../../../common/types/common";
import { calculateAmountToRefund } from "../helpers/feeSummary";
import { PermitHistory } from "../types/PermitHistory";

/**
 * Hook that calculates the amount to refund for a permit.
 * (The policy engine calculates the fee in an async manner, hence this hook acts as a utility hook
 * to get the fee in a synchronous manner.)
 * 
 * @param permitHistory List of history objects that make up the history of a permit and its transactions
 * @param permit Object containing permit information (must have permitType and parts of permitData)
 * @param policyEngine Instance of policy engine, if it exists
 * @returns Amount to refund for the permit
 */
export const useCalculateRefundAmount = (
  permitHistory: PermitHistory[],
  permit: {
    permitType: PermitType;
    permitData: Partial<ReplaceDayjsWithString<PermitData>>;
  },
  policyEngine?: Nullable<Policy>,
) => {
  const [refundAmount, setRefundAmount] = useState<number>(0);

  useEffect(() => {
    const updateRefundAmount = async () => {
      const updatedRefundAmount = await calculateAmountToRefund(
        permitHistory,
        permit,
        policyEngine,
      );

      setRefundAmount(updatedRefundAmount);
    };

    updateRefundAmount();
  }, [permit, policyEngine]);

  return refundAmount;
};
