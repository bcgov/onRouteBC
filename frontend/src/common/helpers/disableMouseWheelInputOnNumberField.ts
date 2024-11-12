import React from "react";

// Prevent mouse wheel from changing the value on fields where inputType: "number"
export const disableMouseWheelInputOnNumberField = (
  event: React.FocusEvent<HTMLInputElement>,
) => {
  const { target } = event;

  const handleWheel = (event: WheelEvent) => event.preventDefault();

  target.addEventListener("wheel", handleWheel, {
    passive: false,
  });

  target.addEventListener("blur", () =>
    target.removeEventListener("wheel", handleWheel),
  );
};
