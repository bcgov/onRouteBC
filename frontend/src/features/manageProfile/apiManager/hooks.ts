import { useQuery } from "@tanstack/react-query";
import {
  getCompanyInfo,
  getUserContext,
  getUserRolesByCompanyId,
} from "./manageProfileAPI";
import { FIVE_MINUTES } from "../../../common/constants/constants";
import { useContext } from "react";
import OnRouteBCContext, {
  UserDetailContext,
} from "../../../common/authentication/OnRouteBCContext";
import { UserContextType } from "../../../common/authentication/types";
import { applyWhenNotNullable } from "../../../common/helpers/util";

/**
 * Fetches company info of current user.
 * @returns company info of current user, or error if failed
 */
export const useCompanyInfoQuery = () => {
  return useQuery({
    queryKey: ["companyInfo"],
    queryFn: getCompanyInfo,
    refetchInterval: FIVE_MINUTES,
    refetchOnWindowFocus: false, // fixes issue where a query is run everytime the screen is brought to foreground
    retry: false,
  });
};

/**
 * Hook to set up the user context after fetching the data from user-context api.
 * @returns UseQueryResult containing the query results.
 */
export const useUserContext = () => {
  const { setCompanyId, setUserDetails, setCompanyLegalName } = useContext(OnRouteBCContext);
  return useQuery({
    queryKey: ["userContext"],
    queryFn: getUserContext,
    cacheTime: 500,
    refetchOnMount: "always",
    onSuccess: (userContextResponseBody: UserContextType) => {
      const { user, associatedCompanies } = userContextResponseBody;
      if (user?.userGUID) {
        const company = associatedCompanies?.length ? associatedCompanies[0] : undefined;
        const companyId = company?.companyId;
        const legalName = company?.legalName;
        setCompanyId?.(() => companyId);
        setCompanyLegalName?.(() => legalName);
        const userDetails = {
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          phone1: user.phone1,
          phone1Extension: user.phone1Extension,
          phone2: user.phone2,
          phone2Extension: user.phone2Extension,
          email: user.email,
          fax: user.fax,
        } as UserDetailContext;
        setUserDetails?.(() => userDetails);

        // Setting the companyId to sessionStorage so that it can be
        // used outside of react components.
        applyWhenNotNullable(
          (id: number) => sessionStorage.setItem("onRouteBC.user.companyId", id.toString()), 
          companyId
        );
      }
    },
    retry: false,
  });
};

/**
 * Hook to set up the user roles after fetching the data from user-context api.
 * @returns UseQueryResult containing the query results.
 */
export const useUserRolesByCompanyId = () => {
  const { setUserRoles } = useContext(OnRouteBCContext);
  return useQuery({
    queryKey: ["userRoles"],
    refetchInterval: FIVE_MINUTES,
    queryFn: getUserRolesByCompanyId,
    onSuccess: (userRolesResponseBody: string[]) => {
      setUserRoles?.(() => userRolesResponseBody);
    },
    retry: true,
  });
};
