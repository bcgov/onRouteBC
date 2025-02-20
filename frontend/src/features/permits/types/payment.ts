import { Nullable, NullableFields } from "../../../common/types/common";
import {
  PaymentCardTypeCode,
  PaymentMethodTypeCode,
  PaymentGatewayMethod,
} from "../../../common/types/paymentMethods";

export interface PayBCPaymentDetails {
  authCode?: Nullable<string>;
  avsAddrMatch: string;
  avsId: string;
  avsMessage: string;
  avsPostalMatch: string;
  avsProcessed: string;
  avsResult: string;
  cardType: string;
  cvdId?: Nullable<number>;
  trnApproved: number;
  messageId?: Nullable<number>;
  messageText: string;
  paymentMethod: PaymentGatewayMethod;
  ref1: string;
  ref2: string;
  ref3: string;
  ref4: string;
  ref5: string;
  responseType: string;
  trnAmount: number;
  trnCustomerName: string;
  trnDate: string;
  trnEmailAddress: string;
  trnId: string;
  trnLanguage: string;
  trnOrderNumber: string;
  trnPhoneNumber: string;
  trnType: string;
}

export const TRANSACTION_TYPES = {
  P: "P",
  R: "R",
  VP: "VP",
  VR: "VR",
  PA: "PA",
  PAC: "PAC",
  Q: "Q",
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export interface PaymentGatewayData {
  pgTransactionId: string;
  pgApproved: number;
  pgAuthCode: string;
  pgCardType: PaymentCardTypeCode;
  pgTransactionDate: string;
  pgCvdId: number;
  pgPaymentMethod: PaymentGatewayMethod;
  pgMessageId: number;
  pgMessageText: string;
}

export interface StartTransactionRequestData
  extends NullableFields<PaymentGatewayData> {
  transactionTypeId: TransactionType;
  paymentMethodTypeCode: PaymentMethodTypeCode;
  paymentCardTypeCode?: Nullable<PaymentCardTypeCode>;
  applicationDetails: {
    applicationId: string;
    transactionAmount: number;
  }[];
}

export interface StartTransactionResponseData
  extends NullableFields<PaymentGatewayData> {
  transactionId: string;
  transactionTypeId: TransactionType;
  paymentMethodTypeCode: PaymentMethodTypeCode;
  paymentCardTypeCode?: Nullable<PaymentCardTypeCode>;
  payerName: string;
  totalTransactionAmount: number;
  transactionSubmitDate: string;
  transactionOrderNumber: string;
  applicationDetails: {
    applicationId: string;
    transactionAmount: number;
  }[];
  url?: string;
}

export type CompleteTransactionRequestData = NullableFields<PaymentGatewayData>;

export interface CompleteTransactionResponseData
  extends NullableFields<PaymentGatewayData> {
  transactionId: string;
}
