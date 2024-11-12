import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { MRT_PaginationState } from "material-react-table";
import {
  useQueryClient,
  useMutation,
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query";

import { Application, ApplicationFormData } from "../types/application";
import { IssuePermitsResponse } from "../types/permit";
import { StartTransactionResponseData } from "../types/payment";
import { APPLICATION_STEPS, ApplicationStep } from "../../../routes/constants";
import { isPermitTypeValid } from "../types/PermitType";
import { isPermitIdNumeric } from "../helpers/permitState";
import { deserializeApplicationResponse } from "../helpers/deserializeApplication";
import { deserializePermitResponse } from "../helpers/deserializePermit";
import { AmendPermitFormData } from "../pages/Amend/types/AmendPermitFormData";
import { Nullable, Optional } from "../../../common/types/common";
import { useTableControls } from "./useTableControls";
import {
  getApplication,
  getPermit,
  getPermitHistory,
  completeTransaction,
  createApplication,
  updateApplication,
  startTransaction,
  issuePermits,
  amendPermit,
  getCurrentAmendmentApplication,
  modifyAmendmentApplication,
  getApplicationsInProgress,
  resendPermit,
  getPendingPermits,
} from "../apiManager/permitsAPI";
import { getDefaultRequiredVal } from "../../../common/helpers/util";

const QUERY_KEYS = {
  PERMIT_DETAIL: (
    permitId?: Nullable<string>,
    companyId?: Nullable<string | number>,
  ) => ["permit", permitId, companyId],
  AMEND_APPLICATION: (
    originalPermitId?: Nullable<string>,
    companyId?: Nullable<string | number>,
  ) => ["amendmentApplication", originalPermitId, companyId],
  PERMIT_HISTORY: (
    originalPermitId?: Nullable<string>,
    companyId?: Nullable<string | number>,
  ) => ["permitHistory", originalPermitId, companyId],
};

/**
 * A custom react query mutation hook that saves the application data to the backend API
 * The hook checks for an existing application number to decide whether to send an update or create request
 */
export const useSaveApplicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      companyId,
    }: {
      data: ApplicationFormData;
      companyId: number;
    }) => {
      const res = data.permitId
        ? await updateApplication(data, data.permitId, companyId)
        : await createApplication(data, companyId);

      if (res.status === 200 || res.status === 201) {
        queryClient.invalidateQueries({
          queryKey: ["application"],
        });

        return {
          application: deserializeApplicationResponse(res.data),
          status: res.status,
        };
      } else {
        return {
          application: null,
          status: res.status,
        };
      }
    },
  });
};

/**
 * Hook that gets application details for the application steps.
 * @param applicationStep The step of the application process (ie. form or review)
 * @param permitId Id of the application to get details for
 * @param permitType Permit type of the application
 * @param companyId Company id that the application belongs to
 * @returns Application data and supplementary info with route validation for application steps
 */
export const useApplicationForStepsQuery = ({
  applicationStep,
  permitId,
  permitType,
  companyId,
}: {
  applicationStep: ApplicationStep;
  permitId?: Nullable<string>;
  permitType?: Nullable<string>;
  companyId: number;
}) => {
  const [applicationData, setApplicationData] =
    useState<Nullable<Application>>();

  // Check if the permit type param is valid, if there is one
  const permitTypeValid = isPermitTypeValid(permitType);

  const isCreateNewApplication =
    permitTypeValid && applicationStep === APPLICATION_STEPS.DETAILS;

  // Currently, creating new application route doesn't contain valid permitId
  // ie. route === "/applications/new/tros" instead of "/applications/:permitId"
  // Thus we need to do a check for valid/invalid routes
  // eg. "/applications/1" and "/applications/1/review" are VALID - they refer to existing application with id 1
  // eg. "/applications/new" is NOT VALID - doesn't provide permitType param
  // eg. "/applications/new/tros" is VALID - provides valid permitType param value
  // eg. "/applications/new/abcde" is NOT VALID - provided permitType is not valid
  // eg. "/applications/new/review" is NOT VALID - "new" is not a valid (numeric) permit id
  // We also need applicationStep to determine which page (route) we're on, and check the permit type route param
  const isInvalidRoute =
    !isPermitIdNumeric(permitId) && !isCreateNewApplication;

  const { query, shouldEnableQuery } = useApplicationDetailsQuery({
    permitId: getDefaultRequiredVal("", permitId),
    companyId,
  });

  useEffect(() => {
    if (!shouldEnableQuery) {
      if (isInvalidRoute) {
        setApplicationData(null);
      } else {
        setApplicationData(undefined);
      }
    } else if (!query.data) {
      // query is enabled, set application data to whatever's being fetched
      setApplicationData(query.data);
    } else {
      const application = deserializeApplicationResponse(query.data);
      setApplicationData(application);
    }
  }, [query.data, shouldEnableQuery, isInvalidRoute]);

  return {
    applicationData,
    setApplicationData,
    isInvalidRoute,
    shouldEnableQuery,
  };
};

