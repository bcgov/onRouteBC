import { useState, useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Select,
  MenuItem,
  OutlinedInput,
  FormHelperText,
} from "@mui/material";

import "./RefundPage.scss";
import { getPermitTypeName, PermitType } from "../../types/PermitType";
import { RefundFormData } from "./types/RefundFormData";
import {
  invalidTranactionIdLength,
  requiredMessage,
} from "../../../../common/helpers/validationMessages";
import { getErrorMessage } from "../../../../common/components/form/CustomFormComponents";
import { PermitHistory } from "../../types/PermitHistory";
import { TransactionHistoryTable } from "./components/TransactionHistoryTable";
import { FeeSummary } from "../../components/feeSummary/FeeSummary";
import { getDefaultRequiredVal } from "../../../../common/helpers/util";
import { isZeroAmount } from "../../helpers/feeSummary";
import { isValidTransaction } from "../../helpers/payment";
import { Nullable, Optional } from "../../../../common/types/common";
import {
  CONSOLIDATED_PAYMENT_METHODS,
  PAYMENT_METHODS_WITH_CARD,
  PAYMENT_METHOD_TYPE_CODE,
  PAYMENT_METHOD_TYPE_DISPLAY,
  getPaymentMethod,
} from "../../../../common/types/paymentMethods";

export const PERMIT_REFUND_ACTIONS = {
  VOID: "void",
  REVOKE: "revoke",
  AMEND: "amend",
} as const;

export type PermitAction =
  (typeof PERMIT_REFUND_ACTIONS)[keyof typeof PERMIT_REFUND_ACTIONS];

const permitActionText = (permitAction: PermitAction) => {
  switch (permitAction) {
    case PERMIT_REFUND_ACTIONS.VOID:
      return "Voiding";
    case PERMIT_REFUND_ACTIONS.REVOKE:
      return "Revoking";
    case PERMIT_REFUND_ACTIONS.AMEND:
    default:
      return "Amending";
  }
};

const transactionIdRules = {
  validate: {
    requiredWhenSelected: (
      value: Optional<string>,
      formValues: RefundFormData,
    ) => {
      return (
        !formValues.shouldUsePrevPaymentMethod ||
        (value != null && value.trim() !== "") ||
        requiredMessage()
      );
    },
    validateTransactionId: (
      value: Optional<string>,
      formValues: RefundFormData,
    ) => {
      return (
        !formValues.shouldUsePrevPaymentMethod ||
        (value && value.length <= 15) ||
        invalidTranactionIdLength(15)
      );
    },
  },
};

const refundOptions = Object.keys(CONSOLIDATED_PAYMENT_METHODS);
const DEFAULT_REFUND_OPTION = PAYMENT_METHOD_TYPE_DISPLAY.CHEQUE;

