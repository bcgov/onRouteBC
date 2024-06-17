import { MRT_ColumnDef } from "material-react-table";

import { ApplicationListItem } from "../../types/application";
import { APPLICATIONS_ROUTES } from "../../../../routes/constants";
import { CustomNavLink } from "../../../../common/components/links/CustomNavLink";
import { UserAuthGroupType } from "../../../../common/authentication/types";
import { canUserAccessApplication } from "../../helpers/mappers";
import { Nullable } from "../../../../common/types/common";
import { getPermitTypeName } from "../../types/PermitType";
import { Box, Tooltip } from "@mui/material";

export const ApplicationInProgressColumnDefinition = (
  userAuthGroup?: Nullable<UserAuthGroupType>,
): MRT_ColumnDef<ApplicationListItem>[] =>
  [
    {
      accessorKey: "applicationNumber",
      id: "applicationNumber",
      enableSorting: false,
      header: "Application #",
      accessorFn: (row) => row.applicationNumber,
      Cell: (props: { cell: any; row: any }) => {
        const permitIdStr = `${props.row.original.permitId}`;
        
        return canUserAccessApplication(
          props.row.original.permitApplicationOrigin,
          userAuthGroup,
        ) ? (
          <CustomNavLink
            to={`${APPLICATIONS_ROUTES.DETAILS(permitIdStr)}`}
            className="column-link column-link--application-details"
          >
            {props.cell.getValue()}
          </CustomNavLink>
        ) : (
          <>
            {props.cell.getValue()}
          </>
        );
      },
      size: 180,
    },
    {
      accessorKey: "permitType",
      id: "permitType",
      enableSorting: false,
      header: "Permit Type",
      Cell: (props: { cell: any; }) => {
        const permitTypeName = getPermitTypeName(props.cell.getValue())
        return <Tooltip title={permitTypeName}>
          <Box>
            {props.cell.getValue()}
          </Box>
        </Tooltip>
      },
      size: 50,
    },
    {
      accessorKey: "unitNumber",
      id: "unitNumber",
      enableSorting: false,
      header: "Unit #",
    },
    {
      accessorKey: "vin",
      id: "vin",
      enableSorting: false,
      header: "VIN",
      size: 50,
    },
    {
      accessorKey: "plate",
      id: "plate",
      enableSorting: false,
      header: "Plate",
      size: 50,
    },
    {
      accessorKey: "startDate",
      id: "startDate",
      enableSorting: false,
      header: "Permit Start Date",
      size: 100,
    },
    {
      accessorKey: "updatedDateTime",
      enableSorting: false,
      id: "updatedDateTime",
      header: "Last Updated",
      size: 200,
    },
    {
      accessorKey: "applicant",
      id: "applicant",
      header: "Applicant",
      enableSorting: false,
      size: 200,
    },
  ];

export const ApplicationNotFoundColumnDefinition: MRT_ColumnDef<ApplicationListItem>[] =
  [];