/**
 * Query hook that gets application details from the backend API
 * @param permitId Id for the application, if it exists
 * @param companyId Company id that the application belongs to
 * @returns Query object containing application details, and flag indicating whether query is enabled
 */
export const useApplicationDetailsQuery = ({
  permitId,
  companyId,
}: {
  permitId: string;
  companyId: number;
}) => {
  const shouldEnableQuery = isPermitIdNumeric(permitId) && Boolean(companyId);

  // This won't fetch anything (ie. query.data will be undefined) if shouldEnableQuery is false
  const query = useQuery({
    queryKey: ["application"],
    queryFn: () => getApplication(companyId, permitId),
    retry: false,
    refetchOnMount: "always", // always fetch when component is mounted
    refetchOnWindowFocus: false, // prevent unnecessary multiple queries on page showing up in foreground
    enabled: shouldEnableQuery, // does not perform the query at all if shouldEnableQuery is false
    gcTime: 0, // DO NOT cache the application data as application form/review pages always need latest data
  });

  return {
    query,
    shouldEnableQuery,
  };
};

/**
 * A custom react query hook that get permit details from the backend API.
 * @param companyId id of the company that the permit belongs to
 * @param permitId permit id for the permit
 * @returns Query object containing the permit details
 */
export const usePermitDetailsQuery = (
  companyId: number,
  permitId: string,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.PERMIT_DETAIL(permitId, companyId),
    queryFn: async () => {
      const res = await getPermit(companyId, permitId);
      return res ? deserializePermitResponse(res) : res;
    },
    enabled: isPermitIdNumeric(permitId) && Boolean(companyId),
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false, // prevent unnecessary multiple queries on page showing up in foreground
  });
};

/**
 * Custom hook that starts a transaction.
 * @returns The mutation object, as well as the transaction that was started (if there is one, or undefined if there's an error).
 */
export const useStartTransaction = () => {
  const [transaction, setTransaction] =
    useState<Nullable<StartTransactionResponseData>>(undefined);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: startTransaction,
    retry: false,
    onSuccess: (transactionData) => {
      queryClient.invalidateQueries({
        queryKey: ["transaction"],
      });
      queryClient.setQueryData(["transaction"], transactionData);
      setTransaction(transactionData);
    },
    onError: (err: unknown) => {
      console.error(err);
      setTransaction(undefined);
    },
  });

  return {
    mutation,
    transaction,
  };
};

/**
 * A custom hook that completes the transaction.
 * @param messageText Message text that indicates the result of the transaction
 * @param paymentStatus Payment status signifying the result of the transaction (1 - success, 0 - failed)
 * @returns The mutation object, whether or not payment was approved, and the message to display
 */
export const useCompleteTransaction = (
  messageText: string,
  paymentStatus: number,
) => {
  const queryClient = useQueryClient();
  const [paymentApproved, setPaymentApproved] =
    useState<Optional<boolean>>(undefined);
  const [message, setMessage] = useState<string>(messageText);

  const onTransactionResult = (message: string, paymentApproved: boolean) => {
    setMessage(message);
    setPaymentApproved(paymentApproved);
  };

  const onTransactionError = (err: unknown) => {
    if (!(err instanceof AxiosError)) {
      onTransactionResult("Unknown Error", false);
      return;
    }
    if (err.response) {
      onTransactionResult(
        `Payment approved but error in ORBC Backend: ${err.response.data.message}`,
        false,
      );
    } else {
      onTransactionResult("Request Error", false);
    }
  };

  const mutation = useMutation({
    mutationFn: completeTransaction,
    retry: false,
    onSuccess: (response) => {
      if (response != null) {
        queryClient.invalidateQueries({
          queryKey: ["transactions"],
        });
        onTransactionResult(messageText, paymentStatus === 1);
      } else {
        onTransactionResult("Something went wrong", false);
      }
    },
    onError: (err) => {
      onTransactionError(err);
    },
  });

  return {
    mutation,
    paymentApproved,
    message,
    setPaymentApproved,
    setMessage,
  };
};

/**
 * A custom react query hook that get permit history from the backend API.
 * @param companyId id of the company that the original permit belongs to
 * @param originalPermitId original permit id for the permit
 * @returns Query object containing permit history information
 */
export const usePermitHistoryQuery = (
  companyId: number,
  originalPermitId: string,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.PERMIT_HISTORY(originalPermitId, companyId),
    queryFn: () => getPermitHistory(companyId, originalPermitId),
    enabled: Boolean(companyId) && isPermitIdNumeric(originalPermitId),
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false, // prevent unnecessary multiple queries on page showing up in foreground
  });
};

/**
 * Custom hook that issues the permits indicated by the application/permit ids.
 * @returns Mutation object, and the issued results response.
 */
