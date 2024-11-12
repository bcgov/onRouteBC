import { Box, FormControlLabel, Switch } from "@mui/material";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { memo, useCallback, useContext, useMemo, useState } from "react";
import {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_Row,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import OnRouteBCContext from "../../../../common/authentication/OnRouteBCContext";
import { Optional } from "../../../../common/types/common";
import { USER_ROLE } from "../../../../common/authentication/types";
import { hasPermitExpired } from "../../../permits/helpers/permitState";
import { isPermitInactive } from "../../../permits/types/PermitStatus";
import { PermitListItem } from "../../../permits/types/permit";
import { getPermitDataBySearch } from "../api/idirSearch";
import { PermitSearchResultColumnDef } from "../table/PermitSearchResultColumnDef";
import { SearchFields } from "../types/types";
import { IDIRPermitSearchRowActions } from "./IDIRPermitSearchRowActions";
import {
  defaultTableInitialStateOptions,
  defaultTableOptions,
  defaultTableStateOptions,
} from "../../../../common/helpers/tableHelper";
import "./IDIRPermitSearchResults.scss";
import { ERROR_ROUTES } from "../../../../routes/constants";
import { useNavigate } from "react-router-dom";

/**
 * Function to decide whether to show row actions icon or not.
 * @param userRole The role of the user.
 * @returns boolean
 */
const shouldShowRowActions = (userRole: Optional<string>): boolean => {
  if (!userRole) return false;
  // Check if the user has PPC role to confirm
  const allowableRoles = [
    USER_ROLE.PPC_CLERK,
    USER_ROLE.ENFORCEMENT_OFFICER,
    USER_ROLE.SYSTEM_ADMINISTRATOR,
  ] as string[];
  return allowableRoles.includes(userRole);
};

/*
 *
 * The search results component uses Material React Table (MRT)
 * For detailed documentation, see here:
 * https://www.material-react-table.com/docs/getting-started/usage
 *
 *
 */
export const IDIRPermitSearchResults = memo(
  ({
    searchParams,
  }: {
    /**
     * The search parameters entered by the user.
     */
    searchParams: SearchFields;
  }) => {
    const { searchString, searchByFilter, searchEntity } = searchParams;
    const { idirUserDetails } = useContext(OnRouteBCContext);
    const [isActiveRecordsOnly, setIsActiveRecordsOnly] =
      useState<boolean>(false);
    const [pagination, setPagination] = useState<MRT_PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });
    const searchResultsQuery = useQuery({
      queryKey: [
        "search-entity",
        searchString,
        searchByFilter,
        searchEntity,
        pagination.pageIndex,
        pagination.pageSize,
      ],
      queryFn: () =>
        getPermitDataBySearch(
          {
            searchByFilter,
            searchEntity,
            searchString: searchString,
          },
          { page: pagination.pageIndex, take: pagination.pageSize },
        ),
      retry: 1, // retry once.
      enabled: true,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    });

    const { data, isPending, isError } = searchResultsQuery;

    const navigate = useNavigate();

    // Column definitions for the table
    const columns = useMemo<MRT_ColumnDef<PermitListItem>[]>(
      () => PermitSearchResultColumnDef(() => navigate(ERROR_ROUTES.DOCUMENT_UNAVAILABLE)),
      [],
    );

    /**
     *
     * @param initialData The initial data to filter by the active data toggle.
     * @returns List of permit items containing the data to be displayed in table.
     */
    const getFilteredData = (
      initialData: PermitListItem[],
    ): PermitListItem[] => {
      if (!initialData.length) return [];
      if (isActiveRecordsOnly) {
        // Returns unexpired permits
        return initialData.filter(
          ({ permitStatus, expiryDate }) =>
            !hasPermitExpired(expiryDate) && !isPermitInactive(permitStatus),
        );
      }
      return initialData;
    };

    const table = useMaterialReactTable({
      ...defaultTableOptions,
      data: getFilteredData(data?.items ?? []),
      columns: columns,
      initialState: {
        ...defaultTableInitialStateOptions,
        sorting: [{ id: "permitIssueDateTime", desc: true }],
      },
      state: {
        ...defaultTableStateOptions,
        isLoading: isPending,
        showAlertBanner: isError,
        showProgressBars: isPending,
        pagination,
      },
      autoResetPageIndex: false,
      manualPagination: true,
      rowCount: data?.meta?.totalItems ?? 0,
      pageCount: data?.meta?.pageCount ?? 0,
      onPaginationChange: setPagination,
      enablePagination: true,
      enableTopToolbar: true,
      enableBottomToolbar: true,
      enableRowSelection: false,
      enableGlobalFilter: false,
      renderToolbarInternalActions: () => (
        <div className="toolbar-internal"></div>
      ),
      renderTopToolbarCustomActions: () => {
        return (
          <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
            <FormControlLabel
              value="end"
              control={
                <Switch
                  color="primary"
                  checked={isActiveRecordsOnly}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setIsActiveRecordsOnly(() => event.target.checked);
                  }}
                />
              }
              label="Active Permits Only"
              labelPlacement="end"
            />
          </Box>
        );
      },
      renderRowActions: useCallback(
        ({ row }: { row: MRT_Row<PermitListItem> }) => {
          const isInactive =
            hasPermitExpired(row.original.expiryDate) ||
            isPermitInactive(row.original.permitStatus);

          if (shouldShowRowActions(idirUserDetails?.userRole)) {
            return (
              <Box className="idir-search-results__row-actions">
                <IDIRPermitSearchRowActions
                  isPermitInactive={isInactive}
                  permitNumber={row.original.permitNumber}
                  permitId={row.original.permitId}
                  userRole={idirUserDetails?.userRole}
                  companyId={row.original.companyId}
                />
              </Box>
            );
          } else {
            return <></>;
          }
        },
        [],
      ),
      muiToolbarAlertBannerProps: isError
        ? {
            color: "error",
            children: "Error loading data",
          }
        : undefined,
    });

    return (
      <div className="table-container idir-search-results">
        <MaterialReactTable table={table} />
      </div>
    );
  },
);

IDIRPermitSearchResults.displayName = "SearchResults";
