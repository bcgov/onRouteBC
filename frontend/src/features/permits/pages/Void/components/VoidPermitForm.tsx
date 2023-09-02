import { Controller, FormProvider } from "react-hook-form";
import isEmail from "validator/lib/isEmail";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useState } from "react";

import "./VoidPermitForm.scss";
import { CustomFormComponent } from "../../../../../common/components/form/CustomFormComponents";
import { invalidEmail, invalidPhoneLength, requiredMessage } from "../../../../../common/helpers/validationMessages";
import { useVoidPermitForm } from "../hooks/useVoidPermitForm";
import { VoidPermitHeader } from "./VoidPermitHeader";
import { ReadPermitDto } from "../../../types/permit";
import { SEARCH_RESULTS } from "../../../../../routes/constants";
import { RevokeDialog } from "./RevokeDialog";
import { FeeSummary } from "./FeeSummary";

const FEATURE = "void-permit";
const searchRoute = `${SEARCH_RESULTS}?searchEntity=permits`;

export const VoidPermitForm = ({
  permit,
}: {
  permit?: ReadPermitDto,
}) => {
  const navigate = useNavigate();
  const [openRevokeDialog, setOpenRevokeDialog] = useState<boolean>(false);
  const {
    formMethods,
    handleReasonChange,
    setVoidPermitData,
    next,
  } = useVoidPermitForm();

  const { control, getValues, handleSubmit } = formMethods;

  const handleCancel = () => {
    navigate(searchRoute);
  };

  const handleContinue = () => {
    const formValues = getValues();
    setVoidPermitData(formValues);
    console.log(formValues); //
    next();
  };

  const handleOpenRevokeDialog = () => {
    setOpenRevokeDialog(true);
  };

  const handleCancelRevoke = () => {
    setOpenRevokeDialog(false);
  };

  return (
    <FormProvider {...formMethods}>
      <VoidPermitHeader permit={permit} />
      <div className="void-permit__form">
        <div className="form-section form-section--send">
          <div className="form-section__label">
            Send Permit and Receipt to
          </div>
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
                      (fax == null || fax === "")
                        || (fax != null && fax !== "" && fax.length >= 10 && fax.length <= 20)
                        || invalidPhoneLength(10, 20),
                  },
                },
                label: "Fax",
              }}
              className="void-input void-input--fax"
            />
          </div>
        </div>

        <div className="form-section form-section--reason">
          <div className="form-section__label">
            Reason for Voiding
          </div>
          <div className="form-section__input-area">
            <div className="reason-container">
              <div className="reason-container__left">
                <Controller
                  name="reason"
                  control={control}
                  render={({ field: { value }}) => (
                    <textarea 
                      name="reason" 
                      className="void-input void-input--reason"
                      rows={6}
                      defaultValue={value}
                      onChange={(e) => handleReasonChange(e.target.value)}
                    >
                    </textarea>
                  )}
                />
                <FeeSummary
                  permitType={permit?.permitType}
                  feeSummary={permit?.permitData?.feeSummary}
                  permitDuration={permit?.permitData?.permitDuration}
                />
              </div>
              <div className="reason-container__right">
                <div className="revoke">
                  <div className="revoke__header">
                    Revoke this permit?
                  </div>
                  <div className="revoke__body">
                    <div className="revoke__msg">
                      Revoking a permit is a severe action that <span className="revoke__msg--bold">cannot be reversed.</span> There are <span className="revoke__msg--bold">no refunds</span> for revoked permits.
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
          />
        ) : null}
      </div>
    </FormProvider>    
  );
};
