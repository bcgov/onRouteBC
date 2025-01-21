import { Button } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import { ReusableUserInfoForm } from "../common/ReusableUserInfoForm";
import "./MyInfoForm.scss";
import { updateMyInfo } from "../../../apiManager/manageProfileAPI";
import { ERROR_ROUTES } from "../../../../../routes/constants";
import { getFormattedPhoneNumber } from "../../../../../common/helpers/phone/getFormattedPhoneNumber";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../../../common/helpers/util";

import {
  ReadUserInformationResponse,
  UserInfoRequest,
} from "../../../types/manageProfile";

import {
  BCeIDUserRoleType,
  BCeID_USER_ROLE,
} from "../../../../../common/authentication/types";

const FEATURE = "my-info-form";

export const MyInfoForm = memo(
  ({
    myInfo,
    setIsEditing,
  }: {
    myInfo?: ReadUserInformationResponse;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const formMethods = useForm<UserInfoRequest>({
      defaultValues: {
        firstName: getDefaultRequiredVal("", myInfo?.firstName),
        lastName: getDefaultRequiredVal("", myInfo?.lastName),
        email: getDefaultRequiredVal("", myInfo?.email),
        phone1: applyWhenNotNullable(getFormattedPhoneNumber, myInfo?.phone1, ""),
        phone1Extension: getDefaultRequiredVal("", myInfo?.phone1Extension),
        phone2: applyWhenNotNullable(getFormattedPhoneNumber, myInfo?.phone2, ""),
        phone2Extension: getDefaultRequiredVal("", myInfo?.phone2Extension),
        countryCode: getDefaultRequiredVal("", myInfo?.countryCode),
        provinceCode: getDefaultRequiredVal("", myInfo?.provinceCode),
        city: getDefaultRequiredVal("", myInfo?.city),
        userRole: getDefaultRequiredVal(
          BCeID_USER_ROLE.PERMIT_APPLICANT,
          myInfo?.userRole as BCeIDUserRoleType,
        ),
      },
    });

    const { handleSubmit } = formMethods;

    const addMyInfoMutation = useMutation({
      mutationFn: updateMyInfo,
      onSuccess: (response) => {
        if (response.status === 200) {
          queryClient.invalidateQueries({
            queryKey: ["myInfo"],
          });
          setIsEditing(false);
        }
      },
      onError: (error: AxiosError) => {
        navigate(ERROR_ROUTES.UNEXPECTED, {
          state: { correlationId: error.response?.headers["x-correlation-id"] },
        });
      },
    });

    const onUpdateMyInfo = (data: UserInfoRequest) => {
      addMyInfoMutation.mutate({
        myInfo: data,
      });
    };

    return (
      <div className="my-info-form">
        <FormProvider {...formMethods}>
          <ReusableUserInfoForm feature={FEATURE} />
        </FormProvider>

        <div className="my-info-form__submission">
          <Button
            key="update-my-info-cancel-button"
            className="submit-btn submit-btn--cancel"
            aria-label="Cancel Update"
            variant="contained"
            color="tertiary"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>

          <Button
            key="update-my-info-button"
            className="submit-btn"
            aria-label="Update My Info"
            variant="contained"
            color="primary"
            onClick={handleSubmit(onUpdateMyInfo)}
          >
            Save
          </Button>
        </div>
      </div>
    );
  },
);

MyInfoForm.displayName = "MyInfoForm";
