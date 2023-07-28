import { useCallback, useContext, useEffect } from "react";
import MaterialReactTable, {
  MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_Row,
  MRT_TableInstance,
} from "material-react-table";
import "../../../manageVehicles/components/list/List.scss";
import { Box } from "@mui/material";
import { BC_COLOURS } from "../../../../themes/bcGovStyles";
import { useQuery } from "@tanstack/react-query";

import { SnackBarContext } from "../../../../App";
import {
  ApplicationInProgress,
  PermitApplicationInProgress,
} from "../../types/application";
import { ActivePermitsColumnDefinition } from "./Columns";
import { getActivePermits } from "../../apiManager/permitsAPI";
import { FIVE_MINUTES } from "../../../../common/constants/constants";
import { PermitRowOptions } from "./PermitRowOptions";
import { EmptyTable } from "../../../../common/components/table/EmptyTable";

/**
 * Dynamically set the column
 * @returns An array of column headers/accessor keys ofr Material React Table
 */
const getColumns = (): MRT_ColumnDef<PermitApplicationInProgress>[] => {
  return ActivePermitsColumnDefinition;
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
export const ExpiredPermitList = () => {
  const { data, isInitialLoading, isError } = useQuery({
    queryKey: ["activePermits"],
    queryFn: getActivePermits,
    keepPreviousData: true,
    staleTime: FIVE_MINUTES,
  });

  const snackBar = useContext(SnackBarContext);

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

  const columns = getColumns();

  const dd: PermitApplicationInProgress[] = [
    {
      permitId: "4",
      permitStatus: "ISSUED",
      companyId: 103,
      userGuid: "EB1CA523856F4E7C92F7322C0194CA3E",
      permitType: "TROS",
      applicationNumber: "A2-00010006-582-R00",
      permitNumber: "P2-00010006-582-R00",
      permitApprovalSource: null,
      permitApplicationOrigin: "ONLINE",
      createdDateTime: "2023-07-25T17:57:48.969Z",
      updatedDateTime: "2023-07-25T17:57:48.969Z",
      documentId: null,
      permitData: {
        startDate: "2023-07-25",
        permitDuration: 30,
        expiryDate: "2023-08-23",
        commodities: [
          {
            description: "General Permit Conditions",
            condition: "CVSE-1000",
            conditionLink:
              "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1251",
            checked: true,
            disabled: true,
          },
          {
            description: "Permit Scope and Limitation",
            condition: "CVSE-1070",
            conditionLink:
              "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1261",
            checked: true,
            disabled: true,
          },
        ],
        contactDetails: {
          firstName: "Terran",
          lastName: "Wilkie",
          phone1: "(250) 634-3419",
          email: "terran.wilkie@gov.bc.ca",
        },
        mailingAddress: {
          addressLine1: "1445 Fort Street",
          city: "Victoria",
          provinceCode: "BC",
          countryCode: "CA",
          postalCode: "V8S1Z4",
        },
        vehicleDetails: {
          unitNumber: "K344",
          vin: "CYZ128437ZYX",
          plate: "N8769N",
          make: "BMW",
          year: 0,
          countryCode: "CA",
          provinceCode: "BC",
          vehicleType: "TRUCK",
          vehicleSubType: "TOW",
          saveVehicle: false,
        },
        feeSummary: "30",
      },
    },
    {
      permitId: "4",
      permitStatus: "ISSUED",
      companyId: 103,
      userGuid: "EB1CA523856F4E7C92F7322C0194CA3E",
      permitType: "TROS",
      applicationNumber: "A2-00010006-582-R00",
      permitNumber: "P3-00010006-582-R00",
      permitApprovalSource: null,
      permitApplicationOrigin: "ONLINE",
      createdDateTime: "2023-07-25T17:57:48.969Z",
      updatedDateTime: "2023-07-25T17:57:48.969Z",
      documentId: null,
      permitData: {
        startDate: "2023-06-25",
        permitDuration: 30,
        expiryDate: "2023-07-30",
        commodities: [
          {
            description: "General Permit Conditions",
            condition: "CVSE-1000",
            conditionLink:
              "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1251",
            checked: true,
            disabled: true,
          },
          {
            description: "Permit Scope and Limitation",
            condition: "CVSE-1070",
            conditionLink:
              "https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1261",
            checked: true,
            disabled: true,
          },
        ],
        contactDetails: {
          firstName: "Terran",
          lastName: "Wilkie",
          phone1: "(250) 634-3419",
          email: "terran.wilkie@gov.bc.ca",
        },
        mailingAddress: {
          addressLine1: "1445 Fort Street",
          city: "Victoria",
          provinceCode: "BC",
          countryCode: "CA",
          postalCode: "V8S1Z4",
        },
        vehicleDetails: {
          unitNumber: "U9899",
          vin: "CYZ128437ZYX",
          plate: "N8769N",
          make: "BMW",
          year: 0,
          countryCode: "CA",
          provinceCode: "BC",
          vehicleType: "TRUCK",
          vehicleSubType: "TOW",
          saveVehicle: false,
        },
        feeSummary: "30",
      },
    },
  ];

  return (
    <div className="table-container">
      <MaterialReactTable
        columns={columns}
        data={dd ?? []}
        state={{
          showAlertBanner: isError,
          showProgressBars: isInitialLoading,
          columnVisibility: { applicationId: true },
          isLoading: isInitialLoading,
        }}
        renderEmptyRowsFallback={() => <EmptyTable />}
        selectAllMode="page"
        enableStickyHeader
        positionActionsColumn="last"
        // Disable the default column actions so that we can use our custom actions
        enableColumnActions={false}
        // Row copy, delete, and edit options
        getRowId={(originalRow) => {
          const applicationRow = originalRow as PermitApplicationInProgress;
          return applicationRow.permitId;
        }}
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
            table: MRT_TableInstance<PermitApplicationInProgress>;
            row: MRT_Row<PermitApplicationInProgress>;
          }) => {
            // const isExpired = hasPermitExpired(
            //   row.original.permitData.expiryDate
            // );
            return (
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <PermitRowOptions isExpired={false} permitId={row.original.permitId} />
              </Box>
            );
          },
          []
        )}
        // Render a custom options Bar (inclues search, filter, trash, and csv options)
        renderTopToolbar={useCallback(
          ({ table }: { table: MRT_TableInstance<ApplicationInProgress> }) => (
            <Box
              sx={{
                display: "flex",
                padding: "20px 0px",
                backgroundColor: "white",
              }}
            >
              <MRT_GlobalFilterTextField table={table} />
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
      {/* <DeleteConfirmationDialog
        onClickDelete={() => {}}
        isOpen={isDeleteDialogOpen}
        onClickCancel={() => {}}
        caption="application"
      /> */}
    </div>
  );

  // if (!isInitialLoading && data?.length === 0) {
  //   return <EmptyTable />;
  // } else {

  // }
};

ExpiredPermitList.displayName = "ExpiredPermitList";
