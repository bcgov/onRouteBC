import { useCallback } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import {
  MRT_Row,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import "./LOAList.scss";
import { LOADetail } from "../../../../types/LOADetail";
import { LOAListColumnDef } from "./LOAListColumnDef";
import {
  defaultTableInitialStateOptions,
  defaultTableOptions,
  defaultTableStateOptions,
} from "../../../../../../common/helpers/tableHelper";

export const LOAList = ({
  loas,
  isActive,
  allowEditLOA,
  onEdit,
  onDelete,
  onDownload,
}: {
  loas: LOADetail[];
  isActive: boolean;
  allowEditLOA: boolean;
  onEdit: (loaId: number) => void;
  onDelete?: (loaId: number) => void;
  onDownload: (loaId: number) => void;
}) => {
  const handleEditLOA = (loaId: number) => {
    if (!allowEditLOA) return;
    onEdit(loaId);
  };

  const columns = LOAListColumnDef(allowEditLOA, handleEditLOA, onDownload);

  const table = useMaterialReactTable({
    ...defaultTableOptions,
    columns,
    data: loas,
    enableRowActions: isActive,
    renderRowActions: useCallback(
      ({
        row,
      }: {
        row: MRT_Row<LOADetail>;
      }) => isActive && allowEditLOA ? (
        <div className="loa-list__row-actions">
          <Tooltip arrow placement="top" title="Delete">
            <IconButton
              classes={{
                root: "loa-list__delete-btn",
              }}
              onClick={() => {
                if (!isActive) return;
                onDelete?.(row.original.loaId);
              }}
              disabled={false}
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </IconButton>
          </Tooltip>
        </div>
      ) : null,
      [isActive, allowEditLOA],
    ),
    enableGlobalFilter: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableRowSelection: false,
    initialState: {
      ...defaultTableInitialStateOptions,
      showGlobalFilter: false,
    },
    state: {
      ...defaultTableStateOptions,
    },
    muiTablePaperProps: {
      className: "loa-list",
    },
    muiTableContainerProps: {
      className: "loa-list__table",
    },
  });

  return <MaterialReactTable table={table} />;
};
