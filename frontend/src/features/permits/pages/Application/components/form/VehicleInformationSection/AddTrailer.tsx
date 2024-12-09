import { useContext, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
} from "@mui/material";

import "./AddTrailer.scss";
import { CustomSelectDisplayProps } from "../../../../../../../common/types/formElements";
import { useMemoizedArray } from "../../../../../../../common/hooks/useMemoizedArray";
import { VehicleInConfiguration } from "../../../../../types/PermitVehicleConfiguration";
import { getDefaultRequiredVal } from "../../../../../../../common/helpers/util";
import { ApplicationFormContext } from "../../../../../context/ApplicationFormContext";
import { SelectedVehicleSubtypeList } from "../../common/SelectedVehicleSubtypeList";

const DEFAULT_EMPTY_SUBTYPE = "-";

export const AddTrailer = ({
  selectedTrailerSubtypes,
  trailerSubtypeOptions,
  trailerSubtypeNamesMap,
  onUpdateVehicleConfigTrailers,
}: {
  selectedTrailerSubtypes: string[];
  trailerSubtypeOptions: {
    value: string;
    label: string;
  }[];
  trailerSubtypeNamesMap: Map<string, string>;
  onUpdateVehicleConfigTrailers: (updatedTrailerSubtypes: VehicleInConfiguration[]) => void;
}) => {
  const [trailerSelection, setTrailerSelection] = useState<string>(DEFAULT_EMPTY_SUBTYPE);

  const trailersFieldRef = "permitData.vehicleConfiguration.trailers";
  const { policyViolations, clearViolation } = useContext(ApplicationFormContext);

  const subtypeOptions = useMemoizedArray(
    [{ value: DEFAULT_EMPTY_SUBTYPE, label: "Select" }].concat(trailerSubtypeOptions),
    (option) => option.value,
    (option1, option2) => option1.value === option2.value && option1.label === option2.label,
  );

  const selectedSubtypesDisplay = useMemoizedArray(
    selectedTrailerSubtypes.map(subtype => {
      if (subtype === "NONEXXX") return "None";
      return getDefaultRequiredVal(
        subtype,
        trailerSubtypeNamesMap.get(subtype),
      );
    }),
    (selectedSubtype) => selectedSubtype,
    (subtype1, subtype2) => subtype1 === subtype2,
  );

  const handleAddTrailerSubtype = (subtype: string) => {
    if (subtype !== DEFAULT_EMPTY_SUBTYPE) {
      onUpdateVehicleConfigTrailers(selectedTrailerSubtypes.map(addedSubtype => ({
        vehicleSubType: addedSubtype,
      })).concat([{ vehicleSubType: subtype }]));

      setTrailerSelection(DEFAULT_EMPTY_SUBTYPE);
      clearViolation(trailersFieldRef);
    }
  };

  const handleResetTrailerConfig = () => {
    onUpdateVehicleConfigTrailers([]);
    clearViolation(trailersFieldRef);
  };

  return (selectedSubtypesDisplay.length > 0 || trailerSubtypeOptions.length > 0) ? (
    <div className="add-trailer">
      <h4 className="add-trailer__title">Add Trailer(s)</h4>

      {selectedSubtypesDisplay.length > 0 ? (
        <div className="add-trailer__trailer-list">
          <SelectedVehicleSubtypeList
            selectedSubtypesDisplay={selectedSubtypesDisplay}
          />

          <Button
            key="reset-trailer-config-button"
            className="add-trailer__reset-btn"
            aria-label="Reset Trailer Configuration"
            variant="contained"
            color="tertiary"
            onClick={handleResetTrailerConfig}
            data-testid="reset-trailer-config-button"
          >
            Reset Trailer Configuration
          </Button>
        </div>
      ) : null}

      {trailerSubtypeOptions.length > 0 ? (
        <FormControl
          className="add-trailer__input form-control"
          margin="normal"
        >
          <FormLabel
            id="add-trailer-form-control-label"
            classes={{
              root: "form-control__label",
              focused: "form-control__label--focused",
            }}
          >
            Add Trailer
          </FormLabel>

          <Select
            aria-labelledby={`add-trailer-form-control-label`}
            className={`form-control__select`}
            inputProps={{
              "aria-label": "Add Trailer",
            }}
            onChange={(e) => handleAddTrailerSubtype(e.target.value)}
            value={trailerSelection}
            MenuProps={{
              className: "form-control__menu",
              disablePortal: true,
            }}
            SelectDisplayProps={
              {
                "data-testid": `trailer-subtype-input-container`,
                className: "form-control__input-container",
              } as CustomSelectDisplayProps
            }
          >
            {subtypeOptions.map(({ value, label }) => (
              <MenuItem
                key={value}
                value={value}
                data-testid="add-trailer-menu-item"
              >
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}

      {trailersFieldRef in policyViolations ? (
        <p className="add-trailer__error">
          {policyViolations[trailersFieldRef]}
        </p>
      ) : null}
    </div>
  ) : null;
};
