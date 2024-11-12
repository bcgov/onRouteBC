import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { AxiosResponse } from "axios";

import { IDPS } from "../../../common/types/idp";
import { Nullable } from "../../../common/types/common";
import { ERROR_ROUTES } from "../../../routes/constants";
import { DeleteResponse } from "../types/manageProfile";
import {
  FIVE_MINUTES,
  FOUR_MINUTES,
} from "../../../common/constants/constants";

import {
  deleteCompanyPendingUsers,
  deleteCompanyActiveUsers,
  getCompanyInfo,
  getCompanyInfoById,
  getIDIRUserClaims,
  getUserContext,
  getUserClaimsByCompanyId,
} from "./manageProfileAPI";

import OnRouteBCContext, {
  BCeIDUserDetailContext,
  IDIRUserDetailContext,
} from "../../../common/authentication/OnRouteBCContext";

import {
  BCeIDUserRoleType,
  BCeIDUserContextType,
  IDIRUserContextType,
  UserClaimsType,
} from "../../../common/authentication/types";

/**
 * Fetches company info of current user.
 * @returns Query object containing company info of current user
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
 * Fetches company info of specific company.
 * @param companyId Id of the company to get the info for
 * @returns Query object containing company info
 */
export const useCompanyInfoDetailsQuery = (
  companyId: number,
) => {
  return useQuery({
    queryKey: ["companyInfo"],
    queryFn: () => getCompanyInfoById(companyId),
    enabled: Boolean(companyId),
    refetchInterval: FIVE_MINUTES,
    refetchOnWindowFocus: false, // fixes issue where a query is run everytime the screen is brought to foreground
    retry: false,
  });
};

/**
 * Hook to query the data from the user-context api.
 * @param enabled boolean indicating if the query is enabled. Defaults to true.
 * @returns UseQueryResult containing the query results.
 */
export const useUserContextQuery = (enabled = true) => {
  return useQuery({
    queryKey: ["userContext"],
    queryFn: getUserContext,
    gcTime: 500,
    refetchOnMount: "always",
    staleTime: FOUR_MINUTES,
    enabled,
    retry: 1, // Retry once on failure
  });
};

/**
 * Hook to set up the user context after fetching the data from user-context api.
 * @param userContextResponseBody Response data fetched from the user-context api, either bceid or idir user context data.
 * @returns UseQueryResult containing the query results.
 */
export const useUserContext = (
  userContextResponseBody: Nullable<BCeIDUserContextType | IDIRUserContextType>,
) => {
  const {
    setCompanyId,
    setUserDetails,
    setCompanyLegalName,
    setIsCompanySuspended,
    setIDIRUserDetails,
    setOnRouteBCClientNumber,
    setMigratedClient,
    setIsNewBCeIDUser,
  } = useContext(OnRouteBCContext);

  const { isAuthenticated, user: userFromToken } = useAuth();

  useEffect(() => {
    if (!userContextResponseBody) return;

    const isIdir =
      isAuthenticated &&
      userFromToken?.profile?.identity_provider === IDPS.IDIR;

    if (isIdir) {
      const { user } = userContextResponseBody as IDIRUserContextType;

      if (user?.userGUID) {
        const userDetails = {
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          userRole: user.userRole,
        } as IDIRUserDetailContext;

        setIDIRUserDetails?.(() => userDetails);
      }
    } else {
      const { user, associatedCompanies, pendingCompanies, migratedClient } =
        userContextResponseBody as BCeIDUserContextType;

      /**
       * User exists => the user is already in the system.
       */
      if (user?.userGUID) {
        const companyId = associatedCompanies[0].companyId;
        const legalName = associatedCompanies[0].legalName;
        const clientNumber = associatedCompanies[0].clientNumber;
        const isCompanySuspended = associatedCompanies[0].isSuspended;

        setCompanyId?.(() => companyId);
        setCompanyLegalName?.(() => legalName);
        setOnRouteBCClientNumber?.(() => clientNumber);
        setIsCompanySuspended?.(() => isCompanySuspended);

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
          userRole: user.userRole as BCeIDUserRoleType,
        } as BCeIDUserDetailContext;

        setUserDetails?.(() => userDetails);

        // Setting the companyId to sessionStorage so that it can be
        // used outside of react components.
        sessionStorage.setItem(
          "onRouteBC.user.companyId",
          companyId.toString(),
        );
      }

      /**
       * The user has been added to a company.
       */
      if (pendingCompanies.length > 0) {
        const { companyId, legalName, isSuspended } = pendingCompanies[0];

        setCompanyId?.(() => companyId);
        setCompanyLegalName?.(() => legalName);
        setIsCompanySuspended?.(() => isSuspended);

        sessionStorage.setItem(
          "onRouteBC.user.companyId",
          companyId.toString(),
        );
        setIsNewBCeIDUser?.(() => true);
      }

      /**
       * The user has been migrated.
       */
      if (migratedClient?.clientNumber) {
        setMigratedClient?.(() => migratedClient);
      }

      /**
       * If there is no company in the system (to prevent unauthorized logins)
       * we can affirmatively say that the logged in user is a new user.
       */
      if (associatedCompanies.length === 0) {
        setIsNewBCeIDUser?.(() => true);
      }
    }
  }, [userContextResponseBody, isAuthenticated, userFromToken]);
};

