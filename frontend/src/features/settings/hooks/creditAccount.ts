/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCreditAccountUser,
  createCreditAccount,
  getCreditAccount,
  removeCreditAccountUsers,
  getCreditAccountUsers,
  updateCreditAccountStatus,
} from "../apiManager/creditAccount";
import { getCompanyDataBySearch } from "../../idir/search/api/idirSearch";
import { useNavigate } from "react-router-dom";
import { ERROR_ROUTES } from "../../../routes/constants";
import { SnackBarContext } from "../../../App";
import { useContext } from "react";
import {
  CreditAccountData,
  CreditAccountStatusType,
  CreditAccountUser,
  UPDATE_STATUS_ACTIONS,
  UpdateStatusActionType,
  UpdateStatusData,
} from "../types/creditAccount";
import { getCompanyIdFromSession } from "../../../common/apiManager/httpRequestHandler";
import { SnackbarAlertType } from "../../../common/components/snackbar/CustomSnackBar";

/**
 * Hook to fetch the company credit account details.
 * @returns Query result of the company credit account details
 */
export const useGetCreditAccountQuery = () => {
  return useQuery({
    queryKey: ["credit-account", { companyId: getCompanyIdFromSession() }],
    queryFn: getCreditAccount,
    // retry: false,
  });
};

/**
 * Hook to fetch the company credit account details.
 * @returns Query result of the company credit account details
 */
export const useGetCreditAccountUsersQuery = (creditAccountId: number) => {
  return useQuery({
    queryKey: [
      "credit-account",
      { companyId: getCompanyIdFromSession() },
      "users",
    ],
    queryFn: () => getCreditAccountUsers(creditAccountId),
  });
};

/**
 * Hook to fetch the user information.
 * @param clientNumber Id of the user to get information for
 * @returns Query result of the user information
 */
export const useGetCompanyQuery = (clientNumber: string) => {
  return useQuery({
    queryKey: ["company-information", { clientNumber }],
    queryFn: () =>
      getCompanyDataBySearch(
        {
          searchEntity: "companies",
          searchByFilter: "onRouteBCClientNumber",
          searchString: clientNumber,
        },
        {
          page: 0,
          take: 1,
        },
      ),
    enabled: clientNumber !== "",
  });
};

/**
 * Hook to create a credit account.
 * @returns Result of the create credit account action
 */
export const useCreateCreditAccountMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setSnackBar } = useContext(SnackBarContext);

  return useMutation({
    mutationFn: createCreditAccount,
    onSuccess: (response) => {
      queryClient.setQueryData(
        ["credit-account", { companyId: getCompanyIdFromSession() }],
        response.data,
      );
      setSnackBar({
        showSnackbar: true,
        setShowSnackbar: () => true,
        message: "Credit Account Added",
        alertType: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["credit-account", { companyId: getCompanyIdFromSession() }],
      });
    },
    onError: () => navigate(ERROR_ROUTES.UNEXPECTED),
  });
};

/**
 * Hook to add a user to a credit account
 * @returns Result of the add user to credit account action
 */
export const useAddCreditAccountUserMutation = () => {
  // const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setSnackBar } = useContext(SnackBarContext);

  return useMutation({
    mutationFn: (data: {
      creditAccountId: number;
      userData: CreditAccountUser;
    }) => addCreditAccountUser(data),
    // TODO investigate this optimistic update (currently causes AddUserModal to display isExistingUser state)
    // onMutate: async (variables) => {
    //   const { creditAccountId, userData } = variables;

    //   await queryClient.cancelQueries({
    //     queryKey: ["credit-account", { creditAccountId }, "users"],
    //   });

    //   const snapshot = queryClient.getQueryData([
    //     "credit-account",
    //     { creditAccountId },
    //     "users",
    //   ]);

    //   queryClient.setQueryData(
    //     ["credit-account", { creditAccountId }, "users"],
    //     (prevCreditAccountUsers: CreditAccountUser[]) =>
    //       prevCreditAccountUsers ? [...prevCreditAccountUsers, userData] : [],
    //   );

    //   return () => {
    //     queryClient.setQueryData(
    //       ["credit-account", { creditAccountId }, "users"],
    //       snapshot,
    //     );
    //   };
    // },
    onSuccess: () => {
      setSnackBar({
        showSnackbar: true,
        setShowSnackbar: () => true,
        alertType: "success",
        message: "Account User Added",
      });
    },
    onError: () => {
      navigate(ERROR_ROUTES.UNEXPECTED);
    },
  });
};

