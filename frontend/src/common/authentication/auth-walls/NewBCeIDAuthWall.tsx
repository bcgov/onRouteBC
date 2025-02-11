import { useContext } from "react";
import { useAuth } from "react-oidc-context";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ERROR_ROUTES, HOME } from "../../../routes/constants";
import { Loading } from "../../pages/Loading";
import { IDPS } from "../../types/idp";
import { LoadBCeIDUserContext } from "../LoadBCeIDUserContext";
import OnRouteBCContext from "../OnRouteBCContext";

const isBCeID = (identityProvider: string) => identityProvider === IDPS.BUSINESS_BCEID;

/**
 * This component ensures that a page is only available to new BCeID users.
 */
export const NewBCeIDAuthWall = () => {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    user: userFromToken,
  } = useAuth();

  const { isNewBCeIDUser, companyId, userDetails } =
    useContext(OnRouteBCContext);

  const userIDP = userFromToken?.profile?.identity_provider as string;
  const location = useLocation();

  if (isAuthLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    if (isBCeID(userIDP)) {
      // Condition to check if the user context must be loaded.
      if (
        !companyId &&
        isNewBCeIDUser === undefined &&
        !userDetails?.userRole
      ) {
        return (
          <>
            <LoadBCeIDUserContext />
            <Loading />
          </>
        );
      }
      if (isNewBCeIDUser) {
        // The user is now authenticated and confirmed to be a new user
        return <Outlet />;
      }
      /**
       * Implementation Note:
       * There is no need to load up the user roles.
       * User context is sufficient enough to determine whether the user
       * already has a profile in the system.
       */
    } else {
      /**
       * This is a placeholder to navigate an IDIR user to the unexpected error page
       * since a companyId is necessary for them to do anything and
       * that feature is yet to be built.
       *
       * Once we set up idir user acting as a company, there will be appropriate
       * handlers here.
       */
      return (
        <Navigate
          to={ERROR_ROUTES.UNEXPECTED}
          state={{ from: location }}
          replace
        />
      );
    }
  }
  /**
   * The user is either a) unauthenticated or b) set up their profile already.
   * Redirect them to home page either way.
   */
  return <Navigate to={HOME} state={{ from: location }} replace />;
};

NewBCeIDAuthWall.displayName = "NewBCeIDAuthWall";
