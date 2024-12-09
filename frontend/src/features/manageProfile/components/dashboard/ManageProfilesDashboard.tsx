import { Button } from "@mui/material";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Navigate } from "react-router-dom";

import OnRouteBCContext from "../../../../common/authentication/OnRouteBCContext";
import { CLAIMS } from "../../../../common/authentication/types";
import { DoesUserHaveClaim } from "../../../../common/authentication/util";
import { TabLayout } from "../../../../common/components/dashboard/TabLayout";
import { FIVE_MINUTES } from "../../../../common/constants/constants";
import { ErrorFallback } from "../../../../common/pages/ErrorFallback";
import { Loading } from "../../../../common/pages/Loading";
import { getCompanyInfo } from "../../apiManager/manageProfileAPI";
import { CompanyInfo } from "../../pages/CompanyInfo";
import { MyInfo } from "../../pages/MyInfo";
import { UserManagement } from "../../pages/UserManagement";
import { BCEID_PROFILE_TABS } from "../../types/manageProfile.d";
import { ERROR_ROUTES, PROFILE_ROUTES } from "../../../../routes/constants";
import { getDefaultRequiredVal } from "../../../../common/helpers/util";
import { SpecialAuthorizations } from "../../../settings/pages/SpecialAuthorizations/SpecialAuthorizations";
import { ViewCreditAccount } from "../../../settings/pages/ViewCreditAccount";
import { useGetCreditAccountMetadataQuery } from "../../../settings/hooks/creditAccount";
import { useFeatureFlagsQuery } from "../../../../common/hooks/hooks";
import {
  CREDIT_ACCOUNT_USER_TYPE,
  CreditAccountMetadata,
} from "../../../settings/types/creditAccount";
import { usePermissionMatrix } from "../../../../common/authentication/PermissionMatrix";
import { useFetchSpecialAuthorizations } from "../../../settings/hooks/specialAuthorizations";

interface ProfileDashboardTab {
  label: string;
  component: JSX.Element;
  componentKey: string;
}

/**
 * Returns a boolean indicating if the logged in user is a BCeID org admin.
 *
 * @param userClaims The array of claims from the context.
 * @returns A boolean value.
 */
export const isBCeIDOrgAdmin = (userClaims: string[]): boolean => {
  return Boolean(DoesUserHaveClaim(userClaims, CLAIMS.PUBLIC_ORG_ADMIN));
};

