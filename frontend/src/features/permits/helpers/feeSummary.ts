import { Policy } from "onroute-policy-engine";

import { PermitData } from "../types/PermitData";
import { PermitHistory } from "../types/PermitHistory";
import { TRANSACTION_TYPES, TransactionType } from "../types/payment";
import { Permit } from "../types/permit";
import { isValidTransaction } from "./payment";
import { Nullable } from "../../../common/types/common";
import { PERMIT_STATES, getPermitState } from "./permitState";
import { PermitType } from "../types/PermitType";
import { ReplaceDayjsWithString } from "../types/utility";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../common/helpers/util";

/**
 * Calculates the fee for a permit.
 * @param permit Object containing permit information (must have permitType and parts of permitData)
 * @param policyEngine Instance of policy engine, if it exists
 * @returns Fee to be paid for the permit
 */
export const calculatePermitFee = async (
  permit: {
    permitType: PermitType;
    permitData: Partial<ReplaceDayjsWithString<PermitData>>;
  },
  policyEngine?: Nullable<Policy>,
) => {
  const validationResults = await policyEngine?.validate(permit);
  const fee = getDefaultRequiredVal([], validationResults?.cost)
    .map(({ cost }) => getDefaultRequiredVal(0, cost))
    .reduce((cost1, cost2) => cost1 + cost2, 0);
  
  return fee;
};

/**
 * Gets full display text for fee summary.
 * @param feeSummary fee summary field for a permit (if exists)
 * @returns display text for the fee summary (currency amount to 2 decimal places)
 */
export const feeSummaryDisplayText = (feeSummary?: Nullable<string>) => {
  const feeFromSummary = applyWhenNotNullable(
    (numericStr) => Number(numericStr).toFixed(2),
    feeSummary,
  );
    
  const fee = getDefaultRequiredVal("0.00", feeFromSummary);
  const numericFee = Number(fee);
  return numericFee >= 0 ? `$${fee}` : `-$${(numericFee * -1).toFixed(2)}`;
};

/**
 * Determines whether or not the transaction type of a transaction was a refund.
 * @param transactionType Transaction type of a transaction
 * @returns whether or not the transaction type was a refund
 */
export const isTransactionTypeRefund = (transactionType: TransactionType) => {
  return transactionType === TRANSACTION_TYPES.R;
};

/**
 * Calculates the net amount from the history of transactions for a permit.
 * A positive amount represents the net amount that was paid for a permit, and
 * a negative amount represents the net amount that was refunded for a permit, and
 * a 0 amount means that the permit is completely paid with no amount outstanding.
 * @param permitHistory List of history objects that make up the history of a permit
 * @returns total net amount resulting from the history of transactions for the permit
 */
export const calculateNetAmount = (permitHistory: PermitHistory[]) => {
  return permitHistory
    .filter((permit) =>
      isValidTransaction(permit.paymentMethodTypeCode, permit.pgApproved),
    )
    .map((permit) =>
      isTransactionTypeRefund(permit.transactionTypeId)
        ? -1 * permit.transactionAmount
        : permit.transactionAmount,
    )
    .reduce((prev, curr) => prev + curr, 0);
};

/**
 * Calculates the amount that needs to be refunded (or paid if amount is negative) for a permit.
 * @param permitHistory List of history objects that make up the history of a permit and its transactions
 * @param permit Object containing permit information (must have permitType and parts of permitData)
 * @param policyEngine Instance of policy engine, if it exists
 * @returns Amount that needs to be refunded, or if negative then the amount that still needs to be paid
 */
export const calculateAmountToRefund = async (
  permitHistory: PermitHistory[],
  permit: {
    permitType: PermitType;
    permitData: Partial<ReplaceDayjsWithString<PermitData>>;
  },
  policyEngine?: Nullable<Policy>,
) => {
  const netPaid = calculateNetAmount(permitHistory);
  if (isZeroAmount(netPaid)) return 0; // If total paid is $0 (eg. no-fee permits), then refund nothing

  const updatedFee = await calculatePermitFee(
    permit,
    policyEngine,
  );

  return netPaid - updatedFee;
};

/**
 * Determine whether or not an amount is considered to be zero (due to numerical approximation errors).
 * @param amount Numerical amount (usually representing currency amount)
 * @returns Whether or not the amount is considered to be zero
 */
export const isZeroAmount = (amount: number) => {
  return Math.abs(amount) < 0.000001;
};

/**
 * Calculates the amount that can be refunded for voiding the permit.
 * @param permit Permit to void
 * @param permitHistory List of history objects that make up the history of a permit and its transactions
 * @returns Amount that can be refunded as a result of the void operation
 */
export const calculateAmountForVoid = (
  permit: Permit,
  transactionHistory: PermitHistory[],
) => {
  const permitState = getPermitState(permit);
  if (permitState === PERMIT_STATES.EXPIRED) {
    return 0;
  }

  const netPaid = calculateNetAmount(transactionHistory);
  if (isZeroAmount(netPaid)) return 0; // If existing net paid is $0 (eg. no-fee permits), then refund nothing

  return netPaid;
};
