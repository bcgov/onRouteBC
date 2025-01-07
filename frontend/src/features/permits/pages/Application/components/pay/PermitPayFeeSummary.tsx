import { useContext, useEffect, useState } from "react";
import { Box, Button } from "@mui/material";

import "./PermitPayFeeSummary.scss";
import { PermitType } from "../../../../types/PermitType";
import { FeeSummary } from "../../../../components/feeSummary/FeeSummary";
import OnRouteBCContext from "../../../../../../common/authentication/OnRouteBCContext";
import { useFeatureFlagsQuery } from "../../../../../../common/hooks/hooks";

export const PermitPayFeeSummary = ({
  calculatedFee,
  permitType,
  selectedItemsCount,
  onPay,
  transactionPending,
}: {
  calculatedFee: number;
  permitType?: PermitType;
  selectedItemsCount: number;
  transactionPending: boolean;
  onPay: () => void;
}) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const disablePay = selectedItemsCount === 0;
  const { idirUserDetails } = useContext(OnRouteBCContext);
  const isStaffActingAsCompany = Boolean(idirUserDetails?.userRole);
  const { data: featureFlags } = useFeatureFlagsQuery();

  const handlePayNow = () => {
    if (disablePay) {
      setShowTooltip(true);
      return;
    }

    onPay();
  };

  useEffect(() => {
    if (!disablePay) {
      setShowTooltip(false);
    }
  }, [disablePay]);

  return (
    <Box className="permit-pay-fee-summary">
      <Box className="permit-pay-fee-summary__pay">
        <FeeSummary
          permitType={permitType}
          feeSummary={`${calculatedFee}`}
          hideDescriptions={true}
        />

        <div className="permit-pay-fee-summary__pay-btn">
          {showTooltip ? (
            <div className="permit-pay-fee-summary__btn-tooltip">
              Select at least one item to pay
            </div>
          ) : null}

          <Button
            data-testid="pay-now-btn"
            className="permit-pay-fee-summary__btn"
            variant="contained"
            onClick={handlePayNow}
            disabled={
              transactionPending ||
              (isStaffActingAsCompany &&
                featureFlags?.["STAFF-CAN-PAY"] !== "ENABLED")
            }
          >
            Pay Now
          </Button>
        </div>
      </Box>
    </Box>
  );
};
