import { Box, Tooltip } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";

import { CustomActionLink } from "../../../../common/components/links/CustomActionLink";
import { PermitListItem } from "../../../permits/types/permit";
import {
  PERMIT_EXPIRED,
  PERMIT_STATUSES,
  PermitStatus,
} from "../../../permits/types/PermitStatus";
import { PermitChip } from "../../../permits/components/permit-list/PermitChip";
import { viewPermitPdf } from "../../../permits/helpers/permitPDFHelper";
import { hasPermitExpired } from "../../../permits/helpers/permitState";
import { getPermitTypeName } from "../../../permits/types/PermitType";
import {
  dateTimeStringSortingFn,
  formatCellValuetoDatetime,
} from "../../../../common/helpers/tableHelper";

export const PermitSearchResultColumnDef = (
  onDocumentUnavailable: () => void,
): MRT_ColumnDef<PermitListItem>[] => [
  {
    accessorKey: "permitNumber",
    header: "Permit #",
    enableSorting: true,
    sortingFn: "alphanumeric",
    Cell: (props: { cell: any; row: any }) => {
      const permit = props.row.original as PermitListItem;

      const { permitId, permitStatus, expiryDate, companyId } = permit;

      const getDisplayedPermitStatus = (
        permitStatus: PermitStatus,
        expiryDate: string,
      ) => {
        if (permitStatus === PERMIT_STATUSES.VOIDED) {
          return PERMIT_STATUSES.VOIDED;
        }

        if (permitStatus === PERMIT_STATUSES.SUPERSEDED) {
          return PERMIT_STATUSES.SUPERSEDED;
        }

        if (hasPermitExpired(expiryDate)) {
          return PERMIT_EXPIRED;
        }

        return permitStatus;
      };

      return (
        <>
          <CustomActionLink
            onClick={() => {
              viewPermitPdf(companyId, permitId, () => onDocumentUnavailable());
            }}
          >
            {props.cell.getValue()}
          </CustomActionLink>
          <PermitChip
            permitStatus={getDisplayedPermitStatus(permitStatus, expiryDate)}
          />
        </>
      );
    },
    size: 170,
  },
  {
    accessorKey: "permitType",
    header: "Permit Type",
    enableSorting: true,
    sortingFn: "alphanumeric",
    Cell: (props: { cell: any }) => {
      const permitTypeName = getPermitTypeName(props.cell.getValue());
      return (
        <Tooltip title={permitTypeName}>
          <Box>{props.cell.getValue()}</Box>
        </Tooltip>
      );
    },
    size: 20,
  },
  {
    header: "Commodity",
    enableSorting: true,
    sortingFn: "alphanumeric",
    // For TROS permits, commodities is not a concern.
    // Other permits will require implementation here.
    Cell: () => <>NA</>,
    size: 20,
  },
  {
    accessorKey: "plate",
    header: "Plate",
    enableSorting: true,
    sortingFn: "alphanumeric",
    size: 20,
  },
  {
    accessorKey: "legalName",
    header: "Company Name",
    enableSorting: true,
    sortingFn: "alphanumeric",
    size: 180,
  },
  {
    accessorKey: "startDate",
    header: "Permit Start Date",
    enableSorting: true,
    sortingFn: dateTimeStringSortingFn,
    Cell: (props: { cell: any }) => {
      const formattedDate = formatCellValuetoDatetime(
        props.cell.getValue(),
        true,
      );
      return formattedDate;
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Permit End Date",
    enableSorting: true,
    sortingFn: dateTimeStringSortingFn,
    Cell: (props: { cell: any }) => {
      const formattedDate = formatCellValuetoDatetime(
        props.cell.getValue(),
        true,
      );
      return formattedDate;
    },
  },
  {
    id: "permitIssueDateTime",
    header: "Issue Date",
    enableSorting: true,
    sortDescFirst: true,
    sortingFn: dateTimeStringSortingFn,
    accessorFn: (originalRow) => {
      const { permitIssueDateTime } = originalRow;
      const formattedDate = formatCellValuetoDatetime(permitIssueDateTime);
      return formattedDate;
    },
  },
];
