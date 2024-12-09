import { Button } from "@mui/material";

import "./PowerUnitInfo.scss";
import { PermitVehicleDetails } from "../../../../../types/PermitVehicleDetails";
import { PowerUnitInfoDisplay } from "../../common/PowerUnitInfoDisplay";

export const PowerUnitInfo = ({
  powerUnitInfo,
  powerUnitSubtypeNamesMap,
  onRemovePowerUnit,
}: {
  powerUnitInfo: PermitVehicleDetails;
  powerUnitSubtypeNamesMap: Map<string, string>;
  onRemovePowerUnit: () => void,
}) => {
  return (
    <div className="power-unit-info">
      <h4 className="power-unit-info__title">Power Unit</h4>

      <PowerUnitInfoDisplay
        powerUnitInfo={powerUnitInfo}
        powerUnitSubtypeNamesMap={powerUnitSubtypeNamesMap}
      />

      <Button
        key="remove-power-unit-button"
        className="power-unit-info__remove-btn"
        aria-label="Remove"
        variant="contained"
        color="tertiary"
        onClick={onRemovePowerUnit}
        data-testid="remove-power-unit-button"
      >
        Remove
      </Button>
    </div>
  );
};
