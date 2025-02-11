import { useState } from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import "./BridgeFormulaCalculationTool.scss";
import { NumberInput } from "../../../common/components/form/subFormComponents/NumberInput";
import { RequiredOrNull } from "../../../common/types/common";
import { getDefaultRequiredVal } from "../../../common/helpers/util";
import { convertToNumberIfValid } from "../../../common/helpers/numeric/convertToNumberIfValid";
import { RemoveAxleUnitModal } from "./RemoveAxleUnitModal";
import { ResetModal } from "./ResetModal";
import { usePolicyEngine } from "../../policy/hooks/usePolicyEngine";

interface AxleUnit {
  numberOfAxles?: RequiredOrNull<number>;
  axleSpread?: RequiredOrNull<number>;
  interaxleSpacing?: RequiredOrNull<number>;
  axleUnitWeight?: RequiredOrNull<number>;
  numberOfTires?: RequiredOrNull<number>;
  tireSize?: RequiredOrNull<number>;
}

// the type expected by the caculateBridge function in the policy engine
interface AxleConfiguration {
  numberOfAxles: number;
  axleSpread?: number;
  interaxleSpacing?: number;
  axleUnitWeight: number;
  numberOfTires?: number;
  tireSize?: number;
}

interface BridgeCalculationResult {
  startAxleUnit: number;
  endAxleUnit: number;
  maxBridge: number;
  actualWeight: number;
  success: boolean;
}

