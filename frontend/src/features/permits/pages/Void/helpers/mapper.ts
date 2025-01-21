import { getDefaultRequiredVal } from "../../../../../common/helpers/util";
import { isZeroAmount } from "../../../helpers/feeSummary";
import { PERMIT_STATUSES } from "../../../types/PermitStatus";
import { TRANSACTION_TYPES } from "../../../types/payment";
import { RefundFormData } from "../../Refund/types/RefundFormData";
import {
  CONSOLIDATED_PAYMENT_METHODS,
  PAYMENT_METHOD_TYPE_CODE,
} from "../../../../../common/types/paymentMethods";

import {
  RevokePermitRequestData,
  VoidPermitFormData,
  VoidPermitRequestData,
} from "../types/VoidPermit";

export const mapToRevokeRequestData = (
  voidPermitFormData: VoidPermitFormData,
): RevokePermitRequestData => {
  const reqData: RevokePermitRequestData = {
    status: PERMIT_STATUSES.REVOKED,
    paymentMethodTypeCode: PAYMENT_METHOD_TYPE_CODE.NP,
    transactionAmount: 0,
    comment: voidPermitFormData.reason,
    transactionTypeId: TRANSACTION_TYPES.P,
  };

  if (voidPermitFormData.additionalEmail) {
    reqData.additionalEmail = voidPermitFormData.additionalEmail;
  }

  return reqData;
};

export const mapToVoidRequestData = (
  voidPermitFormData: VoidPermitFormData,
  refundData: RefundFormData,
  amountToRefund: number,
): VoidPermitRequestData => {
  const isRefundZeroAmount = isZeroAmount(amountToRefund);

  const getRefundMethodType = () => {
    if (isRefundZeroAmount) return PAYMENT_METHOD_TYPE_CODE.NP;

    const refundMethodTypeCode = getDefaultRequiredVal(
      PAYMENT_METHOD_TYPE_CODE.WEB,
      CONSOLIDATED_PAYMENT_METHODS[refundData.refundMethod]
        ?.paymentMethodTypeCode,
    );

    return refundData.shouldUsePrevPaymentMethod
      ? refundMethodTypeCode
      : PAYMENT_METHOD_TYPE_CODE.CHEQUE;
  };

  const getRefundCardType = () => {
    if (isRefundZeroAmount || !refundData.shouldUsePrevPaymentMethod) {
      return undefined;
    }

    return CONSOLIDATED_PAYMENT_METHODS[refundData.refundMethod]
      ?.paymentCardTypeCode;
  };

  const reqData: VoidPermitRequestData = {
    status: PERMIT_STATUSES.VOIDED,
    pgTransactionId: refundData.transactionId,
    paymentMethodTypeCode: getRefundMethodType(),
    transactionAmount: amountToRefund,
    pgPaymentMethod: refundData.refundOnlineMethod
      ? refundData.refundOnlineMethod
      : undefined,
    pgCardType: getRefundCardType(),
    comment: voidPermitFormData.reason,
    transactionTypeId: isRefundZeroAmount
      ? TRANSACTION_TYPES.P
      : TRANSACTION_TYPES.R,
  };

  if (voidPermitFormData.additionalEmail) {
    reqData.additionalEmail = voidPermitFormData.additionalEmail;
  }

  return reqData;
};
