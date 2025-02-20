import { getDefaultRequiredVal } from "../../../../../common/helpers/util";
import { PAYMENT_METHOD_TYPE_CODE } from "../../../../../common/types/paymentMethods";
import { isZeroAmount } from "../../../helpers/feeSummary";
import {
  StartTransactionRequestData,
  TRANSACTION_TYPES,
} from "../../../types/payment";
import { RefundFormData } from "../types/RefundFormData";

export const mapToRefundRequestData = (refundData: RefundFormData[]) => {
  const getRefundMethodType = (transaction: RefundFormData) => {
    return isZeroAmount(Number(transaction.refundAmount))
      ? PAYMENT_METHOD_TYPE_CODE.NP
      : transaction.chequeRefund
        ? PAYMENT_METHOD_TYPE_CODE.CHEQUE
        : transaction.paymentMethodTypeCode;
  };

  return refundData.map((transaction) => ({
    pgTransactionId: transaction.pgTransactionId,
    pgPaymentMethod: transaction.pgPaymentMethod,
    transactionAmount: Number(transaction.refundAmount),
    paymentCardTypeCode: transaction.paymentCardTypeCode,
    paymentMethodTypeCode: getRefundMethodType(transaction),
  }));
};

export const mapToZeroDollarRefundRequestData = (
  refundData: RefundFormData[],
  permitId: string,
): StartTransactionRequestData => {
  const reqData: StartTransactionRequestData = {
    transactionTypeId: TRANSACTION_TYPES.P,
    paymentMethodTypeCode: PAYMENT_METHOD_TYPE_CODE.NP,
    paymentCardTypeCode: getDefaultRequiredVal(
      refundData[0].paymentCardTypeCode,
      null,
    ),
    applicationDetails: [
      {
        applicationId: permitId,
        transactionAmount: 0,
      },
    ],
  };

  // TODO ask praveen if paymentCardType is necessary in this scenario?
  if (refundData[0].paymentCardTypeCode) {
    reqData.paymentCardTypeCode = refundData[0].paymentCardTypeCode;
  }

  return reqData;
};
