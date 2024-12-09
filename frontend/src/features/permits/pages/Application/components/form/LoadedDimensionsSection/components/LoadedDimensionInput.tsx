import { Controller } from "react-hook-form";

import { NumberInput } from "../../../../../../../../common/components/form/subFormComponents/NumberInput";
import { getDefaultRequiredVal } from "../../../../../../../../common/helpers/util";
import { convertToNumberIfValid } from "../../../../../../../../common/helpers/numeric/convertToNumberIfValid";
import { Nullable, RequiredOrNull } from "../../../../../../../../common/types/common";
import {
  mustBeGreaterThanOrEqualTo,
  requiredMessage,
} from "../../../../../../../../common/helpers/validationMessages";

export const LoadedDimensionInput = ({
  name,
  label,
  className,
  value,
  onUpdateValue,
}: {
  name: string;
  label: {
    id: string;
    component: React.ReactNode;
  };
  className: string;
  value?: Nullable<number>;
  onUpdateValue: (updateValue: RequiredOrNull<number>) => void;
}) => {
  return (
    <Controller
      name={name}
      rules={{
        required: { value: true, message: requiredMessage() },
        min: { value: 0.01, message: mustBeGreaterThanOrEqualTo(0.01) },
      }}
      render={({ fieldState: {error} }) => (
        <NumberInput
          label={label}
          classes={{
            root: className,
          }}
          inputProps={{
            value: getDefaultRequiredVal(null, value),
            maskFn: (numericVal) => numericVal.toFixed(2),
            onBlur: (e) => {
              onUpdateValue(
                getDefaultRequiredVal(
                  null,
                  convertToNumberIfValid(e.target.value, null),
                ),
              );
            },
            slotProps: {
              input: {
                min: 0,
                step: 0.01,
              },
            },
          }}
          helperText={error?.message ? {
            errors: [error.message],
          } : undefined}
        />
      )}
    />
  );
};
