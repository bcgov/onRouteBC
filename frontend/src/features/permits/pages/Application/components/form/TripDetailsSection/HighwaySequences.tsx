import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Button, FormControl, FormLabel } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import "./HighwaySequences.scss";
import { InfoBcGovBanner } from "../../../../../../../common/components/banners/InfoBcGovBanner";
import { CustomExternalLink } from "../../../../../../../common/components/links/CustomExternalLink";
import { BANNER_MESSAGES } from "../../../../../../../common/constants/bannerMessages";
import { ONROUTE_WEBPAGE_LINKS } from "../../../../../../../routes/constants";
import { requiredHighway } from "../../../../../../../common/helpers/validationMessages";
import { ApplicationFormData } from "../../../../../types/application";
import { HighwayNumberInput } from "./components/HighwayNumberInput";

const toHighwayRows = (highwaySequence: string[]) => {
  return [
    highwaySequence.slice(0, 8),
    highwaySequence.slice(8, 16),
    highwaySequence.slice(16, 24),
    highwaySequence.slice(24, 32),
  ].filter((row, index) => index === 0 || row.length > 0)
  .map(row => {
    if (row.length === 8) return row;
    
    // The row has less than 8 highway numbers, pad the rest with empty strings
    return [...row, ...(new Array<string>(8 - row.length).fill(""))];
  });
};

const highwaySequenceRules =  {
  validate: {
    requiredHighwaySequence: (
      value: string[],
    ) => {
      return (
        (
          value.length > 0 &&
          value.some(highwayNumber => Boolean(highwayNumber.trim()))
        ) ||
        requiredHighway()
      )
    },
  },
};

export const HighwaySequences = ({
  highwaySequence,
  onUpdateHighwaySequence,
}: {
  highwaySequence: string[];
  onUpdateHighwaySequence: (highwaySequence: string[]) => void;
}) => {
  const highwayRows = useMemo(() => toHighwayRows(highwaySequence), [
    highwaySequence,
  ]);

  const maxHighwayRowsReached = highwayRows.length === 4;

  const handleAddHighwayRow = () => {
    if (maxHighwayRowsReached) return;

    onUpdateHighwaySequence([
      ...highwayRows.flat(),
      ...(new Array<string>(8).fill("")),
    ]);
  };

  const {
    control,
    formState: { errors },
    trigger,
  } = useFormContext<ApplicationFormData>();

  const handleHighwayInput = (
    updatedHighwayNumber: string,
    rowIndex: number,
    colIndex: number,
  ) => {
    const indexToUpdate = rowIndex * 8 + colIndex;
    onUpdateHighwaySequence(
      highwayRows.flat().map((highwayNumber, index) =>
        indexToUpdate === index ? updatedHighwayNumber : highwayNumber)
    );
    trigger("permitData.permittedRoute.manualRoute.highwaySequence");
  };

  return (
    <div className="highway-sequences">
      <h4 className="highway-sequences__label">
        Sequence of highways to be travelled
      </h4>

      <InfoBcGovBanner
        className="highway-sequences__info"
        msg={BANNER_MESSAGES.HIGHWAY_SEQUENCES.TITLE}
        additionalInfo={
          <div className="highway-sequences-info">
            <p className="highway-sequences-info__example">
              {BANNER_MESSAGES.HIGHWAY_SEQUENCES.EXAMPLE}
            </p>

            <div className="highway-sequences-info__links">
              Please refer to the
              <CustomExternalLink
                className="highways-link"
                href={ONROUTE_WEBPAGE_LINKS.LIST_OF_BC_HIGHWAYS}
                openInNewTab={true}
                withLinkIcon={true}
              >
                <span className="highways-link__title">
                  List of Highways in British Columbia
                </span>
              </CustomExternalLink>
              and the
              <CustomExternalLink
                className="highways-link"
                href={ONROUTE_WEBPAGE_LINKS.HEIGHT_CLEARANCE_TOOL}
                openInNewTab={true}
                withLinkIcon={true}
              >
                <span className="highways-link__title">
                  Height Clearance Tool
                </span>
              </CustomExternalLink>
              to build your sequence.
            </div>
          </div>
        }
      />

      <div className="highway-sequences__inputs">
        <Controller
          name="permitData.permittedRoute.manualRoute.highwaySequence"
          control={control}
          rules={highwaySequenceRules}
          render={({
            fieldState: { invalid },
          }) => (
            <div className="highway-sequence-rows">
              {highwayRows.map((highwayRow, rowIndex) => (
                <div
                  key={`sequences-${rowIndex * 8 + 1}-${(rowIndex + 1) * 8}`}
                  className={`highway-sequence-rows__row ${rowIndex === 0 ? "highway-sequence-rows__row--first" : ""}`}
                >
                  {highwayRow.map((highwayNumber, colIndex) => (
                    <FormControl
                      key={`sequence-${rowIndex * 8 + colIndex + 1}`}
                      className="highway-sequence-rows__cell highway-number-form-control"
                      margin="normal"
                      error={invalid}
                    >
                      <FormLabel
                        className="highway-number-form-control__label"
                      >
                        {rowIndex * 8 + colIndex + 1}
                      </FormLabel>
                      
                      <HighwayNumberInput
                        className="highway-number-form-control__input"
                        highwayNumber={highwayNumber}
                        onHighwayInputChange={handleHighwayInput}
                        rowIndex={rowIndex}
                        colIndex={colIndex}
                      />
                    </FormControl>
                  ))}
                </div>
              ))}

              {errors.permitData?.permittedRoute?.manualRoute?.highwaySequence ? (
                <div className="highway-sequence-rows__error">
                  {errors.permitData.permittedRoute.manualRoute.highwaySequence.message}
                </div>
              ) : null}
            </div>
          )}
        />

        {!maxHighwayRowsReached ? (
          <Button
            className="add-highways-row-btn"
            key="add-highways-row-button"
            aria-label="Add Highways"
            variant="contained"
            color="tertiary"
            onClick={handleAddHighwayRow}
          >
            <FontAwesomeIcon className="add-highways-row-btn__icon" icon={faPlus} />
            Add Highways
          </Button>
        ) : null}
      </div>
    </div>
  );
};
