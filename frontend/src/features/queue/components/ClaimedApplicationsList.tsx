import { RowSelectionState } from "@tanstack/table-core";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useCallback, useContext, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { SnackBarContext } from "../../../App";
import OnRouteBCContext from "../../../common/authentication/OnRouteBCContext";
import { NoRecordsFound } from "../../../common/components/table/NoRecordsFound";
import {
  defaultTableInitialStateOptions,
  defaultTableOptions,
  defaultTableStateOptions,
} from "../../../common/helpers/tableHelper";
import {
  getDefaultNullableVal,
  getDefaultRequiredVal,
} from "../../../common/helpers/util";
import { Loading } from "../../../common/pages/Loading";
import { APPLICATION_QUEUE_ROUTES } from "../../../routes/constants";
import { ApplicationListItem } from "../../permits/types/application";
import {
  useClaimApplicationInQueueMutation,
  useClaimedApplicationsInQueueQuery,
} from "../hooks/hooks";
import { ClaimedApplicationModal } from "./ClaimedApplicationModal";
import { getUnclaimedApplicationInQueueColumnDefinition } from "./UnclaimedApplicationInQueueColumnDefinition";

export const ClaimedApplicationsList = () => {
  const {
    claimedApplicationsInQueueQuery,
    pagination,
    setPagination,
    sorting,
    setSorting,
  } = useClaimedApplicationsInQueueQuery();

  const {
    data: claimedApplications,
    isError: claimedApplicationsError,
    isPending: claimedApplicationsPending,
    isFetching: claimedApplicationsFetching,
  } = claimedApplicationsInQueueQuery;

  const [showTable, setShowTable] = useState<boolean>(false);

  useEffect(() => {
    const totalCount = getDefaultRequiredVal(
      0,
      claimedApplications?.meta?.totalItems,
    );
    setShowTable(totalCount > 0);
  }, [claimedApplications?.meta?.totalItems]);

  const { idirUserDetails, userDetails } = useContext(OnRouteBCContext);
  const userRole = getDefaultNullableVal(
    idirUserDetails?.userRole,
    userDetails?.userRole,
  );

  const snackBar = useContext(SnackBarContext);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useEffect(() => {
    if (claimedApplicationsError) {
      snackBar.setSnackBar({
        message: "An unexpected error occurred.",
        showSnackbar: true,
        setShowSnackbar: () => true,
        alertType: "error",
      });
    }
  }, [claimedApplicationsError]);

  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationListItem>();

  const [showClaimedApplicationModal, setShowClaimedApplicationModal] =
    useState<boolean>(false);

  const handleFollowApplicationLink = (application: ApplicationListItem) => {
    setSelectedApplication(application);

    if (idirUserDetails?.userName === application.claimedBy) {
      handleClaimApplication(application);
    } else {
      setShowClaimedApplicationModal(true);
    }
  };

  const {
    mutateAsync: claimApplication,
    data: claimApplicationResponse,
    isPending: claimApplicationPending,
  } = useClaimApplicationInQueueMutation();

  const handleClaimApplication = async (application: ApplicationListItem) => {
    await claimApplication({
      companyId: application.companyId,
      applicationId: application.permitId,
    });
  };

  const navigate = useNavigate();

  const isSuccess = (status?: number) => status === 201;

  useEffect(() => {
    if (isSuccess(claimApplicationResponse?.status)) {
      navigate(
        APPLICATION_QUEUE_ROUTES.REVIEW(
          selectedApplication?.companyId,
          selectedApplication?.permitId,
        ),
      );
    }
  }, [claimApplicationResponse]);

  const columns = getUnclaimedApplicationInQueueColumnDefinition(
    handleFollowApplicationLink,
  );

  const table = useMaterialReactTable({
    ...defaultTableOptions,
    columns,
    data: getDefaultRequiredVal([], claimedApplications?.items),
    initialState: {
      ...defaultTableInitialStateOptions,
    },
    state: {
      ...defaultTableStateOptions,
      showAlertBanner: claimedApplicationsError,
      showProgressBars: claimedApplicationsFetching,
      columnVisibility: { applicationId: true },
      isLoading: claimedApplicationsPending,
      rowSelection,
      pagination,
      sorting,
    },
    layoutMode: "grid",
    displayColumnDefOptions: {
      "mrt-row-select": {
        size: 10,
      },
      "mrt-row-actions": {
        header: "",
        size: 40,
      },
    },
    enableRowActions: true,
    enableRowSelection: false,
    onRowSelectionChange: useCallback(setRowSelection, [userRole]),
    getRowId: (originalRow) => {
      const applicationRow = originalRow as ApplicationListItem;
      return applicationRow.permitId;
    },
    renderTopToolbar: false,
    enableGlobalFilter: false,
    autoResetPageIndex: false,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: getDefaultRequiredVal(0, claimedApplications?.meta?.totalItems),
    pageCount: getDefaultRequiredVal(0, claimedApplications?.meta?.pageCount),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    enablePagination: true,
    enableBottomToolbar: true,
    muiToolbarAlertBannerProps: claimedApplicationsError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    muiTableBodyRowProps: {
      className: "claimed-applications-list__row",
    },
  });

  if (claimApplicationPending) return <Loading />;

  return (
    <>
      {showTable ? (
        <div>
          <div className="claimed-applications-list table-container">
            <MaterialReactTable table={table} />
          </div>
          <ClaimedApplicationModal
            showModal={showClaimedApplicationModal}
            onCancel={() => setShowClaimedApplicationModal(false)}
            onConfirm={() =>
              handleClaimApplication(selectedApplication as ApplicationListItem)
            }
            assignedUser={getDefaultRequiredVal(
              "",
              selectedApplication?.claimedBy,
            )}
          />
        </div>
      ) : (
        <NoRecordsFound />
      )}
    </>
  );
};
