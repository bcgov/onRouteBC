import { Box } from "@mui/material";
import { UseQueryResult } from "@tanstack/react-query";
import { RowSelectionState } from "@tanstack/table-core";
import MaterialReactTable, {
  MRT_GlobalFilterTextField,
  MRT_Row,
  MRT_TableInstance,
} from "material-react-table";
import { useCallback, useContext, useEffect, useState } from "react";
import { SnackBarContext } from "../../../App";
import { NoRecordsFound } from "../../../common/components/table/NoRecordsFound";
import { BC_COLOURS } from "../../../themes/bcGovStyles";
import { Trash } from "../../manageVehicles/components/options/Trash";
import { UserManagementRowOptions } from "../components/user-management/UserManagementRowOptions";
import { UserManagementColumnsDefinition } from "../types/UserManagementColumns";
import { ReadCompanyUser } from "../types/userManagement";

/**
 * User Management Component for CV Client.
 */
export const UserManagement = ({
  query,
  isExpired = false,
}: {
  query: UseQueryResult<ReadCompanyUser[]>;
  isExpired?: boolean;
}) => {
  const { data, isError, isInitialLoading } = query;
  const snackBar = useContext(SnackBarContext);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  /**
   * Callback function for clicking on the Trash icon above the Table.
   */
  const onClickTrashIcon = useCallback(() => {
    setIsDeleteDialogOpen(() => true);
  }, []);

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

  return (
    <MaterialReactTable
      columns={UserManagementColumnsDefinition}
      data={data ?? []}
      state={{
        showAlertBanner: isError,
        showProgressBars: isInitialLoading,
        columnVisibility: { applicationId: true },
        isLoading: isInitialLoading,
        rowSelection: rowSelection,
      }}
      renderEmptyRowsFallback={() => <NoRecordsFound />}
      selectAllMode="page"
      // Enable checkboxes for row selection
      enableRowSelection={true}
      enableStickyHeader
      positionActionsColumn="last"
      // Disable the default column actions so that we can use our custom actions
      enableColumnActions={false}
      enableRowActions={true}
      displayColumnDefOptions={{
        "mrt-row-actions": {
          header: "",
        },
      }}
      renderRowActions={useCallback(
        ({
          row,
        }: {
          table: MRT_TableInstance<ReadCompanyUser>;
          row: MRT_Row<ReadCompanyUser>;
        }) => {
          return (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <UserManagementRowOptions userGUID={row.original.userGUID} />
            </Box>
          );
        },
        []
      )}
      renderTopToolbar={useCallback(
        ({ table }: { table: MRT_TableInstance<ReadCompanyUser> }) => (
          <Box
            sx={{
              display: "flex",
              padding: "20px 0px",
              backgroundColor: "white",
            }}
          >
            <MRT_GlobalFilterTextField table={table} />
            <Trash onClickTrash={onClickTrashIcon} />
          </Box>
        ),
        []
      )}
      /*
       *
       * STYLES
       *
       */
      // Main table container
      muiTablePaperProps={{
        sx: {
          border: "none",
          boxShadow: "none",
        },
      }}
      // Column widths
      defaultColumn={{
        size: 50,
        maxSize: 200,
        minSize: 25,
      }}
      // Cell/Body container
      muiTableContainerProps={{
        sx: {
          height: "calc(100vh - 475px)",
          outline: "1px solid #DBDCDC",
        },
      }}
      // Pagination
      muiBottomToolbarProps={{
        sx: {
          backgroundColor: BC_COLOURS.bc_background_light_grey,
          zIndex: 0,
        },
      }}
      // Alert banner
      muiToolbarAlertBannerProps={
        isError
          ? {
              color: "error",
              children: "Error loading data",
            }
          : undefined
      }
      // Top toolbar
      muiTopToolbarProps={{ sx: { zIndex: 0 } }}
      // Search Bar
      positionGlobalFilter="left"
      initialState={{ showGlobalFilter: true }} //show the search bar by default
      muiSearchTextFieldProps={{
        placeholder: "Search",
        sx: {
          minWidth: "300px",
          backgroundColor: "white",
        },
        variant: "outlined",
        inputProps: {
          sx: {
            padding: "10px",
          },
        },
      }}
      // Row Header
      muiTableHeadRowProps={{
        sx: {
          backgroundColor: BC_COLOURS.bc_background_light_grey,
        },
      }}
    />
  );
};
