import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

import { BCeIDUserContextType, IDIRUserContextType } from "./types";
import { Loading } from "../pages/Loading";
import { IDPS } from "../types/idp";
import { Optional } from "../types/common";
import {
  APPLICATIONS_ROUTES,
  CREATE_PROFILE_WIZARD_ROUTES,
  ERROR_ROUTES,
  IDIR_ROUTES,
} from "../../routes/constants";

import {
  useUserContext,
  useUserContextQuery,
} from "../../features/manageProfile/apiManager/hooks";
import { canViewApplicationQueue } from "../../features/queue/helpers/canViewApplicationQueue";
import { getDefaultRequiredVal } from "../helpers/util";

const navigateBCeID = (
  userContextData: BCeIDUserContextType,
): string | undefined => {
  const { associatedCompanies, pendingCompanies, migratedClient, user } =
    userContextData;

  const isAssociatedSuspended = getDefaultRequiredVal(
    [],
    associatedCompanies,
  ).find((company) => Boolean(company.isSuspended));

  const isPendingSuspended = getDefaultRequiredVal([], pendingCompanies).find(
    (company) => Boolean(company.isSuspended),
  );

  // If the user does not exist
  if (!user?.userGUID) {
    // The user is in pending companies => Redirect them to User Info Page.
    // i.e., The user has been invited.
    if (pendingCompanies?.length > 0) {
      return CREATE_PROFILE_WIZARD_ROUTES.WELCOME;
    }
    // The user and company do not exist (not a migrated client)
    //     => Redirect them to the welcome page with challenge.
    else if (associatedCompanies?.length < 1 && !migratedClient?.clientNumber) {
      return CREATE_PROFILE_WIZARD_ROUTES.WELCOME;
    }
    // The user does not exist but the business guid matches a migrated client.
    //    => Take them to no challenge workflow.
    else if (migratedClient?.clientNumber) {
      return CREATE_PROFILE_WIZARD_ROUTES.WELCOME;
    }
    // The user does not exist but there is one or more associated companies
    // due to business GUID match. This is an error scenario and the user is unauthorized.

    // Simply put, if !user and associatedCompanies.length > 0, get the guy out of here.
    else {
      return ERROR_ROUTES.UNAUTHORIZED;
    }
  }
  // The user exists but either the associated company or pending company is suspended
  else if (isAssociatedSuspended || isPendingSuspended) {
    return ERROR_ROUTES.SUSPENDED;
  }
  // The user and company exist
  else if (associatedCompanies?.length) {
    return APPLICATIONS_ROUTES.BASE;
  }
  // User exists but company does not exist. This is not a possible scenario.
  else if (!associatedCompanies?.length) {
    // Error Page
    return ERROR_ROUTES.UNAUTHORIZED;
  }

  // else if(pendingCompanies?.length) (i.e., user exists and has invites from a company)
  // is not a valid block currently because
  // one user can only be part of one company currently.
  // -----------------------------
};

/*
 * Redirects user to their correct page after loading their
 * user and company info.
 */
export const LoginRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user: userFromToken } = useAuth();

  const {
    isPending,
    isError,
    data: userContextResponse,
  } = useUserContextQuery();
  const queryClient = useQueryClient();

  useUserContext(userContextResponse);

  /**
   * Hook to determine where to navigate to.
   */
  useEffect(() => {
    if (isError) {
      return navigate(ERROR_ROUTES.UNEXPECTED);
    }

    if (isAuthenticated && !isPending) {
      const redirectURI = sessionStorage.getItem(
        "onrouteBC.postLogin.redirect",
      );
      if (redirectURI) {
        // Clean up sessionStorage of post login redirect link; we no longer need it.
        sessionStorage.removeItem("onrouteBC.postLogin.redirect");
        navigate(redirectURI);
      } else if (userFromToken?.profile?.identity_provider === IDPS.IDIR) {
        const userContextData: Optional<IDIRUserContextType> =
          queryClient.getQueryData<IDIRUserContextType>(["userContext"]);
        // only IDIR users with PC, SA, CTPO or TRAIN should redirect to STAFF_HOME
        if (canViewApplicationQueue(userContextData?.user?.userRole)) {
          navigate(IDIR_ROUTES.STAFF_HOME);
        } else if (userContextData?.user?.userGUID) {
          navigate(IDIR_ROUTES.WELCOME);
        } else {
          navigate(ERROR_ROUTES.UNAUTHORIZED);
        }
      } else {
        const userContextData: Optional<BCeIDUserContextType> =
          queryClient.getQueryData<BCeIDUserContextType>(["userContext"]);
        const to = navigateBCeID(userContextData as BCeIDUserContextType);
        navigate(to ?? ERROR_ROUTES.UNEXPECTED);
      }
    }
  }, [isPending, isError, isAuthenticated, userFromToken]);

  if (isPending) {
    return <Loading />;
  }

  return <></>;
};
