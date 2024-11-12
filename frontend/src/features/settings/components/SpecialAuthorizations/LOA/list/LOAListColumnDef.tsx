import { MRT_ColumnDef, MRT_Row } from "material-react-table";

import { LOADetail } from "../../../../types/LOADetail";
import { DATE_FORMATS, toLocal } from "../../../../../../common/helpers/formatDate";
import { applyWhenNotNullable } from "../../../../../../common/helpers/util";
import { LOANumberCell } from "./LOANumberCell";
import { LOADownloadCell } from "./LOADownloadCell";

export const LOAListColumnDef = (
  allowEditLOA: boolean,
  onEditLOA: (loaId: number) => void,
  onDownload: (loaId: number) => void,
): MRT_ColumnDef<LOADetail>[] => [
  {
    Cell: (
      props: { row: MRT_Row<LOADetail> },
    ) => (
      <LOANumberCell
        allowEditLOA={allowEditLOA}
        onEditLOA={onEditLOA}
        props={props}
      />
    ),
    accessorKey: "loaNumber",
    header: "LOA #",
    muiTableHeadCellProps: {
      className:
        "loa-list__header loa-list__header--number",
    },
    muiTableBodyCellProps: {
      className:
        "loa-list__data loa-list__data--number",
    },
    enableSorting: false,
    enableColumnActions: false,
  },
  {
    accessorFn: (originalRow) => {
      return toLocal(originalRow.startDate, DATE_FORMATS.DATEONLY_SLASH, true);
    },
    id: "startDate",
    header: "Start Date",
    muiTableHeadCellProps: {
      className:
        "loa-list__header loa-list__header--start",
    },
    muiTableBodyCellProps: {
      className:
        "loa-list__data loa-list__data--start",
    },
    enableSorting: false,
    enableColumnActions: false,
  },
  {
    accessorFn: (originalRow) =>
      applyWhenNotNullable(
        (expiryDate) => toLocal(expiryDate, DATE_FORMATS.DATEONLY_SLASH, true),
        originalRow.expiryDate,
        "Never expires",
      ) as string,
    id: "expiryDate",
    header: "Expiry Date",
    muiTableHeadCellProps: {
      className:
        "loa-list__header loa-list__header--expiry",
    },
    muiTableBodyCellProps: {
      className:
        "loa-list__data loa-list__data--expiry",
    },
    enableSorting: false,
    enableColumnActions: false,
  },
  {
    Cell: (
      props: { row: MRT_Row<LOADetail> },
    ) => (
      <LOADownloadCell
        onDownload={onDownload}
        props={props}
      />
    ),
    header: "",
    muiTableHeadCellProps: {
      className:
        "loa-list__header loa-list__header--download",
    },
    muiTableBodyCellProps: {
      className:
        "loa-list__data loa-list__data--download",
    },
    accessorKey: "documentId",
    enableSorting: false,
    enableColumnActions: false,
  },
];
