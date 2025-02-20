import { RequiredOrNull } from "../../../../../common/types/common";
import {
  PaymentCardTypeCode,
  PaymentGatewayMethod,
  PaymentMethodTypeCode,
} from "../../../../../common/types/paymentMethods";

export interface RefundTransactionItem {
  pgTransactionId: RequiredOrNull<string>;
  pgPaymentMethod: RequiredOrNull<PaymentGatewayMethod>;
  transactionAmount: number;
  paymentMethodTypeCode: PaymentMethodTypeCode;
  paymentCardTypeCode: RequiredOrNull<PaymentCardTypeCode>;
}

export interface RefundPermitData {
  applicationId: string;
  transactions: RefundTransactionItem[];
}
