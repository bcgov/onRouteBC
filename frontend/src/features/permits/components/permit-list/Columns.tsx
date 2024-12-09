import { MRT_ColumnDef } from "material-react-table";
import { Box, Tooltip } from "@mui/material";

import { viewPermitPdf } from "../../helpers/permitPDFHelper";
import { PermitListItem } from "../../types/permit";
import { PermitChip } from "./PermitChip";
import { formatCellValuetoDatetime } from "../../../../common/helpers/tableHelper";
import { CustomActionLink } from "../../../../common/components/links/CustomActionLink";
import { getDefaultRequiredVal } from "../../../../common/helpers/util";
import { getPermitTypeName } from "../../types/PermitType";

/**
 * The column definition for Permits.
 */
export const PermitsColumnDefinition = (
  onDocumentUnavailable: () => void,
): MRT_ColumnDef<PermitListItem>[] => [
  {
    accessorKey: "permitNumber",
    id: "permitNumber",
    header: "Permit #",
    enableSorting: true,
    size: 500,
    accessorFn: (row) => row.permitNumber,
    Cell: (props: { row: any; cell: any }) => {
      return (
        <>
          <CustomActionLink
            onClick={() => viewPermitPdf(
              props.row.original.companyId,
              props.row.original.permitId, 
              () => onDocumentUnavailable(),
            )}
          >
            {props.cell.getValue()}
          </CustomActionLink>
          <PermitChip permitStatus={props.row.original.permitStatus} />
        </>
      );
    },
  },
  {
    accessorKey: "permitType",
    id: "permitType",
    header: "Permit Type",
    enableSorting: true,
    Cell: (props: { cell: any; }) => {
      const permitTypeName = getPermitTypeName(props.cell.getValue())
      return <Tooltip title={permitTypeName}>
        <Box>
          {props.cell.getValue()}
        </Box>
      </Tooltip>
    }
  },
  {
    accessorFn: (row) => getDefaultRequiredVal("", row.unitNumber),
    id: "unitNumber",
    header: "Unit #",
    enableSorting: true,
  },
  {
    accessorKey: "plate",
    header: "Plate",
    id: "plate",
    enableSorting: true,
  },
  {
    accessorKey: "startDate",
    id: "startDate",
    header: "Permit Start Date",
    enableSorting: true,
    Cell: (props: { cell: any }) => {
      const formattedDate = formatCellValuetoDatetime(props.cell.getValue(), true);
      return formattedDate;
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Permit End Date",
    id: "expiryDate",
    enableSorting: true,
    Cell: (props: { cell: any }) => {
      const formattedDate = formatCellValuetoDatetime(props.cell.getValue(), true);
      return formattedDate;
    },
  },
  {
    accessorKey: "issuer",
    id: "issuer",
    header: "Issued By",
    enableSorting: true,
  },
];