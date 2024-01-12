import { RowSelectionState } from "@tanstack/table-core";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { UseQueryResult } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_Row,
  MRT_TableInstance,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import "./List.scss";
import { Trash } from "../../../../common/components/table/options/Trash";
import { DeleteConfirmationDialog } from "../../../../common/components/dialog/DeleteConfirmationDialog";
import { PowerUnitColumnDefinition, TrailerColumnDefinition } from "./Columns";
import { deleteVehicles } from "../../apiManager/vehiclesAPI";
import { SnackBarContext } from "../../../../App";
import { VEHICLES_ROUTES } from "../../../../routes/constants";
import { DoesUserHaveRoleWithContext } from "../../../../common/authentication/util";
import { ROLES } from "../../../../common/authentication/types";
import { NoRecordsFound } from "../../../../common/components/table/NoRecordsFound";
import { getDefaultRequiredVal } from "../../../../common/helpers/util";
import {
  Vehicle,
  VehicleType,
  PowerUnit,
  Trailer,
  VEHICLE_TYPES,
} from "../../types/Vehicle";

import {
  usePowerUnitSubTypesQuery,
  useTrailerSubTypesQuery,
} from "../../apiManager/hooks";

import {
  defaultTableOptions,
  defaultTableInitialStateOptions,
  defaultTableStateOptions
} from "../../../../common/helpers/tableHelper";

/**
 * Dynamically set the column based on vehicle type
 * @param vehicleType Type of the vehicle
 * @returns An array of column headers/accessor keys for Material React Table
 */
const getColumns = (
  vehicleType: VehicleType,
): MRT_ColumnDef<Vehicle>[] => {
  if (vehicleType === VEHICLE_TYPES.POWER_UNIT) {
    return PowerUnitColumnDefinition;
  }
  return TrailerColumnDefinition;
};

/*
 *
 * The List component uses Material React Table (MRT)
 * For detailed documentation, see here:
 * https://www.material-react-table.com/docs/getting-started/usage
 *
 *
 */
