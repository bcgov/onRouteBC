import { useAuth } from "react-oidc-context";
import { useLocation, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";

import { HOME, ERROR_ROUTES } from "./constants";
import { Loading } from "../common/pages/Loading";
import OnRouteBCContext from "../common/authentication/OnRouteBCContext";
import { DoesUserHaveRole } from "../common/authentication/util";
import { LoadBCeIDUserRolesByCompany } from "../common/authentication/LoadBCeIDUserRolesByCompany";
import { LoadBCeIDUserContext } from "../common/authentication/LoadBCeIDUserContext";
import { LoadIDIRUserContext } from "../common/authentication/LoadIDIRUserContext";
import { LoadIDIRUserRoles } from "../common/authentication/LoadIDIRUserRoles";
import { IDPS } from "../common/types/idp";

const isIDIR = (identityProvider: string) => identityProvider === IDPS.IDIR;

export const ProtectedRoutes = ({
  requiredRole,
}: {
  requiredRole?: string;
}) => {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    user: userFromToken,
  } = useAuth();

  const { userRoles, companyId, idirUserDetails } =
    useContext(OnRouteBCContext);

  const userIDP = userFromToken?.profile?.identity_provider as string;

  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Redirect the user back to login page if they are trying to directly access
   * a protected page but are unauthenticated.
   */
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate(HOME);
    }
  }, [isAuthLoading, isAuthenticated]);

  if (isAuthLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    if (isIDIR(userIDP)) {
      if (!idirUserDetails?.userAuthGroup) {
        return (
          <>
            <LoadIDIRUserContext />
            <Loading />
          </>
        );
      }
      if (!userRoles) {
        return (
          <>
            <LoadIDIRUserRoles />
            <Loading />
          </>
        );
      }
    }
    if (!isIDIR(userIDP)) {
      if (!companyId) {
        return (
          <>
            <LoadBCeIDUserContext />
            <Loading />
          </>
        );
      }
      if (!userRoles) {
        return (
          <>
            <LoadBCeIDUserRolesByCompany />
            <Loading />
          </>
        );
      }
    }

    if (!DoesUserHaveRole(userRoles, requiredRole)) {
      return (
        <Navigate
          to={ERROR_ROUTES.UNAUTHORIZED}
          state={{ from: location }}
          replace
        />
      );
    }
    return <Outlet />;
  } else {
    return <Navigate to={HOME} state={{ from: location }} replace />;
  }
};
