import { useContext, useEffect, useState } from "react";
import { SnackBarContext } from "../../../../App";
import { OnRouteBCTableRowActions } from "../../../../common/components/table/OnRouteBCTableRowActions";
import {
  useInvalidateApplicationsInQueue,
  useUpdateApplicationInQueueStatus,
} from "../../../queue/hooks/hooks";
import { CASE_ACTIVITY_TYPES } from "../../../queue/types/CaseActivityType";
import { ApplicationInReviewModal } from "./ApplicationInReviewModal";

const PERMIT_ACTION_OPTION_TYPES = {
  WITHDRAW_APPLICATION: "withdrawApplication",
} as const;

type PermitActionOptionType =
  (typeof PERMIT_ACTION_OPTION_TYPES)[keyof typeof PERMIT_ACTION_OPTION_TYPES];

const getOptionLabel = (optionType: PermitActionOptionType): string => {
  if (optionType === PERMIT_ACTION_OPTION_TYPES.WITHDRAW_APPLICATION) {
    return "Withdraw Application";
  }

  return "";
};

const ALL_OPTIONS = [
  {
    label: getOptionLabel(PERMIT_ACTION_OPTION_TYPES.WITHDRAW_APPLICATION),
    value: PERMIT_ACTION_OPTION_TYPES.WITHDRAW_APPLICATION,
  },
];

const getOptions = (isInReview: boolean) => {
  return ALL_OPTIONS.filter((option) => {
    // Exclude 'WITHDRAW_APPLICATION' if 'isInReview' is false
    if (
      isInReview &&
      option.value === PERMIT_ACTION_OPTION_TYPES.WITHDRAW_APPLICATION
    ) {
      return false;
    }
    return true;
  });
};

export const ApplicationsInReviewRowOptions = ({
  isInReview,
  permitId,
}: {
  isInReview: boolean;
  permitId: string;
}) => {
  const { invalidate } = useInvalidateApplicationsInQueue();

  const [isAIRModalOpen, setIsAIRModalOpen] = useState<boolean>(false);

  const handleCloseAIRModal = () => {
    setIsAIRModalOpen(false);
    invalidate();
  };

  const {
    mutateAsync: updateApplication,
    data: updateApplicationResponse,
    error: updateApplicationError,
  } = useUpdateApplicationInQueueStatus();

  const updateApplicationErrorStatus = updateApplicationError?.response?.status;

  useEffect(() => {
    if (updateApplicationErrorStatus === 422) {
      // if the application has already been withdrawn by another user
      return setIsAIRModalOpen(true);
    }
  }, [updateApplicationErrorStatus]);

  const isSuccess = (status?: number) => status === 201;
  const { setSnackBar } = useContext(SnackBarContext);

  useEffect(() => {
    if (isSuccess(updateApplicationResponse?.status)) {
      setSnackBar({
        showSnackbar: true,
        setShowSnackbar: () => true,
        message: "Withdrawn to Applications in Progress",
        alertType: "info",
      });
      invalidate();
    }
  }, [updateApplicationResponse]);

  /**
   * Action handler upon a select event.
   * @param selectedOption The option that was selected.
   */
  const onSelectOptionCallback = async (selectedOption: string) => {
    if (selectedOption === PERMIT_ACTION_OPTION_TYPES.WITHDRAW_APPLICATION) {
      await updateApplication({
        applicationId: permitId,
        caseActivityType: CASE_ACTIVITY_TYPES.WITHDRAWN,
      });
    }
  };

  return (
    <>
      <OnRouteBCTableRowActions
        onSelectOption={onSelectOptionCallback}
        options={getOptions(isInReview)}
      />

      <ApplicationInReviewModal
        isOpen={isAIRModalOpen}
        onCancel={handleCloseAIRModal}
        onConfirm={handleCloseAIRModal}
      />
    </>
  );
};
