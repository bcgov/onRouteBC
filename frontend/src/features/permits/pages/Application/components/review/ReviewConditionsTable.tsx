import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
} from "@mui/material";

import "./ReviewConditionsTable.scss";
import { getDefaultRequiredVal } from "../../../../../../common/helpers/util";
import { CustomExternalLink } from "../../../../../../common/components/links/CustomExternalLink";
import { Nullable } from "../../../../../../common/types/common";
import { PermitCondition } from "../../../../types/PermitCondition";

export const ReviewConditionsTable = ({
  conditions,
}: {
  conditions?: Nullable<PermitCondition[]>;
}) => {
  const reviewConditions = getDefaultRequiredVal([], conditions);

  return (
    <TableContainer>
      <Table className="review-conditions-table" aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell
              className="review-conditions-table__header review-conditions-table__header--description"
            >
              Description
            </TableCell>

            <TableCell
              className="review-conditions-table__header review-conditions-table__header--link"
            >
              Conditions
            </TableCell>
          </TableRow>
        </TableHead>
        
        <TableBody>
          {reviewConditions.map((row: PermitCondition) => {
            return (
              <TableRow
                className="review-conditions-table__row"
                key={row.condition}
                data-testid="review-permit-condition"
              >
                <TableCell
                  component="td"
                  scope="row"
                  className="review-conditions-table__cell review-conditions-table__cell--description"
                >
                  <Checkbox
                    className="checkbox checkbox--readonly"
                    key={row.condition}
                    checked={true}
                    disabled={true}
                  />
                  <span data-testid="permit-condition-description">
                    {row.description}
                  </span>
                </TableCell>

                <TableCell
                  component="td"
                  scope="row"
                  className="review-conditions-table__cell review-conditions-table__cell--link"
                >
                  <CustomExternalLink
                    href={row.conditionLink}
                    className="condition-link"
                    data-testid="permit-condition-link"
                    withLinkIcon={true}
                  >
                    <span data-testid="permit-condition-code">
                      {row.condition}
                    </span>
                  </CustomExternalLink>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
