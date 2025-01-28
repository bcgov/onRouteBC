import "./TripOriginDestination.scss";
import { CustomFormComponent } from "../../../../../../../common/components/form/CustomFormComponents";
import { invalidAddress, requiredMessage } from "../../../../../../../common/helpers/validationMessages";
import { PERMIT_TYPES, PermitType } from "../../../../../types/PermitType";
import { Nullable, RequiredOrNull } from "../../../../../../../common/types/common";
import { Controller } from "react-hook-form";
import { NumberInput } from "../../../../../../../common/components/form/subFormComponents/NumberInput";
import { getDefaultRequiredVal } from "../../../../../../../common/helpers/util";
import { convertToNumberIfValid } from "../../../../../../../common/helpers/numeric/convertToNumberIfValid";

export const TripOriginDestination = ({
  feature,
  permitType,
  totalDistance,
  onUpdateTotalDistance,
}: {
  feature: string;
  permitType: PermitType;
  totalDistance?: Nullable<number>;
  onUpdateTotalDistance: (updatedTotalDistance?: RequiredOrNull<number>) => void;
}) => {
  const showExitPointDistance = permitType === PERMIT_TYPES.MFP;

  const handleUpdateTotalDistance = (numericStr: string) => {
    const updatedTotalDistance = getDefaultRequiredVal(
      null,
      convertToNumberIfValid(numericStr, null),
    );

    onUpdateTotalDistance(updatedTotalDistance);
  };

  return (
    <div className="trip-origin-destination">
      <CustomFormComponent
        className="trip-origin-destination__input trip-origin-destination__input--origin"
        type="input"
        feature={feature}
        options={{
          name: "permitData.permittedRoute.manualRoute.origin",
          rules: {
            required: { value: true, message: invalidAddress() },
          },
          label: "Origin",
        }}
      />

      <CustomFormComponent
        className="trip-origin-destination__input"
        type="input"
        feature={feature}
        options={{
          name: "permitData.permittedRoute.manualRoute.destination",
          rules: {
            required: { value: true, message: invalidAddress() },
          },
          label: "Destination",
        }}
      />
      
      {showExitPointDistance ? (
        <CustomFormComponent
          className="trip-origin-destination__input"
          type="input"
          feature={feature}
          options={{
            name: "permitData.permittedRoute.manualRoute.exitPoint",
            rules: {
              required: false,
            },
            label: "Exit Point",
          }}
        />
      ) : null}

      {showExitPointDistance ? (
        <Controller
          name="permitData.permittedRoute.manualRoute.totalDistance"
          rules={{
            required: { value: true, message: requiredMessage() },
          }}
          render={({ fieldState: {error} }) => (
            <NumberInput
              label={{
                id: `${feature}-manual-route-total-distance-label`,
                component: "Total Distance (km)",
              }}
              classes={{
                root: "trip-origin-destination__input",
              }}
              inputProps={{
                value: getDefaultRequiredVal(null, totalDistance),
                maskFn: (numericVal) => numericVal.toFixed(2),
                onBlur: (e) => {
                  handleUpdateTotalDistance(e.target.value);
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
      ) : null}
    </div>
  );
};
