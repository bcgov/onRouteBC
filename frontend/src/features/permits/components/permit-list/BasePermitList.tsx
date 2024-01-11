import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useState } from "react";

import {
  MRT_GlobalFilterTextField,
  MRT_PaginationState,
  MRT_Row,
  MRT_SortingState,
  MRT_TableInstance,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import { SnackBarContext } from "../../../../App";
import { NoRecordsFound } from "../../../../common/components/table/NoRecordsFound";
import { getPermits } from "../../apiManager/permitsAPI";
import { Permit } from "../../types/permit";
import { PermitsColumnDefinition } from "./Columns";
import { PermitRowOptions } from "./PermitRowOptions";
import {
  defaultTableInitialStateOptions,
  defaultTableOptions,
  defaultTableStateOptions
} from "../../../../common/helpers/tableHelper";

/**
 * A permit list component with common functionalities that can be shared by
 * wrapping components.
 */
export const BasePermitList = ({
  isExpired = false,
}: {
  isExpired?: boolean;
}) => {
  const snackBar = useContext(SnackBarContext);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [sorting, setSorting] = useState<MRT_SortingState>([
    {
      id: "startDate",
      desc: true,
    },
  ]);

  const permitsQuery = useQuery({
    queryKey: [
      "permits",
      isExpired,
      globalFilter,
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
    ],
    queryFn: () =>
      getPermits(
        { expired: isExpired },
        {
          page: pagination.pageIndex,
          take: pagination.pageSize,
          searchValue: globalFilter,
          sorting:
            sorting.length > 0
              ? [
                  {
                    orderBy: sorting.at(0)?.id as string,
                    descending: Boolean(sorting.at(0)?.desc),
                  },
                ]
              : [],
        },
      ),
    keepPreviousData: true,
    retry: 1,
  });

  const { data, isError, isLoading, isRefetching } = permitsQuery;

  const table = useMaterialReactTable({
    ...defaultTableOptions,
    columns: PermitsColumnDefinition,
    data: data?.items ?? [],
    enableRowSelection: false,
    initialState: {
      ...defaultTableInitialStateOptions,
      sorting: [{ id: "startDate", desc: true }],
    },
    state: {
      ...defaultTableStateOptions,
      showAlertBanner: isError,
      columnVisibility: { applicationId: true },
      isLoading: isLoading || isRefetching,
      pagination,
      globalFilter,
      sorting,
    },
    renderTopToolbar: useCallback(
      ({ table }: { table: MRT_TableInstance<Permit> }) => (
        <Box
          sx={{
            display: "flex",
            padding: "1.25em 0em",
            backgroundColor: "white",
          }}
        >
          <MRT_GlobalFilterTextField table={table} />
        </Box>
      ),
      [],
    ),
    autoResetPageIndex: false,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: data?.meta?.totalItems ?? 0,
    pageCount: data?.meta?.pageCount ?? 0,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    enablePagination: true,
    enableBottomToolbar: true,
    renderEmptyRowsFallback: () => <NoRecordsFound />,
    renderRowActions: useCallback((props: { row: MRT_Row<Permit> }) => {
      return (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <PermitRowOptions
            isExpired={isExpired}
            permitId={props.row.original.permitId}
          />
        </Box>
      );
    }, []),
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
  });

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

  return <MaterialReactTable table={table} />;
};