/**
 * Hook to remove a user from a credit account
 * @returns Result of the remove user from credit account action
 */
export const useRemoveCreditAccountUsersMutation = (data: {
  creditAccountId: number;
  companyIds: number[];
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setSnackBar } = useContext(SnackBarContext);
  const { companyIds } = data;

  return useMutation({
    mutationFn: () => removeCreditAccountUsers(data),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: [
          "credit-account",
          { companyId: getCompanyIdFromSession() },
          "users",
        ],
      });

      const snapshot = queryClient.getQueryData([
        "credit-account",
        { companyId: getCompanyIdFromSession() },
        "users",
      ]);

      queryClient.setQueryData(
        ["credit-account", { companyId: getCompanyIdFromSession() }, "users"],
        (prevCreditAccountUsers: CreditAccountUser[]) =>
          prevCreditAccountUsers
            ? prevCreditAccountUsers.filter(
                (user) => !companyIds.includes(user.companyId),
              )
            : [],
      );

      return () => {
        queryClient.setQueryData(
          ["credit-account", { companyId: getCompanyIdFromSession() }, "users"],
          snapshot,
        );
      };
    },
    onSuccess: () => {
      setSnackBar({
        showSnackbar: true,
        setShowSnackbar: () => true,
        message: "Account User(s) Removed",
        alertType: "info",
      });
    },
    onError: (_error, _variables, rollback) => {
      rollback?.();
      navigate(ERROR_ROUTES.UNEXPECTED);
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: [
          "credit-account",
          { companyId: getCompanyIdFromSession() },
          "users",
        ],
      });
    },
  });
};

/**
 * Hook to hold/unhold a credit account.
 * @returns Result of the hold credit account action
 */
export const useUpdateCreditAccountStatusMutation = () => {
  const navigate = useNavigate();
  const { setSnackBar } = useContext(SnackBarContext);

  return useMutation({
    mutationFn: (data: {
      creditAccountId: number;
      updateStatusData: UpdateStatusData;
    }) => {
      const {
        creditAccountId,
        updateStatusData: { updateStatusAction, reason },
      } = data;

      let status: CreditAccountStatusType;

      switch (updateStatusAction) {
        case UPDATE_STATUS_ACTIONS.HOLD_CREDIT_ACCOUNT:
          status = "ONHOLD";
          break;
        case UPDATE_STATUS_ACTIONS.CLOSE_CREDIT_ACCOUNT:
          status = "CLOSED";
          break;
        case UPDATE_STATUS_ACTIONS.UNHOLD_CREDIT_ACCOUNT:
          status = "ACTIVE";
          break;
        case UPDATE_STATUS_ACTIONS.REOPEN_CREDIT_ACCOUNT:
          status = "ACTIVE";
          break;
        default:
          status = "ACTIVE";
          break;
      }
      return updateCreditAccountStatus({ creditAccountId, status, reason });
    },
    onSuccess: (
      _data,
      variables: {
        creditAccountId: number;
        updateStatusData: UpdateStatusData;
      },
    ) => {
      const updateStatusAction = variables.updateStatusData.updateStatusAction;

      let alertType: SnackbarAlertType;
      let message: string;

      switch (updateStatusAction) {
        case UPDATE_STATUS_ACTIONS.HOLD_CREDIT_ACCOUNT:
          alertType = "info";
          message = "Credit Account On Hold";
          break;
        case UPDATE_STATUS_ACTIONS.CLOSE_CREDIT_ACCOUNT:
          alertType = "info";
          message = "Credit Account Closed";
          break;
        case UPDATE_STATUS_ACTIONS.UNHOLD_CREDIT_ACCOUNT:
          alertType = "success";
          message = "Hold Removed";
          break;
        case UPDATE_STATUS_ACTIONS.REOPEN_CREDIT_ACCOUNT:
          alertType = "success";
          message = "Credit Account Reopened";
          break;
        default:
          alertType = "success";
          message = "Credit Account Active";
      }

      setSnackBar({
        showSnackbar: true,
        setShowSnackbar: () => true,
        alertType: alertType,
        message: message,
      });
    },
    onError: () => {
      navigate(ERROR_ROUTES.UNEXPECTED);
    },
  });
};
