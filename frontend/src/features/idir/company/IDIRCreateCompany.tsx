import { Box, Button, Stack } from "@mui/material";
import React, { useContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import "./IDIRCreateCompany.scss";
import { Nullable } from "../../../common/types/common";
import { InfoBcGovBanner } from "../../../common/components/banners/InfoBcGovBanner";
import { Banner } from "../../../common/components/dashboard/components/banner/Banner";
import { BANNER_MESSAGES } from "../../../common/constants/bannerMessages";
import { ERROR_ROUTES } from "../../../routes/constants";
import { BC_COLOURS } from "../../../themes/bcGovStyles";
import { createOnRouteBCProfile } from "../../manageProfile/apiManager/manageProfileAPI";
import { CompanyInformationWizardForm } from "../../wizard/subcomponents/CompanyInformationWizardForm";
import { OnRouteBCProfileCreated } from "../../wizard/subcomponents/OnRouteBCProfileCreated";
import OnRouteBCContext from "../../../common/authentication/OnRouteBCContext";
import { getDefaultRequiredVal } from "../../../common/helpers/util";
import {
  CreateCompanyRequest,
  CompanyProfile,
} from "../../manageProfile/types/manageProfile";
import { AxiosError } from "axios";

/**
 * The form for a staff user to create a company.
 */
export const IDIRCreateCompany = React.memo(() => {
  const navigate = useNavigate();

  const [clientNumber, setClientNumber] = useState<Nullable<string>>(null);
  const {
    migratedClient,
    setCompanyId,
    setOnRouteBCClientNumber,
    setCompanyLegalName,
  } = useContext(OnRouteBCContext);

  const companyAndUserFormMethods = useForm<CreateCompanyRequest>({
    defaultValues: {
      legalName: getDefaultRequiredVal("", migratedClient?.legalName),
      alternateName: getDefaultRequiredVal("", migratedClient?.alternateName),
      clientNumber: getDefaultRequiredVal("", migratedClient?.clientNumber),
      migratedClientHash: getDefaultRequiredVal(
        "",
        migratedClient?.migratedClientHash,
      ),
      mailingAddress: {
        addressLine1: getDefaultRequiredVal(
          "",
          migratedClient?.mailingAddress?.addressLine1,
        ),
        addressLine2: getDefaultRequiredVal(
          "",
          migratedClient?.mailingAddress?.addressLine2,
        ),
        provinceCode: getDefaultRequiredVal(
          "",
          migratedClient?.mailingAddress?.provinceCode,
        ),
        countryCode: getDefaultRequiredVal(
          "",
          migratedClient?.mailingAddress?.countryCode,
        ),
        city: getDefaultRequiredVal("", migratedClient?.mailingAddress?.city),
        postalCode: getDefaultRequiredVal(
          "",
          migratedClient?.mailingAddress?.postalCode,
        ),
      },
      email: getDefaultRequiredVal("", migratedClient?.email),
      phone: getDefaultRequiredVal("", migratedClient?.phone),
      extension: getDefaultRequiredVal("", migratedClient?.extension),
      fax: getDefaultRequiredVal("", migratedClient?.fax),
      // A migrated but unclaimed company will not have primaryContact.
      primaryContact: {
        firstName: "",
        lastName: "",
        email: "",
        phone1: "",
        phone1Extension: "",
        phone2: "",
        phone2Extension: "",
        countryCode: "",
        provinceCode: "",
        city: "",
      },
    },
  });

  const { handleSubmit } = companyAndUserFormMethods;

  /**
   * On Click function for the Finish button
   * Validates and submits the form data to the API
   * @param data The form data.
   */
  const onClickFinish = function (data: CreateCompanyRequest) {
    const profileToBeCreated = data;
    createProfileQuery.mutate(profileToBeCreated);
  };

  const createProfileQuery = useMutation({
    mutationFn: createOnRouteBCProfile,
    onSuccess: async (response) => {
      if (response.status === 200 || response.status === 201) {
        const { companyId, clientNumber, legalName } =
          response.data as CompanyProfile;
        // Handle context updates;
        sessionStorage.setItem(
          "onRouteBC.user.companyId",
          companyId.toString(),
        );
        setCompanyId?.(() => companyId);
        setCompanyLegalName?.(() => legalName);
        setOnRouteBCClientNumber?.(() => clientNumber);
        // By default a newly created company shouldn't be suspended, so no need for setIsCompanySuspended
        setClientNumber(() => clientNumber);
      }
    },
    onError: (error: AxiosError) => {
      navigate(ERROR_ROUTES.UNEXPECTED, {
        state: { correlationId: error.response?.headers["x-correlation-id"] },
      });
    },
  });

  if (clientNumber) {
    return <OnRouteBCProfileCreated onRouteBCClientNumber={clientNumber} />;
  }
  return (
    <>
      <Box
        className="layout-box"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Banner bannerText="Create Company" />
      </Box>
      <div
        className="idir-create-company create-profile-steps"
        id={`profile-steps`}
        aria-labelledby={`profile-steps`}
      >
        <div className="create-profile-steps__create-profile">
          <FormProvider {...companyAndUserFormMethods}>
            <InfoBcGovBanner msg={BANNER_MESSAGES.ALL_FIELDS_MANDATORY} />
            <CompanyInformationWizardForm showCompanyName />
            <div className="create-profile-section create-profile-section--nav">
              <Stack direction="row" spacing={3}>
                <Button
                  key="cancel-create-profile-button"
                  aria-label="Cancel Create Profile"
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    // Go back
                    navigate(-1);
                  }}
                  disableElevation
                  sx={{
                    ":hover": {
                      background: BC_COLOURS.bc_background_light_grey,
                      border: `2px solid ${BC_COLOURS.bc_text_box_border_grey}`,
                    },
                    border: `2px solid ${BC_COLOURS.white}`,
                    borderRadius: "4px",
                  }}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSubmit(onClickFinish)}
                  variant="contained"
                  className="proceed-btn proceed-btn--finish"
                >
                  Finish
                </Button>
              </Stack>
            </div>
          </FormProvider>
        </div>
      </div>
    </>
  );
});

IDIRCreateCompany.displayName = "IDIRCreateCompany";
