import { useContext, useEffect, useState } from "react";
import { Switch } from "@mui/material";
import { useNavigate } from "react-router-dom";

import "./Suspend.scss";
import { SuspendModal } from "../components/suspend/SuspendModal";
import {
  useSuspendCompanyMutation,
  useSuspensionHistoryQuery,
} from "../hooks/suspend";
import { getDefaultRequiredVal } from "../../../common/helpers/util";
import { SuspensionHistory } from "../components/suspend/SuspensionHistory";
import { SUSPEND_ACTIVITY_TYPES } from "../types/suspend";
import OnRouteBCContext from "../../../common/authentication/OnRouteBCContext";
import { canUpdateSuspend } from "../helpers/permissions";
import { ERROR_ROUTES } from "../../../routes/constants";

export const Suspend = ({
  companyId,
  hideTab,
}: {
  companyId: number;
  hideTab?: (hide: boolean) => void;
}) => {
  const navigate = useNavigate();

  const {
    data: suspensionHistory,
    isError: fetchHistoryError,
    refetch: refetchSuspensionHistory,
  } = useSuspensionHistoryQuery(companyId);

  // Check if user can update suspend
  const { userClaims, isCompanySuspended, setIsCompanySuspended } =
    useContext(OnRouteBCContext);

  const canSuspendCompany = canUpdateSuspend(userClaims);

  const suspendCompanyMutation = useSuspendCompanyMutation();

  const suspensionHistoryList = fetchHistoryError
    ? []
    : getDefaultRequiredVal([], suspensionHistory);

  const [showSuspendModal, setShowSuspendModal] = useState<boolean>(false);

  // Let Settings dashboard hide "Suspend" tab if:
  // User isn't allowed to suspend company AND company has never been suspended before
  useEffect(() => {
    hideTab?.(
      !canSuspendCompany &&
        suspensionHistory != null &&
        suspensionHistory.length === 0,
    );
  }, [canSuspendCompany, suspensionHistory]);

  useEffect(() => {
    // Get current suspension status for company from the most recent entry in suspension history
    // If suspension history is empty, it's assumed that the company has not yet been suspended
    // This should be used as the source of truth for determining if the company is currently suspended.
    const isCurrentlySuspended =
      suspensionHistoryList.length > 0
        ? suspensionHistoryList[0].suspendActivityType ===
          SUSPEND_ACTIVITY_TYPES.SUSPEND_COMPANY
        : false;

    setIsCompanySuspended?.(isCurrentlySuspended);
  }, [suspensionHistoryList]);

  const isActionSuccessful = (status: number) => {
    return status === 201;
  };

  const handleSuspendCompany = async (reason: string) => {
    const suspendResult = await suspendCompanyMutation.mutateAsync({
      companyId,
      data: {
        suspendActivityType: SUSPEND_ACTIVITY_TYPES.SUSPEND_COMPANY,
        comment: reason,
      },
    });
    if (isActionSuccessful(suspendResult.status)) {
      refetchSuspensionHistory();
      setShowSuspendModal(false);
    } else {
      navigate(ERROR_ROUTES.UNEXPECTED, {
        state: { correlationId: suspendResult.headers["x-correlation-id"] },
      });
    }
  };

  const handleUnsuspendCompany = async () => {
    const unsuspendResult = await suspendCompanyMutation.mutateAsync({
      companyId,
      data: {
        suspendActivityType: SUSPEND_ACTIVITY_TYPES.UNSUSPEND_COMPANY,
      },
    });

    if (isActionSuccessful(unsuspendResult.status)) {
      refetchSuspensionHistory();
    } else {
      navigate(ERROR_ROUTES.UNEXPECTED, {
        state: { correlationId: unsuspendResult.headers["x-correlation-id"] },
      });
    }
  };

  const handleSuspendToggle = async (toSuspend: boolean) => {
    if (toSuspend) {
      setShowSuspendModal(true);
    } else {
      await handleUnsuspendCompany();
    }
  };

  return (
    <div className="suspend-page">
      {canSuspendCompany ? (
        <div className="suspend-page__suspend-company">
          <div className="suspend-page__title suspend-page__title--company">
            Suspend Company
          </div>

          <Switch
            className="suspend-company-switch"
            checked={Boolean(isCompanySuspended)}
            onChange={async (_, checked) => await handleSuspendToggle(checked)}
          />
        </div>
      ) : null}

      {suspensionHistoryList.length > 0 ? (
        <div className="suspend-page__suspension-history">
          <div className="suspend-page__title suspend-page__title--history">
            Suspension History
          </div>

          <SuspensionHistory suspensionHistory={suspensionHistoryList} />
        </div>
      ) : null}

      {showSuspendModal ? (
        <SuspendModal
          showModal={showSuspendModal}
          onCancel={() => setShowSuspendModal(false)}
          onConfirm={handleSuspendCompany}
        />
      ) : null}
    </div>
  );
};
