import { MRT_ColumnDef } from "material-react-table";

import { ApplicationListItem } from "../../types/application";
import { APPLICATIONS_ROUTES } from "../../../../routes/constants";
import { CustomNavLink } from "../../../../common/components/links/CustomNavLink";
import { UserRoleType } from "../../../../common/authentication/types";
import { canUserAccessApplication } from "../../helpers/mappers";
import { Nullable } from "../../../../common/types/common";
import { getPermitTypeName } from "../../types/PermitType";
import { Box, Tooltip } from "@mui/material";
import { ApplicationInReviewStatusChip } from "./ApplicationInReviewStatusChip";

export const ApplicationInReviewColumnDefinition = (
  userRole?: Nullable<UserRoleType>,
): MRT_ColumnDef<ApplicationListItem>[] => [
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
        userRole,
      ) ? (
        <div>
          <CustomNavLink
            to={`${APPLICATIONS_ROUTES.DETAILS(permitIdStr)}`}
            className="column-link column-link--application-details"
          >
            {props.cell.getValue()}
          </CustomNavLink>
          <ApplicationInReviewStatusChip
            applicationQueueStatus={props.row.original.applicationQueueStatus}
          />
        </div>
      ) : (
        <>
          {props.cell.getValue()}
          <ApplicationInReviewStatusChip
            applicationQueueStatus={props.row.original.applicationQueueStatus}
          />
        </>
      );
    },
    minSize: 320,
  },
  {
    accessorKey: "permitType",
    id: "permitType",
    enableSorting: false,
    header: "Permit Type",
    Cell: (props: { cell: any }) => {
      const permitTypeName = getPermitTypeName(props.cell.getValue());
      return (
        <Tooltip title={permitTypeName}>
          <Box>{props.cell.getValue()}</Box>
        </Tooltip>
      );
    },
    size: 80,
  },
  {
    accessorKey: "unitNumber",
    id: "unitNumber",
    enableSorting: false,
    header: "Unit #",
    size: 50,
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
    enableSorting: true,
    header: "Permit Start Date",
    size: 140,
  },
  {
    accessorKey: "updatedDateTime",
    enableSorting: true,
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
