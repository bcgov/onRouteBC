import { Box, MenuItem } from "@mui/material"
import { useCallback, useMemo, useState } from "react";

import "./CommodityDetailsSection.scss";
import { CustomFormComponent } from "../../../../../../../common/components/form/CustomFormComponents";
import { requiredMessage } from "../../../../../../../common/helpers/validationMessages";
import { PERMIT_TYPES, PermitType } from "../../../../../types/PermitType";
import { Autocomplete } from "../../../../../../../common/components/form/subFormComponents/Autocomplete";
import { Controller, useFormContext } from "react-hook-form";
import { Nullable } from "../../../../../../../common/types/common";
import { DEFAULT_COMMODITY_SELECT_OPTION, DEFAULT_COMMODITY_SELECT_VALUE } from "../../../../../constants/constants";
import { getDefaultRequiredVal } from "../../../../../../../common/helpers/util";
import { ApplicationFormData } from "../../../../../types/application";
import { ChangeCommodityTypeDialog } from "./ChangeCommodityTypeDialog";

export const CommodityDetailsSection = ({
  feature,
  permitType,
  commodityOptions,
  selectedCommodityType,
  onChangeCommodityType,
}: {
  feature: string;
  permitType: PermitType;
  commodityOptions: {
    value: string;
    label: string;
  }[];
  selectedCommodityType?: Nullable<string>;
  onChangeCommodityType: (commodityType: string) => void;
}) => {
  const [newCommodityType, setNewCommodityType] = useState<string | undefined>();

  const selectedCommodityOption = useMemo(() => {
    return getDefaultRequiredVal(
      DEFAULT_COMMODITY_SELECT_OPTION,
      commodityOptions.find(({ value }) => value === selectedCommodityType),
    );
  }, [selectedCommodityType, commodityOptions]);

  const { trigger } = useFormContext<ApplicationFormData>();

  const handleCloseDialog = () => {
    setNewCommodityType(undefined);
  };

  const handleConfirmChangeCommodityType = (updatedCommodityType: string) => {
    onChangeCommodityType(updatedCommodityType);
    setNewCommodityType(undefined);
    trigger("permitData.permittedCommodity.commodityType");
  };

  const handleCommodityTypeChange = useCallback((updatedCommodityType: string) => {
    if (selectedCommodityType === updatedCommodityType) return;

    if (selectedCommodityType !== DEFAULT_COMMODITY_SELECT_VALUE) {
      setNewCommodityType(updatedCommodityType);
      return;
    }

    handleConfirmChangeCommodityType(updatedCommodityType);
  }, [selectedCommodityType]);

  return permitType === PERMIT_TYPES.STOS ? (
    <Box className="commodity-details-section">
      <Box className="commodity-details-section__header">
        <h3>Commodity Details</h3>
      </Box>

      <Box className="commodity-details-section__body">
        <Controller
          name="permitData.permittedCommodity.commodityType"
          rules={{
            required: { value: true, message: requiredMessage() },
            validate: {
              mustSelect: (value) => value !== DEFAULT_COMMODITY_SELECT_VALUE || requiredMessage(),
            },
          }}
          render={({ fieldState: {error} }) => (
            <Autocomplete
              label={{
                id: "commodity-type-label",
                component: "Commodity Type",
              }}
              classes={{
                root: "commodity-details-section__input commodity-details-section__input--commodity-type",
              }}
              autocompleteProps={{
                options: commodityOptions,
                value: selectedCommodityOption,
                onChange: (_, value) => {
                  if (!value) {
                    handleCommodityTypeChange(DEFAULT_COMMODITY_SELECT_VALUE);
                  } else {
                    handleCommodityTypeChange(value.value);
                  }
                },
                renderOption: (props, option) => (
                  <MenuItem {...props} key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ),
                isOptionEqualToValue: (option, value) => option.value === value.value && option.label === value.label,
              }}
              helperText={error?.message ? {
                errors: [error.message],
              } : undefined}
            />
          )}
        />

        <CustomFormComponent
          type="input"
          feature={feature}
          className="commodity-details-section__input"
          options={{
            name: "permitData.permittedCommodity.loadDescription",
            rules: {
              required: { value: true, message: requiredMessage() },
            },
            label: "Load Description",
          }}
        />
      </Box>

      {newCommodityType ? (
        <ChangeCommodityTypeDialog
          newCommodityType={newCommodityType}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmChangeCommodityType}
        />
      ) : null}
    </Box>
  ) : null;
};
