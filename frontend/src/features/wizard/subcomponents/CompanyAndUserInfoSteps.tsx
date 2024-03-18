import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useContext } from "react";
import { useFormContext } from "react-hook-form";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { Nullable } from "vitest";
import OnRouteBCContext from "../../../common/authentication/OnRouteBCContext";
import { getDefaultRequiredVal } from "../../../common/helpers/util";
import { ERROR_ROUTES } from "../../../routes/constants";
import { BC_COLOURS } from "../../../themes/bcGovStyles";
import { createOnRouteBCProfile } from "../../manageProfile/apiManager/manageProfileAPI";
import { CreateCompanyRequest } from "../../manageProfile/types/manageProfile";
import { CompanyInformationWizardForm } from "./CompanyInformationWizardForm";
import { UserInformationWizardForm } from "./UserInformationWizardForm";
import { WizardCompanyBanner } from "./WizardCompanyBanner";

/**
 * The company info and user info steps to be shared between
 * challenge and no challenge workflows.
 */
export const CompanyAndUserInfoSteps = ({
  setClientNumber,
  activeStep,
  setActiveStep,
  totalSteps,
}: {
  setClientNumber: Dispatch<SetStateAction<Nullable<string>>>;
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
  totalSteps: number;
}) => {
  const navigate = useNavigate();
  const { handleSubmit: handleCreateProfileSubmit, register } =
    useFormContext<CreateCompanyRequest>();
  const {
    setCompanyId,
    setUserDetails,
    setCompanyLegalName,
    setOnRouteBCClientNumber,
    setMigratedClient,
  } = useContext(OnRouteBCContext);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createProfileQuery = useMutation({
    mutationFn: createOnRouteBCProfile,
    onSuccess: async (response) => {
      if (response.status === 200 || response.status === 201) {
        const responseBody = response.data;
        const companyId = responseBody["companyId"];
        const companyName = responseBody["legalName"];
        const clientNumber = responseBody["clientNumber"];
        const userDetails = {
          firstName: responseBody.adminUser?.firstName,
          lastName: responseBody.adminUser?.lastName,
          userName: responseBody.adminUser?.userName,
          phone1: responseBody.adminUser?.phone1,
          phone1Extension: responseBody.adminUser?.phone1Extension,
          phone2: responseBody.adminUser?.phone2,
          phone2Extension: responseBody.adminUser?.phone2Extension,
          email: responseBody.adminUser?.email,
          fax: responseBody.adminUser?.fax,
          userAuthGroup: responseBody.adminUser?.userAuthGroup,
        };
        setUserDetails?.(() => userDetails);
        setCompanyId?.(() => companyId);
        setCompanyLegalName?.(() => companyName);
        setOnRouteBCClientNumber?.(() => clientNumber);

        // Clear any state in migrated client. We no longer need this
        // once the user has successfully created/claimed their company.
        setMigratedClient?.(() => undefined);

        // We are not clearing isNewBCeIDUser in the context because,
        // it causes a side-effect where, if cleared, the user is immediately
        // redirected to the applications page.

        // They should instead remain on this page and
        // look at the profile created section which contains the client number.

        // Setting the companyId in the sessionStorage so that it can be used
        // used outside of react components;
        sessionStorage.setItem("onRouteBC.user.companyId", companyId);

        setClientNumber(() => responseBody["clientNumber"]);
        queryClient.invalidateQueries({
          queryKey: ["userContext"],
        });
      }
    },
    onError: () => {
      navigate(ERROR_ROUTES.UNEXPECTED);
    },
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  /**
   * On Click function for the Finish button
   * Validates and submits the form data to the API
   * @param data The form data.
   */
  const onClickFinish = function (data: CreateCompanyRequest) {
    const profileToBeCreated = data;
    createProfileQuery.mutate(profileToBeCreated);
  };

  return (
    <>
      <input type="hidden" {...register("legalName")} />
      {activeStep <= totalSteps - 1 && (
        <div className="create-profile-section create-profile-section--info">
          <Alert severity="info">
            <Typography>
              <strong>
                Please note, unless stated otherwise, all fields are mandatory.
              </strong>
            </Typography>
          </Alert>
        </div>
      )}
      {activeStep === totalSteps - 2 && (
        <div className="create-profile-section create-profile-section--company">
          <WizardCompanyBanner
            legalName={getDefaultRequiredVal(
              "",
              user?.profile?.bceid_business_name as string,
            )}
          />
          <CompanyInformationWizardForm />
        </div>
      )}
      {activeStep === totalSteps - 1 && (
        <div className="create-profile-section create-profile-section--user">
          <h2>User Details</h2>
          <hr></hr>
          <UserInformationWizardForm />
        </div>
      )}
      <div className="create-profile-section create-profile-section--nav">
        {activeStep === totalSteps - 2 && (
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
            {totalSteps === 3 && (
              <Button
                onClick={handleBack}
                variant="contained"
                color="secondary"
                startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
                className="proceed-btn proceed-btn--prev"
                sx={{
                  ":hover": {
                    background: BC_COLOURS.bc_text_links_blue,
                    border: `2px solid ${BC_COLOURS.bc_text_links_blue}`,
                  },
                  border: `2px solid ${BC_COLOURS.bc_primary_blue}`,
                  borderRadius: "4px",
                  color: `${BC_COLOURS.bc_primary_blue}`,
                  background: `${BC_COLOURS.white}`,
                }}
              >
                <strong>Previous</strong>
              </Button>
            )}
            <Button
              className="proceed-btn proceed-btn--next"
              onClick={handleCreateProfileSubmit(handleNext)}
              variant="contained"
              color="primary"
              endIcon={<FontAwesomeIcon icon={faArrowRight} />}
            >
              Next
            </Button>
          </Stack>
        )}
        {activeStep === totalSteps - 1 && (
          <>
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
                onClick={handleBack}
                variant="contained"
                color="secondary"
                startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
                className="proceed-btn proceed-btn--prev"
              >
                Previous
              </Button>
              <Button
                onClick={handleCreateProfileSubmit(onClickFinish)}
                variant="contained"
                className="proceed-btn proceed-btn--finish"
              >
                Finish
              </Button>
            </Stack>
          </>
        )}
      </div>
    </>
  );
};