export const RefundPage = ({
  permitHistory,
  email,
  additionalEmail,
  reason,
  permitNumber,
  permitType,
  permitAction,
  amountToRefund,
  onFinish,
}: {
  permitHistory: PermitHistory[];
  email?: Nullable<string>;
  additionalEmail?: Nullable<string>;
  reason?: Nullable<string>;
  permitNumber?: Nullable<string>;
  permitType?: Nullable<PermitType>;
  permitAction: PermitAction;
  amountToRefund: number;
  onFinish: (refundData: RefundFormData) => void;
}) => {
  const validTransactionHistory = permitHistory.filter((history) =>
    isValidTransaction(history.paymentMethodTypeCode, history.pgApproved),
  );

  const getPrevValidTransaction = () => {
    if (!validTransactionHistory || validTransactionHistory.length === 0)
      return undefined;

    return validTransactionHistory.find((history) => {
      return (
        history.paymentMethodTypeCode !== PAYMENT_METHOD_TYPE_CODE.NP &&
        ((PAYMENT_METHODS_WITH_CARD.includes(history.paymentMethodTypeCode) &&
          !!history.paymentCardTypeCode) ||
          (!PAYMENT_METHODS_WITH_CARD.includes(history.paymentMethodTypeCode) &&
            !history.paymentCardTypeCode))
      );
    });
  };

  // Get last valid transaction's payment method
  // eg. zero dollar amounts (from amendment) is not considered valid payment method
  // Also, if the transaction is of payment method type with an associated card type, then its card type must not be empty
  const getPrevPaymentMethod = () => {
    const prevValidTransaction = getPrevValidTransaction();

    if (!prevValidTransaction) return undefined;

    return getPaymentMethod(
      prevValidTransaction.paymentMethodTypeCode,
      prevValidTransaction.paymentCardTypeCode,
    );
  };

  const getRefundMethodType = () => {
    const prevPaymentMethod = getPrevPaymentMethod();

    if (!prevPaymentMethod)
      return CONSOLIDATED_PAYMENT_METHODS[DEFAULT_REFUND_OPTION]
        .paymentMethodTypeCode;

    return CONSOLIDATED_PAYMENT_METHODS[prevPaymentMethod]
      .paymentMethodTypeCode;
  };

  const getRefundCardType = () => {
    const prevPaymentMethod = getPrevPaymentMethod();

    if (!prevPaymentMethod) {
      return CONSOLIDATED_PAYMENT_METHODS[DEFAULT_REFUND_OPTION]
        .paymentCardTypeCode;
    }

    return CONSOLIDATED_PAYMENT_METHODS[prevPaymentMethod].paymentCardTypeCode;
  };

  const getRefundOnlineMethod = () => {
    const prevValidTransaction = getPrevValidTransaction();
    if (!prevValidTransaction) return "";
    return getDefaultRequiredVal("", prevValidTransaction.pgPaymentMethod);
  };

  const disableRefundCardSelection =
    !getPrevPaymentMethod() || !getRefundCardType();

  // only show refund method selection (both card selection and cheque) when amount to refund is greater than 0
  const enableRefundMethodSelection = !isZeroAmount(amountToRefund);

  const [shouldUsePrevPaymentMethod, setShouldUsePrevPaymentMethod] =
    useState<boolean>(!disableRefundCardSelection);

  const formMethods = useForm<RefundFormData>({
    defaultValues: {
      shouldUsePrevPaymentMethod,
      refundMethod: getPaymentMethod(
        getRefundMethodType(),
        getRefundCardType(),
      ),
      refundOnlineMethod: getRefundOnlineMethod(),
      transactionId: "",
    },
    reValidateMode: "onChange",
  });

  const {
    control,
    getValues,
    handleSubmit,
    setValue,
    formState: { errors },
    register,
    clearErrors,
  } = formMethods;

  useEffect(() => {
    const refundMethod = getRefundMethodType();
    const refundCardType = getRefundCardType();
    setShouldUsePrevPaymentMethod(!disableRefundCardSelection);
    setValue("refundMethod", getPaymentMethod(refundMethod, refundCardType));
    setValue("refundOnlineMethod", getRefundOnlineMethod());
  }, [permitHistory, permitHistory.length]);

  useEffect(() => {
    setValue("shouldUsePrevPaymentMethod", shouldUsePrevPaymentMethod);
  }, [shouldUsePrevPaymentMethod]);

  const handleRefundMethodChange = (shouldUsePrev: string) => {
    const usePrev = shouldUsePrev === "true";
    setShouldUsePrevPaymentMethod(usePrev);
    setValue("refundOnlineMethod", usePrev ? getRefundOnlineMethod() : "");
    setValue("transactionId", "");
    clearErrors("transactionId");
  };

  /**
   * Function to prevent non-numeric input as the user types
   */
  const filterNonNumericValue = (input?: string) => {
    if (!input) return "";
    // only allows 0-9 inputs
    return input.replace(/[^\d]/g, "");
  };

  // Everytime the user types, update the format of the users input
  const handleTransactionIdChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const formattedValue = filterNonNumericValue(e.target.value);
    handleRefundMethodChange("true");
    setValue("transactionId", formattedValue, { shouldValidate: true });
  };

  const handleFinish = () => {
    const formValues = getValues();
    onFinish(formValues);
  };

  const showSendSection = permitAction === "void" || permitAction === "revoke";
  const showReasonSection =
    (permitAction === "void" || permitAction === "revoke") && reason;

  return (
    <div className="refund-page">
      <div className="refund-page__section refund-page__section--left">
        <div className="refund-info refund-info--transactions">
          <div className="refund-info__header">Transaction History</div>
          <TransactionHistoryTable permitHistory={validTransactionHistory} />
        </div>

        {showSendSection ? (
          <div className="refund-info refund-info--send">
            <div className="refund-info__header">
              Send Permit and Receipt to
            </div>

            {email ? (
              <div className="refund-info__info">
                <span className="info-label">Company Email: </span>
                <span className="info-value" data-testid="send-to-email">
                  {email}
                </span>
              </div>
            ) : null}

            {additionalEmail ? (
              <div className="refund-info__info">
                <span className="info-label">Additional Email: </span>
                <span
                  className="info-value"
                  data-testid="send-to-additional-email"
                >
                  {additionalEmail}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        {showReasonSection ? (
          <div className="refund-info refund-info--reason">
            <div className="refund-info__header">
              Reason for {permitActionText(permitAction)}
            </div>

            <div className="refund-info__info">{reason}</div>
          </div>
        ) : null}
      </div>

      <div className="refund-page__section refund-page__section--right">
        {enableRefundMethodSelection ? (
          <div className="refund-info refund-info--refund-methods">
            <div className="refund-info__header">Choose a Refund Method</div>

            <FormProvider {...formMethods}>
              <Controller
                control={control}
                name="shouldUsePrevPaymentMethod"
                render={({ field: { value } }) => (
                  <RadioGroup
                    className="refund-methods"
                    defaultValue={value}
                    value={value}
                    onChange={(e) => handleRefundMethodChange(e.target.value)}
                  >
                    {!disableRefundCardSelection ? (
                      <div
                        className={`refund-method ${
                          shouldUsePrevPaymentMethod
                            ? "refund-method--active"
                            : ""
                        }`}
                      >
                        <FormControlLabel
                          className="radio-label"
                          label="Refund to Previous Payment Method"
                          value={true}
                          control={
                            <Radio key="refund-by-prev-payment-method" />
                          }
                        />

                        <div className="refund-payment">
                          <Controller
                            name="refundMethod"
                            control={control}
                            render={({ field: { value } }) => (
                              <FormControl className="refund-payment__info refund-payment__info--method">
                                <FormLabel className="refund-payment__label">
                                  Payment Method
                                </FormLabel>
                                <Select
                                  className="refund-payment__input refund-payment__input--method"
                                  disabled={true}
                                  value={value}
                                >
                                  {refundOptions.map((refundOption) => (
                                    <MenuItem
                                      key={refundOption}
                                      value={refundOption}
                                    >
                                      {refundOption}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                          />

                          <Controller
                            name="transactionId"
                            control={control}
                            rules={transactionIdRules}
                            render={({
                              field: { value },
                              fieldState: { invalid },
                            }) => (
                              <FormControl
                                className="refund-payment__info refund-payment__info--transaction"
                                error={invalid}
                              >
                                <FormLabel className="refund-payment__label">
                                  Transaction ID
                                </FormLabel>

                                <OutlinedInput
                                  className={`refund-payment__input refund-payment__input--transaction ${
                                    invalid ? "refund-payment__input--err" : ""
                                  }`}
                                  defaultValue={value}
                                  {...register(
                                    "transactionId",
                                    transactionIdRules,
                                  )}
                                  onChange={handleTransactionIdChange}
                                />

                                {invalid ? (
                                  <FormHelperText
                                    className="refund-payment__err"
                                    error
                                  >
                                    {getErrorMessage(errors, "transactionId")}
                                  </FormHelperText>
                                ) : null}
                              </FormControl>
                            )}
                          />
                        </div>
                      </div>
                    ) : null}

                    <div
                      className={`refund-method ${
                        !shouldUsePrevPaymentMethod
                          ? "refund-method--active"
                          : ""
                      }`}
                    >
                      <FormControlLabel
                        className="radio-label"
                        label="Refund by Cheque"
                        value={false}
                        control={<Radio key="refund-by-cheque" />}
                      />
                    </div>
                  </RadioGroup>
                )}
              />
            </FormProvider>
          </div>
        ) : null}

        <div className="refund-info refund-info--fee-summary">
          <div className="refund-fee-summary">
            <div className="refund-fee-summary__header">
              <div className="refund-fee-summary__title">
                {getPermitTypeName(permitType)}
              </div>

              <div className="refund-fee-summary__permit-number">
                <span>{permitActionText(permitAction)} Permit #: </span>
                <span data-testid="voiding-permit-number">{permitNumber}</span>
              </div>
            </div>

            <FeeSummary
              permitType={permitType}
              feeSummary={`${amountToRefund}`}
            />
            
            <div className="refund-fee-summary__footer">
              <Button
                className="finish-btn"
                variant="contained"
                color="primary"
                onClick={handleSubmit(handleFinish)}
              >
                Finish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
