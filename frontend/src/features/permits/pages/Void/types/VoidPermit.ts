import { PermitStatus, PERMIT_STATUSES } from "../../../types/PermitStatus";
import { PermitsActionResponse } from "../../../types/permit";
import { TRANSACTION_TYPES, TransactionType } from "../../../types/payment";
import { Nullable } from "../../../../../common/types/common";
import {
  PaymentCardTypeCode,
  PaymentMethodTypeCode,
  PaymentGatewayMethod,
  PAYMENT_METHOD_TYPE_CODE,
} from "../../../../../common/types/paymentMethods";
import { RefundTransactionItem } from "../../Refund/types/RefundPermitData";

export interface VoidPermitFormData {
  permitId: string;
  reason: string;
  revoke: boolean;
  email?: Nullable<string>;
  additionalEmail?: Nullable<string>;
  fax?: Nullable<string>;
}

export interface VoidPermitRequestData {
  status: Extract<PermitStatus, typeof PERMIT_STATUSES.VOIDED>;
  transactions: RefundTransactionItem[];
  transactionTypeId: TransactionType;
  comment: string;
  fax?: Nullable<string>;
  additionalEmail?: Nullable<string>;
}

export interface RevokePermitRequestData {
  status: Extract<PermitStatus, typeof PERMIT_STATUSES.REVOKED>;
  paymentMethodTypeCode: typeof PAYMENT_METHOD_TYPE_CODE.NP;
  pgPaymentMethod?: PaymentGatewayMethod;
  transactionAmount: 0;
  comment: string;
  transactionTypeId: typeof TRANSACTION_TYPES.P;
  fax?: Nullable<string>;
  additionalEmail?: Nullable<string>;
}

export type VoidPermitResponseData = PermitsActionResponse;