/* eslint-disable react/prop-types */
export const List = memo(
  ({
    vehicleType,
    query,
    companyId,
  }: {
    vehicleType: VehicleType;
    query: UseQueryResult<Vehicle[]>;
    companyId: string;
  }) => {
    // Data, fetched from backend API
    const { data, isError, isFetching, isLoading } = query;

    // Column definitions for the table
    const columns = useMemo<MRT_ColumnDef<Vehicle>[]>(
      () => getColumns(vehicleType),
      [],
    );

    const snackBar = useContext(SnackBarContext);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const hasNoRowsSelected = Object.keys(rowSelection).length === 0;

    const powerUnitSubTypesQuery = usePowerUnitSubTypesQuery();
    const trailerSubTypesQuery = useTrailerSubTypesQuery();
    const fetchedPowerUnitSubTypes = getDefaultRequiredVal(
      [],
      powerUnitSubTypesQuery.data,
    );
    const fetchedTrailerSubTypes = getDefaultRequiredVal(
      [],
      trailerSubTypesQuery.data,
    );

    const colTypeCodes = columns.filter(
      (item) => item.accessorKey === `${vehicleType}TypeCode`,
    );
    const newColumns = columns.filter(
      (item) => item.accessorKey !== `${vehicleType}TypeCode`,
    );

    const transformVehicleCode = (code: string) => {
      let val;
      if (vehicleType === VEHICLE_TYPES.POWER_UNIT) {
        val = fetchedPowerUnitSubTypes?.filter((value) => value.typeCode === code);
      } else {
        val = fetchedTrailerSubTypes?.filter((value) => value.typeCode === code);
      }
      return val?.at(0)?.type ?? "";
    };

    if (colTypeCodes?.length === 1) {
      const colTypeCode = colTypeCodes?.at(0);
      if (colTypeCode) {
        // eslint-disable-next-line react/display-name
        colTypeCode.Cell = ({ cell }) => {
          return <div>{transformVehicleCode(cell.getValue<string>())}</div>;
        };

        const colDate = newColumns?.pop();
        newColumns.push(colTypeCode);
        if (colDate) newColumns.push(colDate);
      }
    }

    /**
     * Callback function for clicking on the Trash icon above the Table.
     */
    const onClickTrashIcon = useCallback(() => {
      setIsDeleteDialogOpen(() => true);
    }, []);

    /**
     * Function that deletes a vehicle once the user confirms the delete action
     * in the confirmation dialog.
     */
    const onConfirmDelete = async () => {
      const vehicleIds: string[] = Object.keys(rowSelection);

      const response = await deleteVehicles(vehicleIds, vehicleType, companyId);
      if (response.status === 200) {
        const responseBody = response.data;
        setIsDeleteDialogOpen(() => false);
        if (responseBody.failure.length > 0) {
          snackBar.setSnackBar({
            message: "An unexpected error occurred.",
            showSnackbar: true,
            setShowSnackbar: () => true,
            alertType: "error",
          });
        } else {
          snackBar.setSnackBar({
            message: "Vehicle Deleted",
            showSnackbar: true,
            setShowSnackbar: () => true,
            alertType: "info",
          });
        }
        setRowSelection(() => {
          return {};
        });
        query.refetch();
      }
    };

    const navigate = useNavigate();

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
        snackBar.setSnackBar({
          message: "An unexpected error occurred.",
          showSnackbar: true,
          setShowSnackbar: () => true,
          alertType: "error",
        });
      }
    }, [isError]);
    // End snackbar code for error handling

    const table = useMaterialReactTable({
      ...defaultTableOptions,
      data: data ?? [],
      columns: newColumns,
      initialState: {
        ...defaultTableInitialStateOptions,
      },
      state: {
        ...defaultTableStateOptions,
        isLoading,
        showAlertBanner: isError,
        showProgressBars: isFetching,
        sorting: [{ id: "createdDateTime", desc: true }],
        columnVisibility: { powerUnitId: false, trailerId: false },
        rowSelection: rowSelection,
      },
      getRowId: (originalRow) => {
        if (vehicleType === VEHICLE_TYPES.POWER_UNIT) {
          const powerUnitRow = originalRow as PowerUnit;
          return powerUnitRow.powerUnitId as string;
        } else {
          const trailerRow = originalRow as Trailer;
          return trailerRow.trailerId as string;
        }
      },
      onRowSelectionChange: setRowSelection,
      renderEmptyRowsFallback: () => <NoRecordsFound />,
      renderRowActions: useCallback(
        ({ row }: { row: MRT_Row<Vehicle> }) => (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            {DoesUserHaveRoleWithContext(ROLES.WRITE_VEHICLE) && (
              <>
                <Tooltip arrow placement="left" title="Edit">
                  <IconButton
                    onClick={() => {
                      if (vehicleType === VEHICLE_TYPES.POWER_UNIT) {
                        navigate(
                          `${VEHICLES_ROUTES.POWER_UNIT_DETAILS}/${row.getValue(
                            "powerUnitId",
                          )}`,
                        );
                      } else if (vehicleType === VEHICLE_TYPES.TRAILER) {
                        navigate(
                          `${VEHICLES_ROUTES.TRAILER_DETAILS}/${row.getValue(
                            "trailerId",
                          )}`,
                        );
                      }
                    }}
                    disabled={false}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip arrow placement="top" title="Delete">
                  {/*tslint:disable-next-line*/}
                  <IconButton
                    color="error"
                    onClick={() => {
                      setIsDeleteDialogOpen(() => true);
                      setRowSelection(() => {
                        const newObject: { [key: string]: boolean } = {};
                        // Setting the selected row to false so that
                        // the row appears unchecked.
                        newObject[row.getValue<string>(`${vehicleType}Id`)] =
                          false;
                        return newObject;
                      });
                    }}
                    disabled={false}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        ),
        [],
      ),
      // Render a custom options Bar (inclues search and trash)
      renderTopToolbar: useCallback(
        ({ table }: { table: MRT_TableInstance<Vehicle> }) => (
          <Box className="table-container__top-toolbar">
            <MRT_GlobalFilterTextField table={table} />
            {DoesUserHaveRoleWithContext(ROLES.WRITE_VEHICLE) && (
              <Trash
                onClickTrash={onClickTrashIcon}
                disabled={hasNoRowsSelected}
              />
            )}
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
          caption="item"
        />
      </div>
    );
  },
);

List.displayName = "List";
