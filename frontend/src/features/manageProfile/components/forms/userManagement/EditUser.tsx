import { memo, useContext, useState } from "react";
import isEmail from "validator/lib/isEmail";

import {
  Box,
  Button,
  Divider,
  Link,
  Stack,
  Typography
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import {
  Controller,
  FieldValues,
  FormProvider,
  useForm,
} from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { SnackBarContext } from "../../../../../App";
import { CountryAndProvince } from "../../../../../common/components/form/CountryAndProvince";
import { CustomFormComponent } from "../../../../../common/components/form/CustomFormComponents";
import { formatPhoneNumber } from "../../../../../common/components/form/subFormComponents/PhoneNumberInput";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../../../common/helpers/util";
import {
  invalidCityLength,
  invalidEmail,
  invalidExtensionLength,
  invalidFirstNameLength,
  invalidLastNameLength,
  invalidPhoneLength,
  requiredMessage,
} from "../../../../../common/helpers/validationMessages";
import { MANAGE_PROFILES } from "../../../../../routes/constants";
import { BC_COLOURS } from "../../../../../themes/bcGovStyles";
import { updateUserInfo } from "../../../apiManager/manageProfileAPI";
import { BCEID_PROFILE_TABS } from "../../../types/manageProfile.d";
import {
  BCeIDAuthGroup,
  ReadCompanyUser,
} from "../../../types/userManagement.d";
import UserGroupsAndPermissionsModal from "../../user-management/UserGroupsAndPermissionsModal";
import "../myInfo/MyInfoForm.scss";
import { UserAuthRadioGroup } from "./UserAuthRadioGroup";

/**
 * Edit User form for User Management.
 */
export const EditUserForm = memo(
  ({ userInfo }: { userInfo?: ReadCompanyUser }) => {
    const navigate = useNavigate();

    const { setSnackBar } = useContext(SnackBarContext);

    const formMethods = useForm<ReadCompanyUser>({
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
        userAuthGroup: BCeIDAuthGroup.ORGADMIN,
      },
    });
    const { handleSubmit } = formMethods;
    const FEATURE = "user-info-form";

    const [isUserGroupsModalOpen, setIsUserGroupsModalOpen] =
      useState<boolean>(false);

    const onClickBreadcrumb = () => {
      navigate(`/${MANAGE_PROFILES}`, {
        state: {
          selectedTab: BCEID_PROFILE_TABS.USER_MANAGEMENT_ORGADMIN,
        },
      });
    };

    const updateUserInfoMutation = useMutation({
      mutationFn: updateUserInfo,
      onError: () => {
        setSnackBar({
          message: "An unexpected error occurred.",
          showSnackbar: true,
          setShowSnackbar: () => true,
          alertType: "error",
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

          navigate(`/${MANAGE_PROFILES}`, {
            state: { selectedTab: BCEID_PROFILE_TABS.USER_MANAGEMENT_ORGADMIN },
          });
        }
      },
    });

    const onUpdateUserInfo = (data: FieldValues) => {
      updateUserInfoMutation.mutate({
        userInfo: data as ReadCompanyUser,
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
              <div className="my-info-form">
                <CustomFormComponent
                  type="input"
                  feature={FEATURE}
                  options={{
                    name: "firstName",
                    rules: {
                      required: { value: true, message: requiredMessage() },
                      validate: {
                        validateFirstName: (firstName: string) =>
                          (firstName.length >= 1 && firstName.length <= 100) ||
                          invalidFirstNameLength(1, 100),
                      },
                    },
                    label: "First Name",
                  }}
                  className="my-info-form__input"
                />
                <CustomFormComponent
                  type="input"
                  feature={FEATURE}
                  options={{
                    name: "lastName",
                    rules: {
                      required: { value: true, message: requiredMessage() },
                      validate: {
                        validateLastName: (lastName: string) =>
                          (lastName.length >= 1 && lastName.length <= 100) ||
                          invalidLastNameLength(1, 100),
                      },
                    },
                    label: "Last Name",
                  }}
                  className="my-info-form__input"
                />
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
                  className="my-info-form__input"
                />
                <div className="side-by-side-inputs">
                  <CustomFormComponent
                    type="phone"
                    feature={FEATURE}
                    options={{
                      name: "phone1",
                      rules: {
                        required: { value: true, message: requiredMessage() },
                        validate: {
                          validatePhone1: (phone: string) =>
                            (phone.length >= 10 && phone.length <= 20) ||
                            invalidPhoneLength(10, 20),
                        },
                      },
                      label: "Primary Phone",
                    }}
                    className="my-info-form__input my-info-form__input--left"
                  />
                  <CustomFormComponent
                    type="input"
                    feature={FEATURE}
                    options={{
                      name: "phone1Extension",
                      rules: {
                        required: false,
                        validate: {
                          validateExt1: (ext?: string) =>
                            ext == null ||
                            ext === "" ||
                            (ext != null && ext !== "" && ext.length <= 5) ||
                            invalidExtensionLength(5),
                        },
                      },
                      label: "Ext",
                    }}
                    className="my-info-form__input my-info-form__input--right"
                  />
                </div>
                <div className="side-by-side-inputs">
                  <CustomFormComponent
                    type="phone"
                    feature={FEATURE}
                    options={{
                      name: "phone2",
                      rules: {
                        required: false,
                        validate: {
                          validatePhone2: (phone2?: string) =>
                            phone2 == null ||
                            phone2 === "" ||
                            (phone2 != null &&
                              phone2 !== "" &&
                              phone2.length >= 10 &&
                              phone2.length <= 20) ||
                            invalidPhoneLength(10, 20),
                        },
                      },
                      label: "Alternate Phone",
                    }}
                    className="my-info-form__input my-info-form__input--left"
                  />
                  <CustomFormComponent
                    type="input"
                    feature={FEATURE}
                    options={{
                      name: "phone2Extension",
                      rules: {
                        required: false,
                        validate: {
                          validateExt2: (ext?: string) =>
                            ext == null ||
                            ext === "" ||
                            (ext != null && ext !== "" && ext.length <= 5) ||
                            invalidExtensionLength(5),
                        },
                      },
                      label: "Ext",
                    }}
                    className="my-info-form__input my-info-form__input--right"
                  />
                </div>
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
                  className="my-info-form__input my-info-form__input--left"
                />
                <CountryAndProvince
                  feature={FEATURE}
                  countryField="countryCode"
                  provinceField="provinceCode"
                  width="100%"
                />
                <CustomFormComponent
                  type="input"
                  feature={FEATURE}
                  options={{
                    name: "city",
                    rules: {
                      required: { value: true, message: requiredMessage() },
                      validate: {
                        validateCity: (city: string) =>
                          (city.length >= 1 && city.length <= 100) ||
                          invalidCityLength(1, 100),
                      },
                    },
                    label: "City",
                  }}
                  className="my-info-form__input"
                />
              </div>
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
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => setIsUserGroupsModalOpen(() => true)}
                  >
                    User Groups and Permissions
                  </Link>
                </Typography>
              </Stack>
              <Stack spacing={2}>
                <Controller
                  name="userAuthGroup"
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
                    // className="submit-btn submit-btn--cancel"
                    aria-label="Cancel Update"
                    variant="contained"
                    color="tertiary"
                    onClick={onClickBreadcrumb}
                  >
                    Cancel
                  </Button>
                  <Button
                    key="update-my-info-button"
                    // className="submit-btn"
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
          {/* <div className="my-info-form__submission"></div> */}
        </Box>
      </FormProvider>
    );
  }
);

EditUserForm.displayName = "EditUserForm";
