import { Button, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memo } from "react";
import { FormProvider, useForm, FieldValues } from "react-hook-form";
import { updateCompanyInfo } from "../../../apiManager/manageProfileAPI";

import "./CompanyInfoForms.scss";
import { CompanyInfoGeneralForm } from "./subForms/CompanyInfoGeneralForm";
import { CompanyContactDetailsForm } from "./subForms/CompanyContactDetailsForm";
import { CompanyPrimaryContactForm } from "./subForms/CompanyPrimaryContactForm";
import { InfoBcGovBanner } from "../../../../../common/components/banners/InfoBcGovBanner";
import { getUserEmailFromSession } from "../../../../../common/apiManager/httpRequestHandler";
import { BANNER_MESSAGES } from "../../../../../common/constants/bannerMessages";
import { CustomFormComponent } from "../../../../../common/components/form/CustomFormComponents";
import { getFormattedPhoneNumber } from "../../../../../common/helpers/phone/getFormattedPhoneNumber";
import {
  CompanyProfile,
  UpdateCompanyProfileRequest,
} from "../../../types/manageProfile";

import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../../../common/helpers/util";

import {
  invalidDBALength,
  isValidOptionalString,
} from "../../../../../common/helpers/validationMessages";

/**
 * The Company Information Form contains multiple subs forms including
 * Company Info, Company Contact, Primary Contact, and Mailing Address Forms.
 * This Component contains the logic for React Hook forms and React query
 * for state management and API calls
 */
export const CompanyInfoForm = memo(
  ({
    companyInfo,
    setIsEditting,
  }: {
    companyInfo?: CompanyProfile;
    setIsEditting: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    const queryClient = useQueryClient();
    const userEmail = getUserEmailFromSession();

    const formMethods = useForm<UpdateCompanyProfileRequest>({
      defaultValues: {
        legalName: getDefaultRequiredVal("", companyInfo?.legalName),
        alternateName: getDefaultRequiredVal("", companyInfo?.alternateName),
        mailingAddress: {
          addressLine1: getDefaultRequiredVal(
            "",
            companyInfo?.mailingAddress?.addressLine1,
          ),
          addressLine2: getDefaultRequiredVal(
            "",
            companyInfo?.mailingAddress?.addressLine2,
          ),
          city: getDefaultRequiredVal("", companyInfo?.mailingAddress?.city),
          provinceCode: getDefaultRequiredVal(
            "",
            companyInfo?.mailingAddress?.provinceCode,
          ),
          countryCode: getDefaultRequiredVal(
            "",
            companyInfo?.mailingAddress?.countryCode,
          ),
          postalCode: getDefaultRequiredVal(
            "",
            companyInfo?.mailingAddress?.postalCode,
          ),
        },
        email: getDefaultRequiredVal("", companyInfo?.email, userEmail),
        phone: applyWhenNotNullable(getFormattedPhoneNumber, companyInfo?.phone, ""),
        extension: getDefaultRequiredVal("", companyInfo?.extension),
        primaryContact: {
          firstName: getDefaultRequiredVal(
            "",
            companyInfo?.primaryContact?.firstName,
          ),
          lastName: getDefaultRequiredVal(
            "",
            companyInfo?.primaryContact?.lastName,
          ),
          phone1: applyWhenNotNullable(
            getFormattedPhoneNumber,
            companyInfo?.primaryContact?.phone1,
            "",
          ),
          phone1Extension: getDefaultRequiredVal(
            "",
            companyInfo?.primaryContact?.phone1Extension,
          ),
          phone2: applyWhenNotNullable(
            getFormattedPhoneNumber,
            companyInfo?.primaryContact?.phone2,
            "",
          ),
          phone2Extension: getDefaultRequiredVal(
            "",
            companyInfo?.primaryContact?.phone2Extension,
          ),
          email: getDefaultRequiredVal("", companyInfo?.primaryContact?.email),
          city: getDefaultRequiredVal("", companyInfo?.primaryContact?.city),
          provinceCode: getDefaultRequiredVal(
            "",
            companyInfo?.primaryContact?.provinceCode,
          ),
          countryCode: getDefaultRequiredVal(
            "",
            companyInfo?.primaryContact?.countryCode,
          ),
        },
      },
    });

    const { handleSubmit } = formMethods;

    const addCompanyInfoQuery = useMutation({
      mutationFn: updateCompanyInfo,
      onSuccess: (response) => {
        if (response.status === 200) {
          queryClient.invalidateQueries({
            queryKey: ["companyInfo"],
          });
          setIsEditting(false);
        } // else { // Display Error in the form }
      },
    });

    const onUpdateCompanyInfo = function (data: FieldValues) {
      const companyInfoToBeUpdated = data as UpdateCompanyProfileRequest;
      addCompanyInfoQuery.mutate({
        companyInfo: companyInfoToBeUpdated,
      });
    };

    const FEATURE = "company-profile";

    return (
      <div className="company-info-form">
        <FormProvider {...formMethods}>
          <Typography variant="h2" gutterBottom>
            Doing Business As (DBA)
          </Typography>
          <CustomFormComponent
            type="input"
            feature={FEATURE}
            options={{
              name: "alternateName",
              rules: {
                required: false,
                validate: {
                  validateAlternateName: (alternateName: string) =>
                    isValidOptionalString(alternateName, { maxLength: 150 }) ||
                    invalidDBALength(1, 150),
                },
              },
              label: "Doing Business As",
            }}
          />

          <Typography variant="h2" gutterBottom>
            Company Mailing Address
          </Typography>

          <CompanyInfoGeneralForm feature={FEATURE} />

          <Typography variant="h2" gutterBottom>
            Company Contact Details
          </Typography>

          <CompanyContactDetailsForm feature={FEATURE} />

          <Typography variant="h2" gutterBottom>
            Company Primary Contact
          </Typography>

          <InfoBcGovBanner msg={BANNER_MESSAGES.COMPANY_CONTACT} />

          <CompanyPrimaryContactForm feature={FEATURE} />
        </FormProvider>
        <div className="company-info-form__submission">
          <Button
            key="update-company-info-cancel-button"
            aria-label="Cancel Update"
            variant="contained"
            color="tertiary"
            onClick={() => setIsEditting(false)}
            className="submit-btn submit-btn--cancel"
          >
            Cancel
          </Button>
          <Button
            key="update-company-info-button"
            aria-label="Update Company Info"
            variant="contained"
            color="primary"
            onClick={handleSubmit(onUpdateCompanyInfo)}
            className="submit-btn"
          >
            Save
          </Button>
        </div>
      </div>
    );
  },
);

CompanyInfoForm.displayName = "CompanyInfoForm";
