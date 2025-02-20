import { isZeroAmount } from "../../../helpers/feeSummary";
import { PERMIT_STATUSES } from "../../../types/PermitStatus";
import { TRANSACTION_TYPES } from "../../../types/payment";

import {
  RevokePermitRequestData,
  VoidPermitFormData,
  VoidPermitRequestData,
} from "../types/VoidPermit";
import { RefundFormData } from "../../Refund/types/RefundFormData";
import { mapToRefundRequestData } from "../../Refund/helpers/mapper";
import { PAYMENT_METHOD_TYPE_CODE } from "../../../../../common/types/paymentMethods";

export const mapToVoidRequestData = (
  refundData: RefundFormData[],
  voidPermitFormData: VoidPermitFormData,
  amountToRefund: number,
): VoidPermitRequestData => {
  const isRefundZeroAmount = isZeroAmount(-1 * amountToRefund);

  const reqData: VoidPermitRequestData = {
    status: PERMIT_STATUSES.VOIDED,
    transactions: mapToRefundRequestData(refundData),
    transactionTypeId: isRefundZeroAmount
      ? TRANSACTION_TYPES.P
      : TRANSACTION_TYPES.R,
    comment: voidPermitFormData.reason,
  };

  if (voidPermitFormData.additionalEmail) {
    reqData.additionalEmail = voidPermitFormData.additionalEmail;
  }

  return reqData;
};

export const mapToRevokeRequestData = (
  voidPermitFormData: VoidPermitFormData,
): RevokePermitRequestData => {
  const reqData: RevokePermitRequestData = {
    status: PERMIT_STATUSES.REVOKED,
    transactions: [
      {
        transactionAmount: 0,
        paymentMethodTypeCode: PAYMENT_METHOD_TYPE_CODE.NP,
      },
    ],
    transactionTypeId: TRANSACTION_TYPES.P,
    comment: voidPermitFormData.reason,
  };

  if (voidPermitFormData.additionalEmail) {
    reqData.additionalEmail = voidPermitFormData.additionalEmail;
  }

  return reqData;
};
