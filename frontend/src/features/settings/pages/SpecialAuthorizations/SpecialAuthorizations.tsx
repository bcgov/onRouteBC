import { useContext } from "react";
import "./SpecialAuthorizations.scss";
import { RequiredOrNull } from "../../../../common/types/common";
import { getDefaultRequiredVal } from "../../../../common/helpers/util";
import {
  DEFAULT_NO_FEE_PERMIT_TYPE,
  NoFeePermitType,
} from "../../types/SpecialAuthorization";
import { NoFeePermitsSection } from "../../components/SpecialAuthorizations/NoFeePermits/NoFeePermitsSection";
import { LCVSection } from "../../components/SpecialAuthorizations/LCV/LCVSection";
import { LOASection } from "../../components/SpecialAuthorizations/LOA/LOASection";

import {
  useFetchSpecialAuthorizations,
  useUpdateLCV,
  useUpdateNoFee,
} from "../../hooks/specialAuthorizations";
import { usePermissionMatrix } from "../../../../common/authentication/PermissionMatrix";
import { useFeatureFlagsQuery } from "../../../../common/hooks/hooks";
import OnRouteBCContext from "../../../../common/authentication/OnRouteBCContext";
import { useFetchLOAs } from "../../hooks/LOA";
export const SpecialAuthorizations = ({ companyId }: { companyId: number }) => {
  const { idirUserDetails } = useContext(OnRouteBCContext);
  const isStaffUser = Boolean(idirUserDetails?.userRole);
  const { data: featureFlags } = useFeatureFlagsQuery();
  const { data: specialAuthorizations, refetch: refetchSpecialAuth } =
    useFetchSpecialAuthorizations(
      companyId,
      // At least one of the special auth feature flags must be enabled
      // to decide whether to enable the query.
      featureFlags?.["NO-FEE"] === "ENABLED" ||
        featureFlags?.["LCV"] === "ENABLED" ||
        featureFlags?.["LOA"] === "ENABLED",
    );

  const noFeeType = getDefaultRequiredVal(
    null,
    specialAuthorizations?.noFeeType,
  );
  const isLcvAllowed = getDefaultRequiredVal(
    false,
    specialAuthorizations?.isLcvAllowed,
  );
  const activeLOAsQuery = useFetchLOAs(companyId, false);
  const expiredLOAsQuery = useFetchLOAs(companyId, true);
  const activeLOAs = getDefaultRequiredVal([], activeLOAsQuery.data);
  const expiredLOAs = getDefaultRequiredVal([], expiredLOAsQuery.data);
  const canWriteLOA = usePermissionMatrix({
    featureFlag: "LOA",
    permissionMatrixKeys: {
      permissionMatrixFeatureKey: "MANAGE_SETTINGS",
      permissionMatrixFunctionKey: "EDIT_AN_LOA",
    },
  });
  const isLoaAllowed =
    activeLOAs.length > 0 || expiredLOAs.length > 0 || canWriteLOA;

  const canEditNoFeePermits = usePermissionMatrix({
    featureFlag: "NO-FEE",
    permissionMatrixKeys: {
      permissionMatrixFeatureKey: "MANAGE_SETTINGS",
      permissionMatrixFunctionKey: "UPDATE_NO_FEE_FLAG",
    },
  });

  const canViewNoFeePermits = usePermissionMatrix({
    featureFlag: "NO-FEE",
    permissionMatrixKeys: isStaffUser
      ? {
          permissionMatrixFeatureKey: "MANAGE_SETTINGS",
          permissionMatrixFunctionKey: "VIEW_SPECIAL_AUTHORIZATIONS",
        }
      : {
          permissionMatrixFeatureKey: "MANAGE_PROFILE",
          permissionMatrixFunctionKey: "VIEW_SPECIAL_AUTHORIZATIONS",
        },
  });

  const canUpdateLCV = usePermissionMatrix({
    featureFlag: "LCV",
    permissionMatrixKeys: {
      permissionMatrixFeatureKey: "MANAGE_SETTINGS",
      permissionMatrixFunctionKey: "REMOVE_LCV_FLAG",
    },
  });

  const canViewLCV = usePermissionMatrix({
    featureFlag: "LCV",
    permissionMatrixKeys: isStaffUser
      ? {
          permissionMatrixFeatureKey: "MANAGE_SETTINGS",
          permissionMatrixFunctionKey: "VIEW_SPECIAL_AUTHORIZATIONS",
        }
      : {
          permissionMatrixFeatureKey: "MANAGE_PROFILE",
          permissionMatrixFunctionKey: "VIEW_SPECIAL_AUTHORIZATIONS",
        },
  });

  const canReadLOA = usePermissionMatrix({
    featureFlag: "LOA",
    permissionMatrixKeys: isStaffUser
      ? {
          permissionMatrixFeatureKey: "MANAGE_SETTINGS",
          permissionMatrixFunctionKey: "VIEW_LOA",
        }
      : {
          permissionMatrixFeatureKey: "MANAGE_PROFILE",
          permissionMatrixFunctionKey: "VIEW_LOA",
        },
  });

  const updateNoFeeMutation = useUpdateNoFee();
  const updateLCVMutation = useUpdateLCV();

  const handleToggleEnableNoFee = async (enable: boolean) => {
    if (!canEditNoFeePermits) return;

    const { status } = await updateNoFeeMutation.mutateAsync({
      companyId,
      noFee: enable ? DEFAULT_NO_FEE_PERMIT_TYPE : null,
    });

    if (status === 200 || status === 201) {
      refetchSpecialAuth();
    }
  };

  const handleUpdateNoFee = async (noFee: RequiredOrNull<NoFeePermitType>) => {
    if (!canEditNoFeePermits) return;
    const { status } = await updateNoFeeMutation.mutateAsync({
      companyId,
      noFee,
    });

    if (status === 200 || status === 201) {
      refetchSpecialAuth();
    }
  };

  const handleUpdateLCV = async (enableLCV: boolean) => {
    if (!canUpdateLCV) return;
    const { status } = await updateLCVMutation.mutateAsync({
      companyId,
      isLcvAllowed: enableLCV,
    });

    if (status === 200 || status === 201) {
      refetchSpecialAuth();
    }
  };

  return (
    <div className="special-authorizations">
      {canViewNoFeePermits ? (
        <NoFeePermitsSection
          onUpdateEnableNoFee={handleToggleEnableNoFee}
          noFeePermitType={noFeeType}
          onUpdateNoFee={handleUpdateNoFee}
          isEditable={canEditNoFeePermits}
        />
      ) : null}

      {canViewLCV ? (
        <LCVSection
          enableLCV={isLcvAllowed}
          onUpdateLCV={handleUpdateLCV}
          isEditable={canUpdateLCV}
        />
      ) : null}

      {canReadLOA ? (
        <LOASection
          canReadLOA={canReadLOA}
          companyId={companyId}
          enableLOA={isLoaAllowed}
        />
      ) : null}
    </div>
  );
};
