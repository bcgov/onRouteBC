import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, DateValidationError } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { Box, FormControl, FormHelperText, FormLabel } from "@mui/material";
import { useState, useEffect } from "react";

import {
  FieldValues,
  FieldPath,
  useFormContext,
  useController,
  Controller,
  RegisterOptions,
} from "react-hook-form";

import "./CustomDatePicker.scss";
import {
  Nullable,
  ORBC_FormTypes,
  RequiredOrNull,
} from "../../../types/common";
import { getStartOfDate, now } from "../../../helpers/formatDate";
import { getErrorMessage } from "../CustomFormComponents";
import {
  invalidDate,
  invalidMaxStartDate,
  invalidPastStartDate,
  warnPastStartDate,
} from "../../../helpers/validationMessages";

export const PAST_START_DATE_STATUSES = {
  ALLOWED: "ALLOWED",
  WARNING: "WARNING",
  FAIL: "FAIL",
} as const;

export type PastStartDateStatus =
  (typeof PAST_START_DATE_STATUSES)[keyof typeof PAST_START_DATE_STATUSES];

// Properties of the onrouteBC customized Date Picker MUI component/
export interface CustomDatePickerProps<T extends FieldValues> {
  feature: string;
  name: FieldPath<T>;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  rules: RegisterOptions;
  label?: string;
  pastStartDateStatus: PastStartDateStatus;
  maxDaysInFuture?: number;
  onChangeOverride?: (value: Dayjs | null) => void;
}

// An onRouteBC customized MUI Date Picker component based
// on https://mui.com/x/react-date-pickers/date-picker/
export const CustomDatePicker = <T extends ORBC_FormTypes>({
  feature,
  name,
  disabled,
  readOnly,
  className,
  rules,
  label,
  pastStartDateStatus,
  maxDaysInFuture,
  onChangeOverride,
}: CustomDatePickerProps<T>): JSX.Element => {
  const {
    trigger,
    formState: { isSubmitted, errors },
    control,
  } = useFormContext();

  // If applicable, the user can only select a date that is up to
  // max number of days into the future of the current date
  const maxDate = maxDaysInFuture
    ? now().add(maxDaysInFuture, "day")
    : undefined;

  /**
   * DatePicker is tricky, because in theory, you have two components with event listeners.
   * I was able to register the date picker field to React Hook Forms by using the useController hook
   * instead of using {...register(props.name, props.rules)}
   * There may be a better solution.
   * Referenced: https://www.reddit.com/r/reactjs/comments/udzhh7/reacthookform_not_working_with_mui_datepicker/
   */
  const {
    field: { onChange, value, ref },
  } = useController({ name, control });

  /**
   * React Hook Forms was not registering the validation errors from MUI Date Picker.
   * Therefore, I had to manually set the React Hook Form validation error based on MUI's error
   * There may be a better solution.
   * Reference: https://mui.com/x/react-date-pickers/validation/#show-the-error
   */
  const [dateError, setDateError] =
    useState<RequiredOrNull<DateValidationError>>(null);

  const datePickerRules = {
    ...rules,
    validate: {
      ...rules.validate,
      disablePast: (value: Nullable<Dayjs>) => {
        return (
          pastStartDateStatus !== PAST_START_DATE_STATUSES.FAIL ||
          (dateError !== "disablePast" && dateError !== "minDate") ||
          !value ||
          value.isAfter(getStartOfDate(now())) ||
          value.isSame(getStartOfDate(now())) ||
          invalidPastStartDate()
        );
      },
      maxDate: (value: Nullable<Dayjs>) => {
        return (
          !maxDaysInFuture ||
          dateError !== "maxDate" ||
          !maxDate ||
          !value ||
          value.isBefore(getStartOfDate(maxDate)) ||
          value.isSame(getStartOfDate(maxDate)) ||
          invalidMaxStartDate(maxDaysInFuture)
        );
      },
      invalidDate: () => {
        return dateError !== "invalidDate" || invalidDate();
      },
    },
  };

  const handleDateChange = (value: Dayjs | null) => {
    if (!onChangeOverride) {
      onChange(value);
      trigger(name);
    } else {
      onChangeOverride(value);
    }
  };

  useEffect(() => {
    // Revalidate whenever the date picker error is updated (new error or no errors)
    trigger(name);
  }, [dateError]);

  const rulesViolationMessage = getErrorMessage(errors, name);
  const startDateWarningMessage =
    dayjs().isAfter(value, "day") &&
    pastStartDateStatus === PAST_START_DATE_STATUSES.WARNING
      ? warnPastStartDate()
      : null;

  return (
    <Box className={`custom-date-picker ${className ? className : ""}`}>
      <Controller
        key={`controller-${feature}-${name}`}
        name={name}
        control={control}
        rules={datePickerRules}
        render={({ fieldState: { invalid } }) => (
          <FormControl
            className="custom-date-picker__form-control"
            margin="normal"
            error={invalid}
          >
            <FormLabel
              className="custom-date-picker__label"
              id={`${feature}-${name}-label`}
            >
              {label}
            </FormLabel>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                className={`custom-date-picker__picker ${disabled ? "custom-date-picker__picker--disabled" : ""}`}
                key={`${feature}-date-picker`}
                ref={ref}
                value={value}
                disabled={disabled}
                readOnly={readOnly}
                onChange={(value) => handleDateChange(value)}
                disablePast={
                  pastStartDateStatus === PAST_START_DATE_STATUSES.FAIL
                }
                maxDate={maxDate}
                onError={(dateValidationError) =>
                  setDateError(dateValidationError)
                }
                slotProps={{
                  textField: {
                    inputProps: {
                      className: "custom-date-picker__input-container",
                    },
                  },
                }}
                // This onClose function fixes a bug where the Select component does not immediately
                // revalidate when selecting an option after an invalid form submission.
                // The validation needed to be triggered again manually
                onClose={async () => {
                  if (isSubmitted) {
                    const output = await trigger(name);
                    if (!output) {
                      trigger(name);
                    }
                  }
                }}
              />
            </LocalizationProvider>

            {rulesViolationMessage ? (
              <FormHelperText
                className="custom-date-picker__helper-text custom-date-picker__helper-text--error"
                data-testid={`custom-date-picker-${name}-error`}
                error
              >
                {rulesViolationMessage}
              </FormHelperText>
            ) : null}

            {startDateWarningMessage ? (
              <FormHelperText
                className="custom-date-picker__helper-text custom-date-picker__helper-text--warning"
                data-testid={`custom-date-picker-${name}-warning`}
              >
                {startDateWarningMessage}
              </FormHelperText>
            ) : null}
          </FormControl>
        )}
      />
    </Box>
  );
};
