import { useEffect, useMemo } from "react";
import { Dayjs } from "dayjs";
import { Box } from "@mui/material";

import "./PermitLOASection.scss";
import { InfoBcGovBanner } from "../../../../../../common/components/banners/InfoBcGovBanner";
import { BANNER_MESSAGES } from "../../../../../../common/constants/bannerMessages";
import { LOADetail } from "../../../../../settings/types/LOADetail";
import { LOATable } from "./LOATable";
import { PermitType } from "../../../../types/PermitType";
import { getMinPermitExpiryDate } from "../../../../helpers/dateSelection";
import { getUpdatedLOASelection } from "../../../../helpers/permitLOA";
import { doUniqueArraysHaveSameItems } from "../../../../../../common/helpers/equality";
import { PermitLOA } from "../../../../types/PermitLOA";

export const PermitLOASection = ({
  permitType,
  startDate,
  selectedLOAs,
  companyLOAs,
  onUpdateLOAs,
}: {
  permitType: PermitType;
  startDate: Dayjs;
  selectedLOAs: PermitLOA[];
  companyLOAs: LOADetail[];
  onUpdateLOAs: (updatedLOAs: PermitLOA[]) => void,
}) => {
  const minPermitExpiryDate = getMinPermitExpiryDate(permitType, startDate);

  // Only show the current active company LOAs as selectable LOAs
  const loasForTable = useMemo(() => getUpdatedLOASelection(
    companyLOAs,
    selectedLOAs,
    minPermitExpiryDate,
  ), [
    companyLOAs,
    selectedLOAs,
    minPermitExpiryDate,
  ]);

  // Since certain LOAs might have been removed from the table, we need to make sure
  // that the selected LOAs in the permit form matches the selection state of the table
  const selectedLOAsInTable = loasForTable
    .filter(selectableLOA => selectableLOA.checked)
    .map(selectableLOA => selectableLOA.loa);

  const selectedLOANumbers = selectedLOAs.map(loa => loa.loaNumber);
  
  useEffect(() => {
    const selectedNumbersInTable = selectedLOAsInTable.map(loa => loa.loaNumber);
    if (!doUniqueArraysHaveSameItems(selectedLOANumbers, selectedNumbersInTable)) {
      onUpdateLOAs([...selectedLOAsInTable]);
    }
  }, [selectedLOANumbers, selectedLOAsInTable]);

  const handleSelectLOA = (loaNumber: number) => {
    const loa = loasForTable.find(loaRow => loaRow.loa.loaNumber === loaNumber);
    if (!loa || loa?.disabled) return;

    const isLOASelected = Boolean(loa?.checked);
    if (isLOASelected) {
      // Deselect the LOA
      onUpdateLOAs(
        selectedLOAs.filter(selectedLOA => selectedLOA.loaNumber !== loaNumber),
      );
    } else {
      // Select the LOA
      const { loa: loaToSelect } = loa;
      onUpdateLOAs([...selectedLOAs, loaToSelect]);
    }
  };

  return loasForTable.length > 0 ? (
    <Box className="permit-loa-section">
      <Box className="permit-loa-section__header">
        <h3>
          Letter of Authorization (LOA)
        </h3>
      </Box>

      <Box className="permit-loa-section__body">
        <div className="loa-title">
          <h4 className="loa-title__title">Select the relevant LOA(s)</h4>
          <span className="loa-title__title--optional">(optional)</span>
        </div>

        <InfoBcGovBanner
          className="loa-info"
          msg={BANNER_MESSAGES.FIND_LOA_DETAILS}
          additionalInfo={
            <div className="loa-info__message">
              {BANNER_MESSAGES.LOA_VEHICLE_CANNOT_BE_EDITED_IN_PERMIT}
            </div>
          }
        />

        <LOATable
          loas={loasForTable}
          onSelectLOA={handleSelectLOA}
        />
      </Box>
    </Box>
  ) : null;
};
