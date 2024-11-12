import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";
import { useContext } from "react";
import OnRouteBCContext from "../../../common/authentication/OnRouteBCContext";
import { IDIRUserRoleType } from "../../../common/authentication/types";
import { Nullable } from "../../../common/types/common";
import { useTableControls } from "../../permits/hooks/useTableControls";
import {
  claimApplicationInQueue,
  getApplicationsInQueue,
  getClaimedApplicationsInQueue,
  getUnclaimedApplicationsInQueue,
  updateApplicationQueueStatus,
} from "../apiManager/queueAPI";
import { canViewApplicationQueue } from "../helpers/canViewApplicationQueue";
import { CaseActivityType } from "../types/CaseActivityType";
import { useNavigate } from "react-router-dom";
import { ERROR_ROUTES } from "../../../routes/constants";

const QUEUE_QUERY_KEYS_BASE = "queue";

const QUEUE_QUERY_KEYS = {
  ALL: (pagination: MRT_PaginationState, sorting: MRT_SortingState) => [
    [QUEUE_QUERY_KEYS_BASE, pagination, sorting],
  ],
  CLAIMED: (pagination: MRT_PaginationState, sorting: MRT_SortingState) => [
    [QUEUE_QUERY_KEYS_BASE, pagination, sorting],
  ],
  UNCLAIMED: (pagination: MRT_PaginationState, sorting: MRT_SortingState) => [
    [QUEUE_QUERY_KEYS_BASE, pagination, sorting],
  ],
  DETAIL: (applicationNumber: string) => [
    QUEUE_QUERY_KEYS_BASE,
    { applicationNumber },
  ],
};

/**
 * Hook that fetches all applications in queue (PENDING_REVIEW, IN_REVIEW) for staff and manages its pagination state.
 * This is the data that is consumed by the ApplicationsInReviewList component.
 * @returns All applications in queue(PENDING_REVIEW, IN_REVIEW) along with pagination state and setter
 */
export const useApplicationsInQueueQuery = () => {
  const { idirUserDetails, companyId } = useContext(OnRouteBCContext);
  const userRole = idirUserDetails?.userRole as IDIRUserRoleType;

  // if typeof company === "undefined" here we know that the staff user is NOT acting as a company
  const getStaffQueue =
    canViewApplicationQueue(userRole) && typeof companyId === "undefined";

  const { pagination, setPagination, sorting, setSorting, orderBy } =
    useTableControls();

  const applicationsInQueueQuery = useQuery({
    queryKey: QUEUE_QUERY_KEYS.ALL(pagination, sorting),
    queryFn: () =>
      getApplicationsInQueue(
        {
          page: pagination.pageIndex,
          take: pagination.pageSize,
          orderBy,
        },
        getStaffQueue,
        companyId,
      ),
    refetchOnWindowFocus: false, // prevent unnecessary multiple queries on page showing up in foreground
    refetchOnMount: "always",
    placeholderData: keepPreviousData,
  });

  return {
    applicationsInQueueQuery,
    pagination,
    setPagination,
    sorting,
    setSorting,
  };
};

/**
 * Hook that fetches all claimed applications in queue (IN_REVIEW) for staff and manages its pagination state.
 * This is the data that is consumed by the ClaimedApplicationsList component
 * @returns All claimed applications in queue (IN_REVIEW) along with pagination state and setter
 */
export const useClaimedApplicationsInQueueQuery = () => {
  const { pagination, setPagination, sorting, setSorting, orderBy } =
    useTableControls({ pageSize: 25 });

  const claimedApplicationsInQueueQuery = useQuery({
    queryKey: QUEUE_QUERY_KEYS.CLAIMED(pagination, sorting),
    queryFn: () =>
      getClaimedApplicationsInQueue({
        page: pagination.pageIndex,
        take: pagination.pageSize,
        orderBy,
      }),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    placeholderData: keepPreviousData,
  });

  return {
    claimedApplicationsInQueueQuery,
    pagination,
    setPagination,
    sorting,
    setSorting,
  };
};

/**
 * Hook that fetches all unclaimed applications in queue (PENDING_REVIEW) for staff and manages its pagination state.
 * This is the data that is consumed by the ApplicationsInQueueList component
 * @returns All unclaimed applications in queue (PENDING_REVIEW) along with pagination state and setter
 */
export const useUnclaimedApplicationsInQueueQuery = () => {
  const { pagination, setPagination, sorting, setSorting, orderBy } =
    useTableControls({ pageSize: 25 });

  const unclaimedApplicationsInQueueQuery = useQuery({
    queryKey: QUEUE_QUERY_KEYS.UNCLAIMED(pagination, sorting),
    queryFn: () =>
      getUnclaimedApplicationsInQueue({
        page: pagination.pageIndex,
        take: pagination.pageSize,
        orderBy,
      }),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    placeholderData: keepPreviousData,
  });

  return {
    unclaimedApplicationsInQueueQuery,
    pagination,
    setPagination,
    sorting,
    setSorting,
  };
};

export const useClaimApplicationInQueueMutation = () => {
  return useMutation({
    mutationFn: (data: {
      companyId: Nullable<number>;
      applicationId: Nullable<string>;
    }) => {
      const { companyId, applicationId } = data;

      return claimApplicationInQueue(companyId, applicationId);
    },
  });
};

export const useUpdateApplicationInQueueStatus = () => {
  const { invalidate } = useInvalidateApplicationsInQueue();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: {
      applicationId: string;
      caseActivityType: CaseActivityType;
      companyId?: number;
      comment?: string;
    }) => {
      return updateApplicationQueueStatus(data);
    },
    onSuccess: () => {
      invalidate();
    },
    onError: (err: AxiosError) => {
      if (err.response?.status === 422) {
        return err;
      } else {
        navigate(ERROR_ROUTES.UNEXPECTED);
      }
    },
  });
};

export const useInvalidateApplicationsInQueue = () => {
  const queryClient = useQueryClient();

  return {
    invalidate: () => {
      queryClient.invalidateQueries({
        queryKey: [QUEUE_QUERY_KEYS_BASE],
      });
    },
  };
};
