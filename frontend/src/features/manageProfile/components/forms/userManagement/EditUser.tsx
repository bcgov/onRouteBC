import { memo, useContext, useState } from "react";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Controller, FormProvider, useForm } from "react-hook-form";

import { CustomActionLink } from "../../../../../common/components/links/CustomActionLink";
import { SnackBarContext } from "../../../../../App";
import { formatPhoneNumber } from "../../../../../common/components/form/subFormComponents/PhoneNumberInput";
import { requiredMessage } from "../../../../../common/helpers/validationMessages";
import { ERROR_ROUTES, PROFILE_ROUTES } from "../../../../../routes/constants";
import { BC_COLOURS } from "../../../../../themes/bcGovStyles";
import { updateUserInfo } from "../../../apiManager/manageProfileAPI";
import {
  BCEID_PROFILE_TABS,
  ReadUserInformationResponse,
  UserInfoRequest,
} from "../../../types/manageProfile.d";
import UserGroupsAndPermissionsModal from "../../user-management/UserGroupsAndPermissionsModal";
import { ReusableUserInfoForm } from "../common/ReusableUserInfoForm";
import "../myInfo/MyInfoForm.scss";
import { UserAuthRadioGroup } from "./UserAuthRadioGroup";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../../../common/helpers/util";
import { BCeID_USER_ROLE } from "../../../../../common/authentication/types";
import { AxiosError } from "axios";

/**
 * Edit User form for User Management.
 */
export const EditUserForm = memo(
  ({ userInfo }: { userInfo?: ReadUserInformationResponse }) => {
    const navigate = useNavigate();

    const { setSnackBar } = useContext(SnackBarContext);

    const formMethods = useForm<UserInfoRequest>({
      defaultValues: {
        firstName: getDefaultRequiredVal("", userInfo?.firstName),
        lastName: getDefaultRequiredVal("", userInfo?.lastName),
        email: getDefaultRequiredVal("", userInfo?.email),
        phone1: applyWhenNotNullable(formatPhoneNumber, userInfo?.phone1, ""),
        phone1Extension: getDefaultRequiredVal("", userInfo?.phone1Extension),
        phone2: applyWhenNotNullable(formatPhoneNumber, userInfo?.phone2, ""),
        phone2Extension: getDefaultRequiredVal("", userInfo?.phone2Extension),
        fax: applyWhenNotNullable(formatPhoneNumber, userInfo?.fax, ""),
        countryCode: getDefaultRequiredVal("", userInfo?.countryCode),
        provinceCode: getDefaultRequiredVal("", userInfo?.provinceCode),
        city: getDefaultRequiredVal("", userInfo?.city),
        userRole: getDefaultRequiredVal(
          BCeID_USER_ROLE.COMPANY_ADMINISTRATOR,
          userInfo?.userRole,
        ),
      },
    });
    const { handleSubmit } = formMethods;
    const FEATURE = "user-info-form";

    const [isUserGroupsModalOpen, setIsUserGroupsModalOpen] =
      useState<boolean>(false);

    /**
     * On click handler for the breadcrumbs. Navigates to the parent pages.
     */
    const onClickBreadcrumb = () => {
      navigate(PROFILE_ROUTES.MANAGE, {
        state: {
          selectedTab: BCEID_PROFILE_TABS.USER_MANAGEMENT,
        },
      });
    };

    /**
     * Updates the user info.
     */
    const updateUserInfoMutation = useMutation({
      mutationFn: updateUserInfo,
      onError: (error: AxiosError) => {
        navigate(ERROR_ROUTES.UNEXPECTED, {
          state: { correlationId: error.response?.headers["x-correlation-id"] },
        });
      },
      onSuccess: (response) => {
        if (response.status === 200) {
          setSnackBar({
            alertType: "success",
            message: "Changes Saved",
            showSnackbar: true,
            setShowSnackbar: () => true,
          });

          navigate(PROFILE_ROUTES.MANAGE, {
            state: {
              selectedTab: BCEID_PROFILE_TABS.USER_MANAGEMENT,
            },
          });
        } else {
          navigate(ERROR_ROUTES.UNEXPECTED, {
            state: { correlationId: response.headers["x-correlation-id"] },
          });
        }
      },
    });

    /**
     * On click handler for Save button.
     * @param data The edit user form data.
     */
    const onUpdateUserInfo = (data: UserInfoRequest) => {
      updateUserInfoMutation.mutate({
        userInfo: data,
        userGUID: userInfo?.userGUID as string,
      });
    };

    return (
      <FormProvider {...formMethods}>
        <Box
          className="layout-box"
          sx={{
            paddingTop: "24px",
            backgroundColor: BC_COLOURS.white,
          }}
        >
          <Stack spacing={4} divider={<Divider />}>
            <Stack direction="row" spacing={10}>
              <Typography
                variant={"h2"}
                sx={{
                  marginRight: "200px",
                  marginTop: "0px",
                  paddingTop: "0px",
                  borderBottom: "0px",
                }}
              >
                User Details
              </Typography>
              <ReusableUserInfoForm feature={FEATURE} />
            </Stack>
            <Stack direction="row">
              <Stack>
                <Typography
                  variant={"h2"}
                  sx={{
                    marginRight: "200px",
                    marginTop: "0px",
                    paddingTop: "0px",
                    borderBottom: "0px",
                  }}
                >
                  Assign User Group
                </Typography>
                <Typography
                  variant={"h2"}
                  sx={{
                    marginRight: "200px",
                    marginTop: "0px",
                    paddingTop: "0px",
                    borderBottom: "0px",
                  }}
                >
                  <CustomActionLink
                    onClick={() => setIsUserGroupsModalOpen(() => true)}
                  >
                    User Groups and Permissions
                  </CustomActionLink>
                </Typography>
              </Stack>
              <Stack spacing={2}>
                <Controller
                  name="userRole"
                  rules={{
                    required: { value: true, message: requiredMessage() },
                  }}
                  render={({ field, fieldState }) => (
                    <UserAuthRadioGroup field={field} fieldState={fieldState} />
                  )}
                ></Controller>
                <Stack direction="row" spacing={2}>
                  <Button
                    key="update-my-info-cancel-button"
                    aria-label="Cancel Update"
                    variant="contained"
                    color="tertiary"
                    onClick={onClickBreadcrumb}
                  >
                    Cancel
                  </Button>
                  <Button
                    key="update-my-info-button"
                    aria-label="Update My Info"
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit(onUpdateUserInfo)}
                  >
                    Save
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <br />
          <UserGroupsAndPermissionsModal
            isOpen={isUserGroupsModalOpen}
            onClickClose={() => setIsUserGroupsModalOpen(() => false)}
          />
        </Box>
      </FormProvider>
    );
  },
);

EditUserForm.displayName = "EditUserForm";
