import "./TripOriginDestination.scss";
import { CustomFormComponent } from "../../../../../../../common/components/form/CustomFormComponents";
import { invalidAddress } from "../../../../../../../common/helpers/validationMessages";

export const TripOriginDestination = ({
  feature,
}: {
  feature: string;
}) => {
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
    </div>
  );
};