export const useIssuePermits = () => {
  const [issueResults, setIssueResults] =
    useState<Nullable<IssuePermitsResponse>>(undefined);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: {
      companyId: number;
      applicationIds: string[];
    }) =>
      issuePermits(data.companyId, data.applicationIds),
    retry: false,
    onSuccess: (issueResponseData) => {
      queryClient.invalidateQueries({
        queryKey: ["application"],
      });
      setIssueResults(issueResponseData);
    },
    onError: (err: unknown) => {
      console.error(err);
      setIssueResults(null);
    },
  });

  return {
    mutation,
    issueResults,
  };
};

/**
 * A custom mutation hook that requests the backend API to amend the permit.
 * @param companyId id of the company that the amended permit belongs to
 * @returns Mutation object that contains the result of the amendment action
 */
export const useAmendPermit = (companyId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AmendPermitFormData) => {
      const amendResult = await amendPermit(data, companyId);
      if (amendResult.status === 200 || amendResult.status === 201) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PERMIT_DETAIL(data.permitId, companyId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.AMEND_APPLICATION(
            data.originalPermitId,
            companyId,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PERMIT_HISTORY(
            data.originalPermitId,
            companyId,
          ),
        });

        return {
          application: deserializeApplicationResponse(amendResult.data),
          status: amendResult.status,
        };
      }
      return {
        application: null,
        status: amendResult.status,
      };
    },
  });
};

export const useModifyAmendmentApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      application: AmendPermitFormData;
      applicationId: string;
      companyId: number;
    }) => {
      const amendResult = await modifyAmendmentApplication(data);

      if (amendResult.status === 200 || amendResult.status === 201) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.AMEND_APPLICATION(
            data.application.originalPermitId,
            data.companyId,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PERMIT_HISTORY(
            data.application.originalPermitId,
            data.companyId,
          ),
        });

        return {
          application: deserializeApplicationResponse(amendResult.data),
          status: amendResult.status,
        };
      }
      return {
        application: null,
        status: amendResult.status,
      };
    },
  });
};

/**
 * A custom react query hook that gets the current amendment application, if there is one.
 * @param companyId id of the company that the original permit belongs to
 * @param originalPermitId Original permit id of the permit that is being amended
 * @returns Query object containing information regarding the current amendment application if it exists
 */
export const useAmendmentApplicationQuery = (
  companyId: number,
  originalPermitId: string,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.AMEND_APPLICATION(originalPermitId, companyId),
    queryFn: async () => {
      const res = await getCurrentAmendmentApplication(
        companyId,
        originalPermitId,
      );
      return res ? deserializeApplicationResponse(res) : res;
    },
    enabled: Boolean(companyId) && isPermitIdNumeric(originalPermitId),
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false, // prevent unnecessary multiple queries on page showing up in foreground
  });
};

/**
 * A custom react query hook that fetches applications in progress and manages its pagination state.
 * @param companyId id of the company to fetch applications for
 * @returns Query object containing fetched applications in progress, along with pagination state and setters
 */
export const useApplicationsInProgressQuery = (companyId: number) => {
  const { pagination, setPagination, sorting, setSorting, orderBy } =
    useTableControls();

  const applicationsInProgressQuery = useQuery({
    queryKey: [
      "applicationsInProgress",
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
    ],
    queryFn: () =>
      getApplicationsInProgress(
        companyId,
        {
          page: pagination.pageIndex,
          take: pagination.pageSize,
          orderBy,
        },
      ),
    refetchOnWindowFocus: false, // prevent unnecessary multiple queries on page showing up in foreground
    refetchOnMount: "always",
    placeholderData: keepPreviousData,
    enabled: Boolean(companyId),
  });

  return {
    applicationsInProgressQuery,
    pagination,
    setPagination,
    sorting,
    setSorting,
  };
};

/**
 * Hook that fetches pending permits and manages its pagination state.
 * @param companyId id of the company to fetch applications for
 * @returns Pending permits along with pagination state and setter
 */
export const usePendingPermitsQuery = (companyId: number) => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: pendingPermits } = useQuery({
    queryKey: ["pendingPermits", pagination.pageIndex, pagination.pageSize],
    queryFn: () =>
      getPendingPermits(
        companyId,
        {
          page: pagination.pageIndex,
          take: pagination.pageSize,
        },
      ),
    refetchOnWindowFocus: false, // prevent unnecessary multiple queries on page showing up in foreground
    refetchOnMount: "always",
    placeholderData: keepPreviousData,
    enabled: Boolean(companyId),
  });

  return {
    pendingPermits,
    pagination,
    setPagination,
  };
};

/**
 * Hook used for resending a permit.
 * @returns Mutation object to be used for resending a permit
 */
export const useResendPermit = () => {
  return useMutation({
    mutationFn: resendPermit,
  });
};
