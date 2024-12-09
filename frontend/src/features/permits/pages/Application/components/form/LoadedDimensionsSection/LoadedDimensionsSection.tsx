import { Box } from "@mui/material";

import "./LoadedDimensionsSection.scss";
import { PERMIT_TYPES, PermitType } from "../../../../../types/PermitType";
import { Nullable, RequiredOrNull } from "../../../../../../../common/types/common";
import { PermitVehicleConfiguration } from "../../../../../types/PermitVehicleConfiguration";
import { LoadedDimensionInput } from "./components/LoadedDimensionInput";

export const LoadedDimensionsSection = ({
  permitType,
  feature,
  vehicleConfiguration,
  onUpdateVehicleConfiguration,
}: {
  permitType: PermitType;
  feature: string;
  vehicleConfiguration?: Nullable<PermitVehicleConfiguration>;
  onUpdateVehicleConfiguration:
    (updatedVehicleConfig: RequiredOrNull<PermitVehicleConfiguration>) => void;
}) => {
  return permitType === PERMIT_TYPES.STOS ? (
    <Box className="loaded-dimensions-section">
      <Box className="loaded-dimensions-section__header">
        <h3 className="loaded-dimensions-section__title">
          Loaded Dimensions (Metres)
        </h3>
      </Box>

      <Box className="loaded-dimensions-section__body">
        <div className="loaded-dimensions-section__input-row loaded-dimensions-section__input-row--first">
          <LoadedDimensionInput
            name="permitData.vehicleConfiguration.overallWidth"
            label={{
              id: `${feature}-overall-width-label`,
              component: "Overall Width",
            }}
            className="loaded-dimensions-section__input loaded-dimensions-section__input--first"
            value={vehicleConfiguration?.overallWidth}
            onUpdateValue={(updatedValue) => onUpdateVehicleConfiguration({
              ...vehicleConfiguration,
              overallWidth: updatedValue,
            })}
          />

          <LoadedDimensionInput
            name="permitData.vehicleConfiguration.overallHeight"
            label={{
              id: `${feature}-overall-height-label`,
              component: "Overall Height",
            }}
            className="loaded-dimensions-section__input"
            value={vehicleConfiguration?.overallHeight}
            onUpdateValue={(updatedValue) => onUpdateVehicleConfiguration({
              ...vehicleConfiguration,
              overallHeight: updatedValue,
            })}
          />

          <LoadedDimensionInput
            name="permitData.vehicleConfiguration.overallLength"
            label={{
              id: `${feature}-overall-length-label`,
              component: "Overall Length",
            }}
            className="loaded-dimensions-section__input"
            value={vehicleConfiguration?.overallLength}
            onUpdateValue={(updatedValue) => onUpdateVehicleConfiguration({
              ...vehicleConfiguration,
              overallLength: updatedValue,
            })}
          />
        </div>

        <div className="loaded-dimensions-section__input-row">
          <LoadedDimensionInput
            name="permitData.vehicleConfiguration.frontProjection"
            label={{
              id: `${feature}-front-projection-label`,
              component: "Front Projection",
            }}
            className="loaded-dimensions-section__input loaded-dimensions-section__input--first"
            value={vehicleConfiguration?.frontProjection}
            onUpdateValue={(updatedValue) => onUpdateVehicleConfiguration({
              ...vehicleConfiguration,
              frontProjection: updatedValue,
            })}
          />

          <LoadedDimensionInput
            name="permitData.vehicleConfiguration.rearProjection"
            label={{
              id: `${feature}-rear-projection-label`,
              component: "Rear Projection",
            }}
            className="loaded-dimensions-section__input"
            value={vehicleConfiguration?.rearProjection}
            onUpdateValue={(updatedValue) => onUpdateVehicleConfiguration({
              ...vehicleConfiguration,
              rearProjection: updatedValue,
            })}
          />
        </div>
      </Box>
    </Box>
  ) : null;
};
