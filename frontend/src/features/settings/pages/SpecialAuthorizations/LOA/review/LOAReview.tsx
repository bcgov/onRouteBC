import { useFormContext } from "react-hook-form";

import "./LOAReview.scss";
import { LOAFormData } from "../../../../types/LOAFormData";
import { DATE_FORMATS, dayjsToLocalStr } from "../../../../../../common/helpers/formatDate";
import { applyWhenNotNullable } from "../../../../../../common/helpers/util";

export const LOAReview = () => {
  const { getValues } = useFormContext<LOAFormData>();
  const formData = getValues();

  const selectedPermitTypes =
    Object.entries(formData.permitTypes)
      .filter(permitTypeSelection => permitTypeSelection[1])
      .map(([permitType]) => permitType);

  const startDate = dayjsToLocalStr(
    formData.startDate,
    DATE_FORMATS.DATEONLY_SLASH,
  );

  const expiryDate = applyWhenNotNullable(
    (expiry) => dayjsToLocalStr(expiry, DATE_FORMATS.DATEONLY_SLASH),
    formData.expiryDate,
    "LOA never expires",
  );

  const fileName = applyWhenNotNullable(
    (file) => {
      if (file instanceof File) return file.name;
      return file.fileName;
    },
    formData.uploadFile,
    ""
  );

  const selectedVehicles = [
    ...formData.selectedPowerUnits,
    ...formData.selectedTrailers,
  ];

  return (
    <div className="loa-review">
      <div className="loa-review__section loa-review__section--permit-types">
        <div className="loa-review__header">Permit Type(s)</div>
        <div className="loa-review__data">
          {selectedPermitTypes.join(",")}
        </div>
      </div>

      <div className="loa-review__section loa-review__section--start">
        <div className="loa-review__header">Start Date</div>
        <div className="loa-review__data">
          {startDate}
        </div>
      </div>

      <div className="loa-review__section loa-review__section--expiry">
        <div className="loa-review__header">Expiry Date</div>
        <div className="loa-review__data">
          {expiryDate}
        </div>
      </div>

      <div className="loa-review__section loa-review__section--loa">
        <div className="loa-review__header">LOA</div>
        <div className="loa-review__data">
          {fileName}
        </div>
      </div>

      {formData.additionalNotes ? (
        <div className="loa-review__section loa-review__section--notes">
          <div className="loa-review__header">Additional Notes</div>
          <div className="loa-review__data">
            {formData.additionalNotes}
          </div>
        </div>
      ) : null}

      {selectedVehicles.length > 0 ? (
        <div className="loa-review__section loa-review__section--vehicles">
          <div className="loa-review__header">Designated Vehicle(s)</div>
        </div>
      ) : null}
    </div>
  );
};
