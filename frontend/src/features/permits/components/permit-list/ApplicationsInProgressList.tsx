import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { RowSelectionState } from "@tanstack/table-core";
import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import "./ApplicationsInProgressList.scss";
import { ApplicationInProgressColumnDefinition } from "./ApplicationInProgressColumnDefinition";
import { DeleteConfirmationDialog } from "../../../../common/components/dialog/DeleteConfirmationDialog";
import { SnackBarContext } from "../../../../App";
import { ApplicationListItem } from "../../types/application";
import { DeleteButton } from "../../../../common/components/buttons/DeleteButton";
import { NoRecordsFound } from "../../../../common/components/table/NoRecordsFound";
import { canUserAccessApplication } from "../../helpers/mappers";
import OnRouteBCContext from "../../../../common/authentication/OnRouteBCContext";
import {
  getDefaultNullableVal,
  getDefaultRequiredVal,
} from "../../../../common/helpers/util";
import { UserRoleType } from "../../../../common/authentication/types";
import { Nullable } from "../../../../common/types/common";
import { deleteApplications } from "../../apiManager/permitsAPI";
import { PermitApplicationOrigin } from "../../types/PermitApplicationOrigin";
import {
  useApplicationsInProgressQuery,
  usePendingPermitsQuery,
} from "../../hooks/hooks";
import { WarningBcGovBanner } from "../../../../common/components/banners/WarningBcGovBanner";
import { PendingPermitsDialog } from "../dialog/PendingPermitsDialog/PendingPermitsDialog";
import { CustomActionLink } from "../../../../common/components/links/CustomActionLink";
import {
  defaultTableInitialStateOptions,
  defaultTableOptions,
  defaultTableStateOptions,
} from "../../../../common/helpers/tableHelper";

const getColumns = (
  userRole?: Nullable<UserRoleType>,
): MRT_ColumnDef<ApplicationListItem>[] => {
  return ApplicationInProgressColumnDefinition(userRole);
};

