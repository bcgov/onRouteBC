import { screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";

import { VEHICLE_TYPES, VehicleType } from "../../../../types/Vehicle";

export const clickSubmit = async (user: UserEvent) => {
  const submitButton = await screen.findByRole("button", {
    name: /Add To Inventory/i,
  });
  await user.click(submitButton);
};

export const unitNumberInput = async () => {
  return await screen.findByRole("textbox", {
    name: /unitNumber/i,
  });
};

export const makeInput = async () => {
  return await screen.findByRole("textbox", {
    name: /make/i,
  });
};

export const yearInput = async () => {
  return await screen.findByRole("spinbutton", {
    name: /year/i,
  });
};

export const vinInput = async () => {
  return await screen.findByRole("textbox", {
    name: /vin/i,
  });
};

export const plateInput = async () => {
  return await screen.findByRole("textbox", {
    name: /plate/i,
  });
};

export const trailerTypeCodeSelect = async () => {
  return await screen.findByTestId("select-trailerTypeCode");
};

export const powerUnitTypeCodeSelect = async () => {
  return await screen.findByTestId("select-powerUnitTypeCode");
};

export const countrySelect = async () => {
  return await screen.findByTestId("select-countryCode");
};

export const provinceSelect = async () => {
  return await screen.findByTestId("select-provinceCode");
};

export const emptyTrailerWidthInput = async () => {
  return await screen.findByRole("textbox", {
    name: /emptyTrailerWidth/i,
  });
};

export const licensedGvwInput = async () => {
  return await screen.findByRole("spinbutton", {
    name: /licensedGvw/i,
  });
};

export const steerAxleTireSizeInput = async () => {
  return await screen.findByRole("textbox", {
    name: /steerAxleTireSize/i,
  });
};

export const selectOptions = async () => {
  return await screen.findAllByRole("combobox");
};

export const actionButtons = async () => {
  return await screen.findAllByRole("button");
};

export const textInputs = async () => {
  return await screen.findAllByRole("textbox");
};

export const numericInputs = async () => {
  return await screen.findAllByRole("spinbutton");
};

export const vinErrorDisplay = async () => {
  return await screen.findByTestId("alert-vin");
};

export const replaceValueForInput = async (
  user: UserEvent,
  input: HTMLElement,
  offset: number,
  newVal: string,
) => {
  await user.click(input);
  await user.pointer([
    { target: input, offset: 0, keys: "[MouseLeft>]" },
    { offset },
  ]);
  await user.paste(newVal);
};

export const submitErrorsDisplay = async () => {
  return await screen.findByTestId("alert", { exact: false });
};

export const chooseOption = async (
  user: UserEvent,
  select: HTMLElement,
  optionText: string,
) => {
  await user.click(select);
  const option = await screen.findByText(optionText);
  await user.click(option);
};

export interface VehicleFormDetail {
  newUnitNumber: string;
  newMake: string;
  newYear: number;
  newVin: string;
  newPlate: string;
  newCountry: string;
  newProvince: string;
  newSubtype: string;
}

export interface PowerUnitDetail extends VehicleFormDetail {
  newGvw: number;
  newTireSize: string;
}

export const submitVehicleForm = async (
  user: UserEvent,
  vehicleType: VehicleType,
  details: VehicleFormDetail,
) => {
  const unitNumber = await unitNumberInput();
  const make = await makeInput();
  const year = await yearInput();
  const vin = await vinInput();
  const plate = await plateInput();
  const country = await countrySelect();
  const province = await provinceSelect();

  await replaceValueForInput(user, unitNumber, 0, details.newUnitNumber);
  await replaceValueForInput(user, make, 0, details.newMake);
  await replaceValueForInput(user, year, 4, `${details.newYear}`);
  await replaceValueForInput(user, vin, 0, details.newVin);
  await replaceValueForInput(user, plate, 0, details.newPlate);

  if (vehicleType === VEHICLE_TYPES.POWER_UNIT) {
    const powerUnitDetails = details as PowerUnitDetail;
    const licensedGvw = await licensedGvwInput();
    const steerAxleTireSize = await steerAxleTireSizeInput();
    const subtype = await powerUnitTypeCodeSelect();
    await replaceValueForInput(
      user,
      licensedGvw,
      1,
      `${powerUnitDetails.newGvw}`,
    );
    await replaceValueForInput(
      user,
      steerAxleTireSize,
      0,
      powerUnitDetails.newTireSize,
    );
    await chooseOption(user, subtype, details.newSubtype);
  } else {
    const subtype = await trailerTypeCodeSelect();
    await chooseOption(user, subtype, details.newSubtype);
  }
  await chooseOption(user, country, details.newCountry);
  await chooseOption(user, province, details.newProvince);
  await clickSubmit(user);
};
