import { Box, Button } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React, { useContext, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FieldValues, FormProvider, useForm } from "react-hook-form";

import "./UserInfoWizard.scss";
import { SnackBarContext } from "../../App";
import { LoadBCeIDUserContext } from "../../common/authentication/LoadBCeIDUserContext";
import { LoadBCeIDUserClaimsByCompany } from "../../common/authentication/LoadBCeIDUserClaimsByCompany";
import OnRouteBCContext, {
  BCeIDUserDetailContext,
} from "../../common/authentication/OnRouteBCContext";
import { Banner } from "../../common/components/dashboard/components/banner/Banner";
import { getDefaultRequiredVal } from "../../common/helpers/util";
import { ErrorFallback } from "../../common/pages/ErrorFallback";
import { createMyOnRouteBCUserProfile } from "../manageProfile/apiManager/manageProfileAPI";
import { ReusableUserInfoForm } from "../manageProfile/components/forms/common/ReusableUserInfoForm";
import { OnRouteBCProfileCreated } from "./subcomponents/OnRouteBCProfileCreated";
import { InfoBcGovBanner } from "../../common/components/banners/InfoBcGovBanner";
import { BANNER_MESSAGES } from "../../common/constants/bannerMessages";
import {
  Contact,
  ReadUserInformationResponse,
} from "../manageProfile/types/manageProfile";

/**
 * User Info wizard displays a user information form
 * when an invited user logs in for the first time.
 */
export const UserInfoWizard = React.memo(() => {
  const formMethods = useForm<Contact>();

  const { setUserDetails } = useContext(OnRouteBCContext);
  const { setSnackBar } = useContext(SnackBarContext);
  const [isProfileCreated, setIsProfileCreated] = useState<boolean>(false);

  const createProfileQuery = useMutation({
    mutationFn: createMyOnRouteBCUserProfile,
    onSuccess: async (response) => {
      if (response.status === 201) {
        const responseBody = response.data as ReadUserInformationResponse;
        const userDetails: BCeIDUserDetailContext = {
          firstName: responseBody.firstName,
          lastName: responseBody.lastName,
          userName: responseBody.userName,
          phone1: responseBody.phone1,
          phone1Extension: responseBody.phone1Extension,
          phone2: responseBody.phone2,
          phone2Extension: responseBody.phone2Extension,
          email: responseBody.email,
          userRole: responseBody.userRole,
        };
        setIsProfileCreated(() => true);
        setUserDetails?.(() => userDetails);
      } else if (response.status === 400) {
        const { error } = response.data;
        const firstErrMsg = getDefaultRequiredVal([], error);
        if (firstErrMsg[0]) {
          setSnackBar({
            message: firstErrMsg,
            showSnackbar: true,
            setShowSnackbar: () => true,
            alertType: "error",
          });
        }
      }
    },
  });

  /**
   * Creates the user profile on click of finish.
   * @param data The form data
   */
  const onClickFinish = (data: FieldValues) => {
    createProfileQuery.mutate({
      myInfo: data as Contact,
    });
  };

  const { handleSubmit } = formMethods;

  if (isProfileCreated) {
    return (
      <>
        <LoadBCeIDUserContext />
        <LoadBCeIDUserClaimsByCompany />
        <OnRouteBCProfileCreated />
      </>
    );
  }
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <FormProvider {...formMethods}>
        <Box className="layout-box">
          <Banner bannerText="Create a new onRouteBC Profile" />
        </Box>
        <div
          className="user-info-wizard create-profile-steps"
          id={`profile-steps`}
          aria-labelledby={`profile-steps`}
        >
          <div className="create-profile-steps__create-profile">
            <InfoBcGovBanner
              className="create-profile-section create-profile-section--info"
              msg={BANNER_MESSAGES.ALL_FIELDS_MANDATORY}
            />

            <ReusableUserInfoForm feature="my-info-wizard" />

            <div className="create-profile-section create-profile-section--nav">
              <Button
                onClick={handleSubmit(onClickFinish)}
                variant="contained"
                className="proceed-btn proceed-btn--finish"
              >
                Finish
              </Button>
            </div>
          </div>
        </div>
      </FormProvider>
    </ErrorBoundary>
  );
});

UserInfoWizard.displayName = "UserInfoWizard";