export const ApplicationsInProgressList = ({
  companyId,
}: {
  companyId: number;
}) => {
  const {
    applicationsInProgressQuery,
    pagination,
    setPagination,
    sorting,
    setSorting,
  } = useApplicationsInProgressQuery(companyId);

  const {
    pendingPermits,
    pagination: pendingPermitPagination,
    setPagination: setPendingPermitPagination,
  } = usePendingPermitsQuery(companyId);

  const {
    data: applicationsInProgress,
    isError,
    isPending,
    isFetching,
  } = applicationsInProgressQuery;

  const pendingCount = getDefaultRequiredVal(
    0,
    pendingPermits?.meta?.totalItems,
  );
  const canShowPendingBanner = pendingCount > 0;

  const [showAIPTable, setShowAIPTable] = useState<boolean>(false);

  useEffect(() => {
    const totalCount = getDefaultRequiredVal(
      0,
      applicationsInProgress?.meta?.totalItems,
    );
    setShowAIPTable(totalCount > 0);
  }, [applicationsInProgress?.meta?.totalItems]);

  const { idirUserDetails, userDetails } = useContext(OnRouteBCContext);
  const userRole = getDefaultNullableVal(
    idirUserDetails?.userRole,
    userDetails?.userRole,
  );

  const snackBar = useContext(SnackBarContext);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const hasNoRowsSelected = Object.keys(rowSelection).length === 0;
  const [showPendingPermitsModal, setShowPendingPermitsModal] =
    useState<boolean>(false);

  const columns = useMemo<MRT_ColumnDef<ApplicationListItem>[]>(
    () => getColumns(userRole),
    [userRole],
  );

  const onClickDelete = useCallback(() => {
    setIsDeleteDialogOpen(() => true);
  }, []);

  const onConfirmApplicationDelete = async () => {
    const applicationIds: string[] = Object.keys(rowSelection);
    const response = await deleteApplications(companyId, applicationIds);
    if (response.status === 200) {
      const responseBody = response.data;
      setIsDeleteDialogOpen(() => false);
      if (responseBody.failure.length > 0) {
        snackBar.setSnackBar({
          alertType: "error",
          message: "An unexpected error occurred.",
          setShowSnackbar: () => true,
          showSnackbar: true,
        });
      } else {
        snackBar.setSnackBar({
          message: "Application Deleted",
          alertType: "info",
          setShowSnackbar: () => true,
          showSnackbar: true,
        });
      }
      setRowSelection(() => {
        return {};
      });
      applicationsInProgressQuery.refetch();
    }
  };

  const canRowBeSelected = useCallback(
    (permitApplicationOrigin?: Nullable<PermitApplicationOrigin>) =>
      canUserAccessApplication(permitApplicationOrigin, userRole),
    [userRole],
  );

  useEffect(() => {
    if (isError) {
      snackBar.setSnackBar({
        message: "An unexpected error occurred.",
        showSnackbar: true,
        setShowSnackbar: () => true,
        alertType: "error",
      });
    }
  }, [isError]);

  const onCancelApplicationDelete = useCallback(() => {
    setRowSelection(() => {
      return {};
    });
    setIsDeleteDialogOpen(() => false);
  }, []);

  const table = useMaterialReactTable({
    ...defaultTableOptions,
    columns: columns,
    data: getDefaultRequiredVal([], applicationsInProgress?.items),
    initialState: {
      ...defaultTableInitialStateOptions,
    },
    state: {
      ...defaultTableStateOptions,
      showAlertBanner: isError,
      showProgressBars: isFetching,
      columnVisibility: { applicationId: true },
      isLoading: isPending,
      rowSelection,
      pagination,
      sorting,
    },
    displayColumnDefOptions: {
      "mrt-row-select": {
        size: 10,
      },
    },
    enableRowActions: false,
    enableRowSelection: (row) =>
      canRowBeSelected(row?.original?.permitApplicationOrigin),
    onRowSelectionChange: useCallback(setRowSelection, [userRole]),
    getRowId: (originalRow) => {
      const applicationRow = originalRow as ApplicationListItem;
      return applicationRow.permitId;
    },
    renderTopToolbar: useCallback(
      () => (
        <div className="applications-in-progress-list__top-toolbar">
          <DeleteButton onClick={onClickDelete} disabled={hasNoRowsSelected} />
        </div>
      ),
      [hasNoRowsSelected],
    ),
    enableGlobalFilter: false,
    autoResetPageIndex: false,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: getDefaultRequiredVal(
      0,
      applicationsInProgress?.meta?.totalItems,
    ),
    pageCount: getDefaultRequiredVal(
      0,
      applicationsInProgress?.meta?.pageCount,
    ),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    enablePagination: true,
    enableBottomToolbar: true,
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
  });

  return (
    <div className="applications-in-progress-list table-container">
      {canShowPendingBanner ? (
        <WarningBcGovBanner
          className="pending-permits-warning"
          msg={
            <div className="pending-permits-warning__msg">
              <span>
                Some of your applications weren&apos;t processed. See your
              </span>
              <CustomActionLink
                className="pending-permits-warning__link"
                onClick={() => setShowPendingPermitsModal(true)}
              >
                Pending Permits
              </CustomActionLink>
            </div>
          }
        />
      ) : null}

      <PendingPermitsDialog
        showModal={showPendingPermitsModal}
        onCancel={() => setShowPendingPermitsModal(false)}
        pendingPermits={pendingPermits}
        pagination={pendingPermitPagination}
        setPagination={setPendingPermitPagination}
      />

      {showAIPTable ? <MaterialReactTable table={table} /> : <NoRecordsFound />}

      <DeleteConfirmationDialog
        onDelete={onConfirmApplicationDelete}
        showDialog={isDeleteDialogOpen}
        onCancel={onCancelApplicationDelete}
        itemToDelete="application"
      />
    </div>
  );
};
