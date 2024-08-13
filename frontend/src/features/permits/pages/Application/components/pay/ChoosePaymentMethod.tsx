import { Controller, useFormContext } from "react-hook-form";
import { Box, RadioGroup, Typography } from "@mui/material";
import { PaymentOption } from "./PaymentOption";
import { PaymentMethodTypeCode } from "../../../../../../common/types/paymentMethods";
import {
  DEFAULT_EMPTY_CARD_TYPE,
  DEFAULT_EMPTY_PAYMENT_TYPE,
} from "./types/PaymentMethodData";
import "./ChoosePaymentMethod.scss";

export const ChoosePaymentMethod = ({
  availablePaymentMethods,
}: {
  availablePaymentMethods: PaymentMethodTypeCode[];
}) => {
  const { control, watch, setValue, clearErrors } = useFormContext();
  const currPaymentMethod = watch("paymentMethod");

  const handlePaymentMethodChange = (
    selectedPaymentMethod: PaymentMethodTypeCode,
  ) => {
    /**
     * Ensure that the user does not select the same payment method consecutively,
     * which would cause the inner form fields (payment type, transaction id etc)
     * to reset when attempting to interact with them
     */
    if (currPaymentMethod !== selectedPaymentMethod) {
      setValue("paymentMethod", selectedPaymentMethod as PaymentMethodTypeCode);
      setValue("additionalPaymentData.cardType", DEFAULT_EMPTY_CARD_TYPE);
      setValue("additionalPaymentData.icepayTransactionId", "");
      setValue("additionalPaymentData.paymentType", DEFAULT_EMPTY_PAYMENT_TYPE);
      setValue("additionalPaymentData.ppcTransactionId", "");
      setValue("additionalPaymentData.serviceBCOfficeId", "");
      clearErrors([
        "additionalPaymentData.cardType",
        "additionalPaymentData.icepayTransactionId",
        "additionalPaymentData.paymentType",
        "additionalPaymentData.ppcTransactionId",
        "additionalPaymentData.serviceBCOfficeId",
      ]);
    }
  };

  return (
    <Box className="choose-payment-method">
      <Typography className="choose-payment-method__title" variant="h3">
        Choose a Payment Method
      </Typography>

      <Controller
        control={control}
        name="paymentMethod"
        render={({ field: { value } }) => (
          <RadioGroup
            className="choose-payment-method__options"
            defaultValue={value}
            value={value}
            onChange={(e) =>
              handlePaymentMethodChange(e.target.value as PaymentMethodTypeCode)
            }
          >
            {availablePaymentMethods.map((paymentMethod) => (
              <PaymentOption
                key={paymentMethod}
                paymentMethod={paymentMethod}
                isSelected={paymentMethod === currPaymentMethod}
                handlePaymentMethodChange={handlePaymentMethodChange}
              />
            ))}
          </RadioGroup>
        )}
      />
    </Box>
  );
};
