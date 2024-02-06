import { MRT_ColumnDef } from "material-react-table";

import { viewPermitPdf } from "../../helpers/permitPDFHelper";
import { Permit } from "../../types/permit";
import { PermitChip } from "./PermitChip";
import { formatCellValuetoDatetime } from "../../../../common/helpers/tableHelper";
import { CustomActionLink } from "../../../../common/components/links/CustomActionLink";

/**
 * The column definition for Permits.
 */
export const PermitsColumnDefinition: MRT_ColumnDef<Permit>[] = [
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
            onClick={() => viewPermitPdf(props.row.original.permitId)}
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
  },
  {
    accessorFn: (row) => `${row.permitData.vehicleDetails?.unitNumber ?? ""}`,
    id: "unitNumber",
    header: "Unit #",
    enableSorting: true,
  },
  {
    accessorKey: "permitData.vehicleDetails.plate",
    header: "Plate",
    id: "plate",
    enableSorting: true,
  },
  {
    accessorKey: "permitData.startDate",
    id: "startDate",
    header: "Permit Start Date",
    enableSorting: true,
    Cell: (props: { cell: any }) => {
      const formattedDate = formatCellValuetoDatetime(props.cell.getValue());
      return formattedDate;
    },
  },
  {
    accessorKey: "permitData.expiryDate",
    header: "Permit End Date",
    id: "expiryDate",
    enableSorting: true,
    Cell: (props: { cell: any }) => {
      const formattedDate = formatCellValuetoDatetime(props.cell.getValue());
      return formattedDate;
    },
  },
  {
    accessorFn: (row) =>
      `${row.permitData.contactDetails?.firstName} ${row.permitData.contactDetails?.lastName} `,
    id: "applicant",
    header: "Applicant",
    enableSorting: true,
  },
];

export const PermitsNotFoundColumnDefinition: MRT_ColumnDef<Permit>[] =
  PermitsColumnDefinition;
