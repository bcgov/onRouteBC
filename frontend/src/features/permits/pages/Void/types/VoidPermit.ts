import { PermitStatus, PERMIT_STATUSES } from "../../../types/PermitStatus";
import { PermitsActionResponse } from "../../../types/permit";
import { TRANSACTION_TYPES, TransactionType } from "../../../types/payment";
import { Nullable } from "../../../../../common/types/common";
import {
  PAYMENT_METHOD_TYPE_CODE,
  PaymentMethodTypeCode,
} from "../../../../../common/types/paymentMethods";
import { RefundTransactionItem } from "../../Refund/types/RefundPermitData";

export interface VoidPermitFormData {
  permitId: string;
  reason: string;
  revoke: boolean;
  email?: Nullable<string>;
  additionalEmail?: Nullable<string>;
}

export interface VoidPermitRequestData {
  status: Extract<PermitStatus, typeof PERMIT_STATUSES.VOIDED>;
  transactions: RefundTransactionItem[];
  transactionTypeId: TransactionType;
  additionalEmail?: Nullable<string>;
}

export interface RevokePermitFormData {
  permitId: string;
  reason: string;
  revoke: boolean;
  email?: Nullable<string>;
  additionalEmail?: Nullable<string>;
  fax?: Nullable<string>;
}

type RevokeTransactionItem = Pick<
  RefundTransactionItem,
  "transactionAmount" | "paymentMethodTypeCode"
> & {
  transactionAmount: 0;
  paymentMethodTypeCode: Extract<
    PaymentMethodTypeCode,
    typeof PAYMENT_METHOD_TYPE_CODE.NP
  >;
};

export interface RevokePermitRequestData {
  status: Extract<PermitStatus, typeof PERMIT_STATUSES.REVOKED>;
  transactions: RevokeTransactionItem[];
  transactionTypeId: Extract<TransactionType, typeof TRANSACTION_TYPES.P>;
  comment: string;
  fax?: Nullable<string>;
  additionalEmail?: Nullable<string>;
}

export type VoidOrRevokePermitResponseData = PermitsActionResponse;
