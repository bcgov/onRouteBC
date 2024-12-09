import { Box, Typography } from "@mui/material";

import "./CommodityDetails.scss";
import { areValuesDifferent } from "../../../../../../common/helpers/equality";
import { Nullable } from "../../../../../../common/types/common";
import { PermittedCommodity } from "../../../../types/PermittedCommodity";
import { DiffChip } from "./DiffChip";
import { getDefaultRequiredVal } from "../../../../../../common/helpers/util";

export const CommodityDetails = ({
  commodity,
  oldCommodity,
  showChangedFields = false,
  commodityOptions,
}: {
  commodity?: Nullable<PermittedCommodity>;
  oldCommodity?: Nullable<PermittedCommodity>;
  showChangedFields?: boolean;
  commodityOptions: {
    label: string;
    value: string;
  }[];
}) => {
  const changedFields = showChangedFields
    ? {
        commodityType: areValuesDifferent(
          commodity?.commodityType,
          oldCommodity?.commodityType,
        ),
        loadDescription: areValuesDifferent(
          commodity?.loadDescription,
          oldCommodity?.loadDescription,
        ),
      }
    : {
        commodityType: false,
        loadDescription: false,
      };

  const commodityTypeDisplay = getDefaultRequiredVal(
    "",
    commodityOptions.find(({ value }) => value === commodity?.commodityType)?.label,
    commodity?.commodityType,
  );

  return commodity ? (
    <Box className="review-commodity-details">
      <Box className="review-commodity-details__header">
        <Typography variant={"h3"} className="review-commodity-details__title">
          Commodity Details
        </Typography>
      </Box>

      <Box className="review-commodity-details__body">
        <div className="commodity-info commodity-info--commodity-type">
          <Typography className="commodity-info__label">
            <span className="commodity-info__label-text">Commodity Type</span>

            {changedFields.commodityType ? <DiffChip /> : null}
          </Typography>

          <Typography
            className="commodity-info__data"
            data-testid="permit-commodity-type"
          >
            {commodityTypeDisplay}
          </Typography>
        </div>
        
        <div className="commodity-info commodity-info--load-description">
          <Typography className="commodity-info__label">
            <span className="commodity-info__label-text">Load Description</span>

            {changedFields.loadDescription ? <DiffChip /> : null}
          </Typography>

          <Typography
            className="commodity-info__data"
            data-testid="permit-load-description"
          >
            {commodity.loadDescription}
          </Typography>
        </div>
      </Box>
    </Box>
  ) : null;
};
