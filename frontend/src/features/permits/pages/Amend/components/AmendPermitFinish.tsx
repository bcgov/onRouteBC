import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./AmendPermitFinish.scss";
import { AmendPermitContext } from "../context/AmendPermitContext";
import { calculateAmountToRefund } from "../../../helpers/feeSummary";
import { PERMIT_REFUND_ACTIONS, RefundPage } from "../../Refund/RefundPage";
import { RefundFormData } from "../../Refund/types/RefundFormData";
import { Breadcrumb } from "../../../../../common/components/breadcrumb/Breadcrumb";
import { serializeAmendRefundData } from "./helpers/serializeAmendRefundData";
import { useIssuePermits, useStartTransaction } from "../../../hooks/hooks";
import { isValidTransaction } from "../../../helpers/payment";
import { hasPermitsActionFailed } from "../../../helpers/permitState";
import { ERROR_ROUTES } from "../../../../../routes/constants";
import { applyWhenNotNullable, getDefaultRequiredVal } from "../../../../../common/helpers/util";
import { DEFAULT_PERMIT_TYPE } from "../../../types/PermitType";

export const AmendPermitFinish = () => {
  const navigate = useNavigate();
  const { companyId: companyIdParam } = useParams();
  const companyId: number = applyWhenNotNullable(id => Number(id), companyIdParam, 0);

  const {
    permit,
    amendmentApplication,
    permitHistory,
    getLinks,
    afterFinishAmend,
  } = useContext(AmendPermitContext);

  const validTransactionHistory = permitHistory.filter((history) =>
    isValidTransaction(history.paymentMethodTypeCode, history.pgApproved),
  );

  const permitId = getDefaultRequiredVal("", amendmentApplication?.permitId);

  const amountToRefund =
    -1 *
    calculateAmountToRefund(
      validTransactionHistory,
      getDefaultRequiredVal(
        0,
        amendmentApplication?.permitData?.permitDuration,
      ),
      getDefaultRequiredVal(
        DEFAULT_PERMIT_TYPE,
        amendmentApplication?.permitType,
        permit?.permitType,
      ),
    );

  const { mutation: startTransactionMutation, transaction } =
    useStartTransaction();

  const { mutation: issuePermitMutation, issueResults } =
    useIssuePermits();

  useEffect(() => {
    if (typeof transaction !== "undefined") {
      // refund transaction response received
      if (!transaction) {
        // refund transaction failed
        console.error("Refund failed.");
        navigate(ERROR_ROUTES.UNEXPECTED);
      } else {
        // refund transaction successful, proceed to issue permit
        issuePermitMutation.mutate({
          companyId,
          applicationIds: [permitId],
        });
      }
    }
  }, [transaction, permitId, companyId]);

  useEffect(() => {
    const issueFailed = hasPermitsActionFailed(issueResults);
    if (issueFailed) {
      console.error("Permit issuance failed.");
      navigate(ERROR_ROUTES.UNEXPECTED);
    } else if (getDefaultRequiredVal(0, issueResults?.success?.length) > 0) {
      // Navigate back to search page upon issue success
      afterFinishAmend();
    }
  }, [issueResults]);

  const handleFinish = (refundData: RefundFormData) => {
    const requestData = serializeAmendRefundData(
      refundData,
      -1 * amountToRefund,
      permitId,
    );

    startTransactionMutation.mutate(requestData);
  };

  return (
    <div className="amend-permit-finish">
      <Breadcrumb links={getLinks()} />

      <RefundPage
        permitHistory={validTransactionHistory}
        amountToRefund={amountToRefund}
        permitNumber={permit?.permitNumber}
        permitType={permit?.permitType}
        permitAction={PERMIT_REFUND_ACTIONS.AMEND}
        onFinish={handleFinish}
      />
    </div>
  );
};
