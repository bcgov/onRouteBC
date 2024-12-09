import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import "./SelectedVehicleSubtypeList.scss";

export const SelectedVehicleSubtypeList = ({
  selectedSubtypesDisplay,
}: {
  selectedSubtypesDisplay: string[];
}) => {
  return (
    <TableContainer
      className="selected-vehicle-subtype-list"
    >
      <Table
        className="selected-vehicle-subtype-list__table"
        aria-label="simple table"
      >
        <TableHead>
          <TableRow>
            <TableCell className="selected-vehicle-subtype-list__header">
              Vehicle Sub-type
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {selectedSubtypesDisplay.map((subtype) => (
            <TableRow
              key={subtype}
              className="selected-vehicle-subtype-list__row"
            >
              <TableCell
                className="selected-vehicle-subtype-list__cell"
                component="td"
                scope="row"
              >
                {subtype}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
