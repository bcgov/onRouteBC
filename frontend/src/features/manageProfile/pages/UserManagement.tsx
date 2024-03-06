import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { RowSelectionState } from "@tanstack/table-core";
import { useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";

import {
  MaterialReactTable,
  MRT_Row,
  useMaterialReactTable,
} from "material-react-table";

import "./UserManagement.scss";
import { SnackBarContext } from "../../../App";
import { NoRecordsFound } from "../../../common/components/table/NoRecordsFound";
import { ONE_HOUR } from "../../../common/constants/constants";
import { DeleteConfirmationDialog } from "../../../common/components/dialog/DeleteConfirmationDialog";
import { Trash } from "../../../common/components/table/options/Trash";
import {
  deleteCompanyPendingUsers,
  deleteCompanyUsers,
  getCompanyUsers,
} from "../apiManager/manageProfileAPI";
import { UserManagementTableRowActions } from "../components/user-management/UserManagementRowOptions";
import { UserManagementColumnsDefinition } from "../types/UserManagementColumns";
import {
  defaultTableOptions,
  defaultTableInitialStateOptions,
  defaultTableStateOptions,
} from "../../../common/helpers/tableHelper";
import {
  BCeID_USER_STATUS,
  BCeIDUserStatusType,
  DeleteResponse,
  ReadUserInformationResponse,
} from "../types/manageProfile.d";
import { useNavigate } from "react-router-dom";
import { ERROR_ROUTES } from "../../../routes/constants";

/**
 * User Management Component for CV Client.
 */
export const UserManagement = () => {
  const query = useQuery({
    queryKey: ["companyUsers"],
    queryFn: getCompanyUsers,
    staleTime: ONE_HOUR,
  });
  const navigate = useNavigate();
  const { data, isError, isLoading } = query;
  const { setSnackBar } = useContext(SnackBarContext);
  const { user: userFromToken } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const hasNoRowsSelected = Object.keys(rowSelection).length === 0;

  /**
   * Callback function for clicking on the Trash icon above the Table.
   */
  const onClickTrashIcon = useCallback(() => {
    setIsDeleteDialogOpen(() => true);
  }, []);

  const getSelectedUsers = useCallback(
    (userStatus: BCeIDUserStatusType) =>
      Object.keys(rowSelection)
        .filter((value: string) => value.split("-")[1] === userStatus)
        .map((value: string) => value.split("-")[0]),
    [rowSelection],
  );

  /**
   * Function that deletes one or more users.
   */
  const onConfirmDelete = async () => {
    setIsDeleteDialogOpen(() => false);
    const userNames: string[] = getSelectedUsers(BCeID_USER_STATUS.PENDING);
    const userGUIDs: string[] = getSelectedUsers(BCeID_USER_STATUS.ACTIVE);
    if (userGUIDs.length > 0) {
      deleteCompanyUsers(userGUIDs).then(({ data: companyUserResponse }) => {
        const { failure } = companyUserResponse as DeleteResponse;
        if (failure?.length > 0) {
          navigate(ERROR_ROUTES.UNEXPECTED);
        }
      });
    }
    if (userNames.length > 0) {
      deleteCompanyPendingUsers(userNames)
        .then(({ data: pendingUserResponse }) => {
          const { failure } = pendingUserResponse as DeleteResponse;
          if (failure?.length > 0) {
            navigate(ERROR_ROUTES.UNEXPECTED);
          }
        })
        .finally(() => {
          setRowSelection(() => {
            return {};
          });
          query.refetch();
        });
    }
  };

  /**
   * Function that clears the delete related states when the user clicks on cancel.
   */
  const onCancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(() => false);
    setRowSelection(() => {
      return {};
    });
  }, []);

  useEffect(() => {
    if (isError) {
      setSnackBar({
        message: "An unexpected error occurred.",
        showSnackbar: true,
        setShowSnackbar: () => true,
        alertType: "error",
      });
    }
  }, [isError]);

  const table = useMaterialReactTable({
    ...defaultTableOptions,
    columns: UserManagementColumnsDefinition,
    data: data ?? [],
    initialState: {
      ...defaultTableInitialStateOptions,
    },
    state: {
      ...defaultTableStateOptions,
      showAlertBanner: isError,
      showProgressBars: isLoading,
      columnVisibility: { applicationId: true },
      isLoading: isLoading,
      rowSelection: rowSelection,
    },
    enableGlobalFilter: false,
    renderEmptyRowsFallback: () => <NoRecordsFound />,
    enableRowSelection: (
      row: MRT_Row<ReadUserInformationResponse>,
    ): boolean => {
      if (row?.original?.userGUID === userFromToken?.profile?.bceid_user_guid) {
        return false;
      }
      return true;
    },
    onRowSelectionChange: setRowSelection,
    getRowId: (originalRow: ReadUserInformationResponse) => {
      const { statusCode, userName, userGUID } = originalRow;
      if (statusCode === BCeID_USER_STATUS.PENDING) {
        return `${userName}-${statusCode}`;
      } else {
        return `${userGUID}-${statusCode}`;
      }
    },
    displayColumnDefOptions: {
      "mrt-row-actions": {
        header: "",
      },
    },
    renderRowActions: useCallback(
      ({ row }: { row: MRT_Row<ReadUserInformationResponse> }) => {
        if (row.original.statusCode === BCeID_USER_STATUS.ACTIVE) {
          return (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <UserManagementTableRowActions userGUID={row.original.userGUID} />
            </Box>
          );
        } else {
          return <></>;
        }
      },
      [],
    ),
    renderToolbarInternalActions: useCallback(
      () => (
        <Box className="table-container__toolbar-internal-actions">
          <Trash onClickTrash={onClickTrashIcon} disabled={hasNoRowsSelected} />
        </Box>
      ),
      [hasNoRowsSelected],
    ),
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
  });

  return (
    <div className="table-container">
      <MaterialReactTable table={table} />
      <DeleteConfirmationDialog
        onClickDelete={onConfirmDelete}
        isOpen={isDeleteDialogOpen}
        onClickCancel={onCancelDelete}
        caption="user"
      />
    </div>
  );
};