/**
 * Hook to fetching the user claims data from the api.
 * @returns UseQueryResult containing the query results.
 */
export const useUserClaimsByCompanyIdQuery = () => {
  return useQuery({
    queryKey: ["userClaims"],
    refetchInterval: FIVE_MINUTES,
    queryFn: getUserClaimsByCompanyId,
    retry: 1, // Retry once on failure
  });
};

/**
 * Hook to set up the user claims after fetching the data from the api.
 * @param userClaimsResponseBody Response data for the user claims fetched.
 * @returns UseQueryResult containing the query results.
 */
export const useUserClaimsByCompanyId = (
  userClaimsResponseBody: Nullable<UserClaimsType[]>,
) => {
  const { setUserClaims } = useContext(OnRouteBCContext);

  useEffect(() => {
    if (userClaimsResponseBody) {
      setUserClaims?.(() => userClaimsResponseBody);
    }
  }, [userClaimsResponseBody]);
};

/**
 * Hook to fetching the IDIR user claims data from the api.
 * @returns UseQueryResult containing the query results.
 */
export const useIDIRUserClaimsQuery = () => {
  return useQuery({
    queryKey: ["userIDIRClaims"],
    refetchInterval: FIVE_MINUTES,
    queryFn: getIDIRUserClaims,
    retry: 1, // Retry once on failure
  });
};

/**
 * Hook to set up the IDIR user claims after fetching the data from the api.
 * @param userClaims User claims data response from the api.
 * @returns UseQueryResult containing the query results.
 */
export const useIDIRUserClaims = (userClaims: Nullable<UserClaimsType[]>) => {
  const { setUserClaims } = useContext(OnRouteBCContext);

  useEffect(() => {
    if (userClaims) {
      setUserClaims?.(() => userClaims);
    }
  }, [userClaims]);
};

/**
 * Custom hook for deleting company users.
 * @returns Mutation object with methods to interact with the delete operation.
 */
export const useDeleteCompanyActiveUsers = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: deleteCompanyActiveUsers,
    onError: () => navigate(ERROR_ROUTES.UNEXPECTED),
    onSuccess: (response: AxiosResponse) => {
      const { data: companyUserResponse } = response;
      const { failure } = companyUserResponse as DeleteResponse;
      if (failure?.length > 0) {
        navigate(ERROR_ROUTES.UNEXPECTED);
      }
    },
  });
};

/**
 * Custom hook for deleting company pending users.
 * @returns Mutation object with methods to interact with the delete operation.
 */
export const useDeleteCompanyPendingUsers = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: deleteCompanyPendingUsers,
    onError: () => navigate(ERROR_ROUTES.UNEXPECTED),
    onSuccess: (response: AxiosResponse) => {
      const { data: companyUserResponse } = response;
      const { failure } = companyUserResponse as DeleteResponse;
      if (failure?.length > 0) {
        navigate(ERROR_ROUTES.UNEXPECTED);
      }
    },
  });
};