export const BridgeFormulaCalculationTool = () => {
  const policy = usePolicyEngine();

  const { control, handleSubmit, watch, setValue, reset, formState } = useForm<{
    axleUnits: AxleUnit[];
  }>({
    defaultValues: {
      axleUnits: [
        {
          numberOfAxles: null,
          axleSpread: null,
          axleUnitWeight: null,
        },
        {
          interaxleSpacing: null,
        },
        {
          numberOfAxles: null,
          axleSpread: null,
          axleUnitWeight: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "axleUnits",
  });

  const axleUnits = watch("axleUnits");

  const handleAddAxleUnit = () => {
    append({
      interaxleSpacing: null,
    });
    append({
      numberOfAxles: null,
      axleSpread: null,
      axleUnitWeight: null,
    });
  };

  const [isRemoveAxleUnitModalOpen, setIsRemoveAxleUnitModalOpen] =
    useState<boolean>(false);

  const [axleUnitsToRemove, setAxleUnitsToRemove] = useState<number[]>();

  const handleRemoveAxleUnits = () => {
    remove(axleUnitsToRemove);
    setIsRemoveAxleUnitModalOpen(false);
  };

  const handleCloseRemoveAxleUnitModal = () => {
    setAxleUnitsToRemove([]);
    setIsRemoveAxleUnitModalOpen(false);
  };

  const handleRemoveAxleUnitButton = (index: number) => {
    setAxleUnitsToRemove([index, index - 1]);
    setIsRemoveAxleUnitModalOpen(true);
  };

  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  const handleReset = () => {
    reset();
    setBridgeCalculationResults([]);
    setIsResetModalOpen(false);
  };

  const [bridgeCalculationResults, setBridgeCalculationResults] = useState<
    BridgeCalculationResult[]
  >([]);

  const failedBridgeCalculationResults = bridgeCalculationResults.filter(
    (result) => !result.success,
  );

  const bridgeCalculationSuccess = bridgeCalculationResults.length
    ? bridgeCalculationResults.every((result) => result.success)
    : false;

  const shouldShowResultsSection =
    formState.errors.axleUnits?.length ||
    failedBridgeCalculationResults.length ||
    bridgeCalculationSuccess;

  const getFailedResultText = (failedResult: BridgeCalculationResult) =>
    `⮾ Bridge calculation failed between Axle Unit ${failedResult.startAxleUnit} and ${failedResult.endAxleUnit}, Axle Group Weight is ${failedResult.actualWeight}, Bridge Formula Weight max is ${failedResult.maxBridge}.`;

  const mergeInteraxleSpacingColumn = (axleUnits: AxleUnit[]) => {
    for (let i = 1; i < axleUnits.length - 1; i++) {
      axleUnits[i + 1].interaxleSpacing = axleUnits[i].interaxleSpacing;
      axleUnits.splice(i, 1);
    }
    return axleUnits;
  };

  const convertMetreValuesToCentimetres = (axleUnit: AxleUnit) => {
    return {
      ...axleUnit,
      axleSpread: axleUnit.axleSpread
        ? Math.round(axleUnit.axleSpread * 100)
        : axleUnit.axleSpread,
      interaxleSpacing: axleUnit.interaxleSpacing
        ? Math.round(axleUnit.interaxleSpacing * 100)
        : axleUnit.interaxleSpacing,
    };
  };

  const getDefaultAxleConfiguration = (
    axleUnit: AxleUnit,
  ): AxleConfiguration => {
    return {
      numberOfAxles: getDefaultRequiredVal(0, axleUnit.numberOfAxles),
      axleSpread: getDefaultRequiredVal(undefined, axleUnit.axleSpread),
      interaxleSpacing: getDefaultRequiredVal(
        undefined,
        axleUnit.interaxleSpacing,
      ),
      axleUnitWeight: getDefaultRequiredVal(0, axleUnit.axleUnitWeight),
    };
  };

  const onSubmit = (data: { axleUnits: AxleUnit[] }) => {
    const mergedAxleUnitData = mergeInteraxleSpacingColumn(data.axleUnits);

    const convertedAxleUnitData = mergedAxleUnitData.map((axleUnit) =>
      convertMetreValuesToCentimetres(axleUnit),
    );

    const serializedAxleUnitData = convertedAxleUnitData.map((axleUnit) =>
      getDefaultAxleConfiguration(axleUnit),
    );

    const bridgeCalculationResults = policy?.calculateBridge(
      serializedAxleUnitData,
    );

    bridgeCalculationResults &&
      setBridgeCalculationResults(bridgeCalculationResults);
  };

  return (
    <div className="bridge-formula-calculation-tool">
      <div className="table-container">
        <table className="table">
          <thead className="table__head">
            <tr>
              <th className="column__label">Axle Unit</th>
              {fields.map((field, index) => {
                const axleUnitNumber = Math.floor(index / 2) + 1;

                // Check if this axle unit fails based on failedBridgeCalculationResults
                const axleUnitFailure = failedBridgeCalculationResults.some(
                  (result) =>
                    axleUnitNumber >= result.startAxleUnit &&
                    axleUnitNumber <= result.endAxleUnit,
                );

                // Check if the spacing column (odd index) is between two failing axle units
                const spacingColumnFailure =
                  index % 2 === 1 &&
                  failedBridgeCalculationResults.some(
                    (result) =>
                      axleUnitNumber >= result.startAxleUnit &&
                      axleUnitNumber < result.endAxleUnit,
                  );

                if (index % 2 === 0) {
                  return (
                    <th
                      key={field.id}
                      className={`${
                        axleUnitFailure
                          ? "column__label column__label--fail"
                          : "column__label"
                      }`}
                    >
                      <div className="column-label__inner">
                        {axleUnitNumber}
                        {axleUnitNumber >= 3 && (
                          <Tooltip title="Remove">
                            <IconButton
                              onClick={() => handleRemoveAxleUnitButton(index)}
                              className="button--remove"
                              aria-label={`Remove axle unit ${axleUnitNumber}`}
                            >
                              <FontAwesomeIcon
                                icon={faMinus}
                                className="button-icon"
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    </th>
                  );
                } else {
                  return (
                    <th
                      key={field.id}
                      className={`${
                        spacingColumnFailure
                          ? "column__label column__label--fail"
                          : "column__label"
                      }`}
                    >
                      {/* Blank column for interaxleSpacing */}
                    </th>
                  );
                }
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="row__label">Number of Axles</td>
              {fields.map((field, index) => {
                const fieldName = `axleUnits.${index}.numberOfAxles` as const;
                const axleSpreadFieldName =
                  `axleUnits.${index}.axleSpread` as const;
                const numberOfAxles = axleUnits[index].numberOfAxles;

                return (
                  <td key={field.id} className="table__cell">
                    {index % 2 === 0 && (
                      <Controller
                        name={fieldName}
                        control={control}
                        rules={{
                          required: true,
                          min: 1,
                        }}
                        render={({ fieldState: { invalid } }) => (
                          <NumberInput
                            classes={{ root: "table__input-container" }}
                            inputProps={{
                              className: "table__input",
                              value: getDefaultRequiredVal(null, numberOfAxles),
                              onBlur: ({ target: { value } }) => {
                                const updatedNumberOfAxles =
                                  getDefaultRequiredVal(
                                    null,
                                    convertToNumberIfValid(value, null),
                                  );

                                setValue(fieldName, updatedNumberOfAxles);

                                if (updatedNumberOfAxles === 1) {
                                  setValue(axleSpreadFieldName, null);
                                }
                              },
                              maskFn: (numericVal) => numericVal.toFixed(0),
                              error: invalid,
                            }}
                          />
                        )}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="row__label">Axle Spread (m)</td>
              {fields.map((field, index) => {
                const fieldName = `axleUnits.${index}.axleSpread` as const;
                const axleSpread = axleUnits[index].axleSpread;
                const numberOfAxles = axleUnits[index].numberOfAxles;
                const disabled = numberOfAxles === 1;

                return (
                  <td key={field.id} className="table__cell">
                    {index % 2 === 0 && (
                      <Controller
                        name={fieldName}
                        control={control}
                        rules={{
                          required: !disabled && true,
                          min: 0.01,
                        }}
                        render={({ fieldState: { invalid } }) => (
                          <NumberInput
                            classes={{ root: "table__input-container" }}
                            inputProps={{
                              value: getDefaultRequiredVal(null, axleSpread),
                              onBlur: ({ target: { value } }) =>
                                setValue(
                                  fieldName,
                                  getDefaultRequiredVal(
                                    null,
                                    convertToNumberIfValid(value, null),
                                  ),
                                ),
                              maskFn: (numericVal) => numericVal.toFixed(2),
                              error: invalid,
                              readOnly: disabled,
                              disabled,
                            }}
                          />
                        )}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="row__label">Interaxle Spacing (m)</td>
              {fields.map((field, index) => {
                const fieldName =
                  `axleUnits.${index}.interaxleSpacing` as const;
                const interaxleSpacing = axleUnits[index].interaxleSpacing;

                return (
                  <td key={field.id} className="table__cell">
                    {index % 2 !== 0 && (
                      <Controller
                        name={fieldName}
                        control={control}
                        rules={{
                          required: true,
                          min: 0.01,
                        }}
                        render={({ fieldState: { invalid } }) => (
                          <NumberInput
                            classes={{ root: "table__input-container" }}
                            inputProps={{
                              value: getDefaultRequiredVal(
                                null,
                                interaxleSpacing,
                              ),
                              onBlur: ({ target: { value } }) =>
                                setValue(
                                  fieldName,
                                  getDefaultRequiredVal(
                                    null,
                                    convertToNumberIfValid(value, null),
                                  ),
                                ),
                              maskFn: (numericVal) => numericVal.toFixed(2),
                              error: invalid,
                            }}
                          />
                        )}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="row__label">Axle Unit Weight (kg)</td>
              {fields.map((field, index) => {
                const fieldName = `axleUnits.${index}.axleUnitWeight` as const;
                const axleUnitWeight = axleUnits[index].axleUnitWeight;

                return (
                  <td key={field.id} className="table__cell">
                    {index % 2 === 0 && (
                      <Controller
                        name={fieldName}
                        control={control}
                        rules={{
                          required: true,
                          min: 0.01,
                        }}
                        render={({ fieldState: { invalid } }) => (
                          <NumberInput
                            classes={{ root: "table__input-container" }}
                            inputProps={{
                              value: getDefaultRequiredVal(
                                null,
                                axleUnitWeight,
                              ),
                              onBlur: ({ target: { value } }) =>
                                setValue(
                                  fieldName,
                                  getDefaultRequiredVal(
                                    null,
                                    convertToNumberIfValid(value, null),
                                  ),
                                ),
                              maskFn: (numericVal) => numericVal.toFixed(0),
                              error: invalid,
                            }}
                          />
                        )}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
        <Button
          variant="outlined"
          onClick={handleAddAxleUnit}
          className="button button--add"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Axle Unit
        </Button>
      </div>
      <div className="button-container">
        <Button
          variant="contained"
          onClick={() => setIsResetModalOpen(true)}
          className="button button--reset"
        >
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          className="button button--submit"
        >
          Calculate
        </Button>
      </div>

      {shouldShowResultsSection && (
        <div className="results">
          <h2 className="results__heading">
            Bridge Formula Calculation Results
          </h2>

          {formState.errors.axleUnits?.length ? (
            <p className="result__text">Insufficient and/or invalid data.</p>
          ) : failedBridgeCalculationResults.length ? (
            failedBridgeCalculationResults.map((failedResult, index) => (
              <p key={index} className="results__text results__text--fail">
                {getFailedResultText(failedResult)}
              </p>
            ))
          ) : (
            <p className="results__text results__text--success">
              &#x2713; Bridge Calculation is ok.
            </p>
          )}
        </div>
      )}

      <RemoveAxleUnitModal
        isOpen={isRemoveAxleUnitModalOpen}
        onCancel={handleCloseRemoveAxleUnitModal}
        onConfirm={handleRemoveAxleUnits}
      />

      <ResetModal
        isOpen={isResetModalOpen}
        onCancel={() => setIsResetModalOpen(false)}
        onConfirm={handleReset}
      />
    </div>
  );
};
