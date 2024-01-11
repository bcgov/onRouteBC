import { Controller, FormProvider } from "react-hook-form";
import isEmail from "validator/lib/isEmail";
import { useNavigate } from "react-router-dom";
import { Button, FormControl, FormHelperText } from "@mui/material";
import { useEffect, useState } from "react";

import "./VoidPermitForm.scss";
import {
  CustomFormComponent,
  getErrorMessage,
} from "../../../../../common/components/form/CustomFormComponents";
import {
  invalidEmail,
  invalidPhoneLength,
  requiredMessage,
} from "../../../../../common/helpers/validationMessages";
import { useVoidPermitForm } from "../hooks/useVoidPermitForm";
import { VoidPermitHeader } from "./VoidPermitHeader";
import { Permit } from "../../../types/permit";
import { IDIR_ROUTES } from "../../../../../routes/constants";
import { RevokeDialog } from "./RevokeDialog";
import { usePermitHistoryQuery } from "../../../hooks/hooks";
import { calculateAmountForVoid } from "../../../helpers/feeSummary";
import { FeeSummary } from "../../../components/feeSummary/FeeSummary";
import { VoidPermitFormData } from "../types/VoidPermit";
import { useVoidPermit } from "../hooks/useVoidPermit";
import { mapToRevokeRequestData } from "../helpers/mapper";
import { isValidTransaction } from "../../../helpers/payment";
import { Nullable } from "../../../../../common/types/common";

const FEATURE = "void-permit";
const searchRoute = `${IDIR_ROUTES.SEARCH_RESULTS}?searchEntity=permits`;

export const VoidPermitForm = ({
  permit,
  onRevokeSuccess,
}: {
  permit: Nullable<Permit>;
  onRevokeSuccess: () => void;
}) => {
  const navigate = useNavigate();
  const [openRevokeDialog, setOpenRevokeDialog] = useState<boolean>(false);
  const { formMethods, permitId, setVoidPermitData, next } =
    useVoidPermitForm();

  const { query: permitHistoryQuery, permitHistory } = usePermitHistoryQuery(
    permit?.originalPermitId,
  );

  const validTransactionHistory = permitHistory.filter((history) =>
    isValidTransaction(history.paymentMethodTypeCode, history.pgApproved),
  );

  const { mutation: revokePermitMutation, voidResults } = useVoidPermit();

  useEffect(() => {
    if (voidResults && voidResults.success.length > 0) {
      setOpenRevokeDialog(false);
      onRevokeSuccess();
    }
  }, [voidResults]);

  const amountToRefund =
    permitHistoryQuery.isInitialLoading || !permit
      ? 0
      : -1 * calculateAmountForVoid(permit, validTransactionHistory);

  const {
    control,
    getValues,
    handleSubmit,
    register,
    formState: { errors },
  } = formMethods;

  const handleCancel = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    const formValues = getValues();
    setVoidPermitData(formValues);
    next();
  };

  const handleOpenRevokeDialog = () => {
    setOpenRevokeDialog(true);
  };

  const handleCancelRevoke = () => {
    setOpenRevokeDialog(false);
  };

  const handleRevoke = (revokeData: VoidPermitFormData) => {
    revokePermitMutation.mutate({
      permitId,
      voidData: mapToRevokeRequestData(revokeData),
    });
  };

  const voidReasonRules = {
    required: {
      value: true,
      message: requiredMessage(),
    },
  };

  return (
    <FormProvider {...formMethods}>
      <VoidPermitHeader permit={permit} />
      <div className="void-permit__form">
        <div className="form-section form-section--send">
          <div className="form-section__label">Send Permit and Receipt to</div>
          <div className="form-section__input-area">
            <CustomFormComponent
              type="input"
              feature={FEATURE}
              options={{
                name: "email",
                rules: {
                  required: { value: true, message: requiredMessage() },
                  validate: {
                    validateEmail: (email: string) =>
                      isEmail(email) || invalidEmail(),
                  },
                },
                label: "Email",
              }}
              className="void-input void-input--email"
            />
            <CustomFormComponent
              type="phone"
              feature={FEATURE}
              options={{
                name: "fax",
                rules: {
                  required: false,
                  validate: {
                    validateFax: (fax?: string) =>
                      fax == null ||
                      fax === "" ||
                      (fax != null &&
                        fax !== "" &&
                        fax.length >= 10 &&
                        fax.length <= 20) ||
                      invalidPhoneLength(10, 20),
                  },
                },
                label: "Fax",
              }}
              className="void-input void-input--fax"
            />
          </div>
        </div>

        <div className="form-section form-section--reason">
          <div className="form-section__label">Reason for Voiding</div>
          <div className="form-section__input-area">
            <div className="reason-container">
              <div className="reason-container__left">
                <Controller
                  name="reason"
                  control={control}
                  rules={voidReasonRules}
                  render={({ field: { value }, fieldState: { invalid } }) => (
                    <FormControl error={invalid}>
                      <textarea
                        className={`void-input void-input--reason ${
                          invalid ? "void-input--err" : ""
                        }`}
                        rows={6}
                        defaultValue={value}
                        {...register("reason", voidReasonRules)}
                      ></textarea>
                      {invalid ? (
                        <FormHelperText className="void-input__err" error>
                          {getErrorMessage(errors, "reason")}
                        </FormHelperText>
                      ) : null}
                    </FormControl>
                  )}
                />
                <FeeSummary
                  permitType={permit?.permitType}
                  feeSummary={`${amountToRefund}`}
                />
              </div>
              <div className="reason-container__right">
                <div className="revoke">
                  <div className="revoke__header">Revoke this permit?</div>
                  <div className="revoke__body">
                    <div className="revoke__msg">
                      Revoking a permit is a severe action that{" "}
                      <span className="revoke__msg--bold">
                        cannot be reversed.
                      </span>{" "}
                      There are{" "}
                      <span className="revoke__msg--bold">no refunds</span> for
                      revoked permits.
                    </div>
                    <Button
                      className="revoke__btn"
                      onClick={handleOpenRevokeDialog}
                    >
                      Revoke Permit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section form-section--submit">
          <div className="form-section__label"></div>
          <div className="form-section__input-area">
            <Button
              key="cancel-void-button"
              aria-label="Cancel"
              variant="contained"
              color="tertiary"
              className="void-permit-button void-permit-button--cancel"
              onClick={handleCancel}
              data-testid="cancel-void-permit-button"
            >
              Cancel
            </Button>
            <Button
              key="continue-void-button"
              aria-label="Continue"
              variant="contained"
              color="primary"
              onClick={handleSubmit(handleContinue)}
              className="void-permit-button void-permit-button--continue"
              data-testid="continue-void-permit-button"
            >
              Continue
            </Button>
          </div>
        </div>

        {openRevokeDialog ? (
          <RevokeDialog
            voidPermitData={getValues()}
            showDialog={openRevokeDialog}
            onClose={handleCancelRevoke}
            onRevoke={handleRevoke}
          />
        ) : null}
      </div>
    </FormProvider>
  );
};