export const ManageProfilesDashboard = React.memo(() => {
  const {
    data: companyInfoData,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["companyInfo"],
    queryFn: getCompanyInfo,
    placeholderData: keepPreviousData,
    refetchInterval: FIVE_MINUTES,
  });

  const navigate = useNavigate();

  const {
    userClaims,
    companyId: companyIdFromContext,
    idirUserDetails,
  } = useContext(OnRouteBCContext);

  const companyId = getDefaultRequiredVal(0, companyIdFromContext);
  const { data: creditAccountMetadata } =
    useGetCreditAccountMetadataQuery(companyId);
  const { data: featureFlags } = useFeatureFlagsQuery();
  const populatedUserClaims = getDefaultRequiredVal([], userClaims);
  const isStaffActingAsCompany = Boolean(idirUserDetails?.userRole);
  const isBCeIDAdmin = isBCeIDOrgAdmin(populatedUserClaims);
  const shouldAllowUserManagement = isBCeIDAdmin || isStaffActingAsCompany;

  const { data: specialAuthorizations, isPending: isSpecialAuthAPILoading } =
    useFetchSpecialAuthorizations(companyId as number, true);

  const showSpecialAuth = usePermissionMatrix({
    additionalConditionToCheck: () =>
      !isStaffActingAsCompany &&
      (featureFlags?.["LOA"] === "ENABLED" ||
        featureFlags?.["NO-FEE"] === "ENABLED" ||
        featureFlags?.["LCV"] === "ENABLED") &&
      !isSpecialAuthAPILoading &&
      Boolean(
        specialAuthorizations?.isLcvAllowed || specialAuthorizations?.noFeeType,
      ),
    permissionMatrixKeys: {
      permissionMatrixFeatureKey: "MANAGE_PROFILE",
      permissionMatrixFunctionKey: "VIEW_SPECIAL_AUTHORIZATIONS",
    },
  });
  const isCreditAccountHolder =
    creditAccountMetadata?.userType === CREDIT_ACCOUNT_USER_TYPE.HOLDER;

  const showCreditAccountTab = usePermissionMatrix({
    featureFlag: "CREDIT-ACCOUNT",
    permissionMatrixKeys: {
      permissionMatrixFeatureKey: "MANAGE_SETTINGS",
      permissionMatrixFunctionKey: "VIEW_CREDIT_ACCOUNT_TAB_ACCOUNT_HOLDER",
    },
    additionalConditionToCheck: () => isCreditAccountHolder,
  });

  const { state: stateFromNavigation } = useLocation();

  const tabs: ProfileDashboardTab[] = [
    {
      label: "Company Information",
      component: <CompanyInfo companyInfoData={companyInfoData} />,
      componentKey: BCEID_PROFILE_TABS.COMPANY_INFORMATION,
    },
    !isStaffActingAsCompany
      ? {
          label: "My Information",
          component: <MyInfo />,
          componentKey: BCEID_PROFILE_TABS.MY_INFORMATION,
        }
      : null,
    shouldAllowUserManagement
      ? {
          label: "Add / Manage Users",
          component: <UserManagement />,
          componentKey: BCEID_PROFILE_TABS.USER_MANAGEMENT,
        }
      : null,
    showSpecialAuth && companyId
      ? {
          label: "Special Authorizations",
          component: <SpecialAuthorizations companyId={companyId} />,
          componentKey: BCEID_PROFILE_TABS.SPECIAL_AUTH,
        }
      : null,
    showCreditAccountTab
      ? {
          label: "Credit Account",
          component: (
            <ViewCreditAccount
              companyId={companyId}
              creditAccountMetadata={
                creditAccountMetadata as CreditAccountMetadata
              }
            />
          ),
          componentKey: BCEID_PROFILE_TABS.CREDIT_ACCOUNT,
        }
      : null,
  ].filter((tab) => Boolean(tab)) as ProfileDashboardTab[];

  const getSelectedTabFromNavigation = (): number => {
    const tabIndex = tabs.findIndex(
      ({ componentKey }) => componentKey === stateFromNavigation?.selectedTab,
    );
    if (tabIndex < 0) return 0;
    return tabIndex;
  };

  // Only show "Add User" button for Add / Manage Users tab
  const showAddUserButton = (selectedTabIndex: number) => {
    // Get index of Add / Manage Users tab, if it exists
    const userManagementTabIndex = tabs.findIndex(
      (tab) => tab.componentKey === BCEID_PROFILE_TABS.USER_MANAGEMENT,
    );

    return (
      shouldAllowUserManagement && selectedTabIndex === userManagementTabIndex
    );
  };

  const initialSelectedTabIndex = getSelectedTabFromNavigation();
  const [shouldShowAddUserButton, setShouldShowAddUserButton] =
    useState<boolean>(showAddUserButton(initialSelectedTabIndex));

  // Set whether or not to show "Add User" button when tab changes
  const handleTabChange = (selectedTabIndex: number) => {
    setShouldShowAddUserButton(showAddUserButton(selectedTabIndex));
  };

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    const isUnauthorized =
      error instanceof AxiosError && error.response?.status == 401;
    return isUnauthorized ? (
      <Navigate to={ERROR_ROUTES.UNAUTHORIZED} />
    ) : (
      <ErrorFallback error={error.message} />
    );
  }

  return (
    <TabLayout
      bannerText="Profile"
      componentList={tabs}
      selectedTabIndex={initialSelectedTabIndex}
      onTabChange={handleTabChange}
      bannerButton={
        shouldShowAddUserButton ? (
          <Button
            variant="contained"
            onClick={() => navigate(PROFILE_ROUTES.ADD_USER)}
            sx={{
              height: "50px",
            }}
          >
            Add User
          </Button>
        ) : undefined
      }
    />
  );
});

ManageProfilesDashboard.displayName = "ManageProfilesDashboard";
