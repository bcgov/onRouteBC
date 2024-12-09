import { Box } from "@mui/material";

import "./PermitForm.scss";
import { FormActions } from "./FormActions";
import { ApplicationDetails } from "../../../../components/form/ApplicationDetails";
import { ContactDetails } from "../../../../components/form/ContactDetails";
import { PermitDetails } from "./PermitDetails";
import { VehicleInformationSection } from "./VehicleInformationSection/VehicleInformationSection";
import { PermitLOASection } from "./PermitLOASection";
import { useApplicationFormContext } from "../../../../hooks/form/useApplicationFormContext";
import { AmendReason } from "../../../Amend/components/form/AmendReason";
import { AmendRevisionHistory } from "../../../Amend/components/form/AmendRevisionHistory";
import { CommodityDetailsSection } from "./CommodityDetailsSection/CommodityDetailsSection";
import { ApplicationNotesSection } from "./ApplicationNotesSection";
import { TripDetailsSection } from "./TripDetailsSection/TripDetailsSection";
import { LoadedDimensionsSection } from "./LoadedDimensionsSection/LoadedDimensionsSection";

export const PermitForm = () => {
  const {
    permitType,
    applicationNumber,
    permitNumber,
    startDate,
    expiryDate,
    currentSelectedLOAs,
    vehicleFormData,
    allConditions,
    availableDurationOptions,
    filteredVehicleOptions,
    subtypeOptions,
    isSelectedLOAVehicle,
    feature,
    companyInfo,
    isAmendAction,
    createdDateTime,
    updatedDateTime,
    pastStartDateStatus,
    companyLOAs,
    revisionHistory,
    commodityOptions,
    highwaySequence,
    nextAllowedSubtypes,
    powerUnitSubtypeNamesMap,
    trailerSubtypeNamesMap,
    selectedVehicleConfigSubtypes,
    commodityType,
    vehicleConfiguration,
    onLeave,
    onSave,
    onCancel,
    onContinue,
    onSetConditions,
    onToggleSaveVehicle,
    onSetVehicle,
    onClearVehicle,
    onUpdateLOAs,
    onUpdateHighwaySequence,
    onUpdateVehicleConfigTrailers,
    onChangeCommodityType,
    onUpdateVehicleConfig,
  } = useApplicationFormContext();

  return (
    <Box className="permit-form layout-box">
      <Box className="permit-form__form">
        <ApplicationDetails
          permitType={permitType}
          infoNumber={
            isAmendAction ? permitNumber : applicationNumber
          }
          infoNumberType={isAmendAction ? "permit" : "application"}
          createdDateTime={createdDateTime}
          updatedDateTime={updatedDateTime}
          companyInfo={companyInfo}
          isAmendAction={isAmendAction}
          doingBusinessAs={companyInfo?.alternateName}
        />

        <ContactDetails feature={feature} />

        <PermitLOASection
          permitType={permitType}
          startDate={startDate}
          selectedLOAs={currentSelectedLOAs}
          companyLOAs={companyLOAs}
          onUpdateLOAs={onUpdateLOAs}
        />

        <PermitDetails
          feature={feature}
          expiryDate={expiryDate}
          allConditions={allConditions}
          durationOptions={availableDurationOptions}
          disableStartDate={isAmendAction}
          pastStartDateStatus={pastStartDateStatus}
          onSetConditions={onSetConditions}
        />

        <CommodityDetailsSection
          feature={feature}
          permitType={permitType}
          commodityOptions={commodityOptions}
          selectedCommodityType={commodityType}
          onChangeCommodityType={onChangeCommodityType}
        />
        
        <VehicleInformationSection
          permitType={permitType}
          feature={feature}
          vehicleFormData={vehicleFormData}
          vehicleOptions={filteredVehicleOptions}
          subtypeOptions={subtypeOptions}
          isSelectedLOAVehicle={isSelectedLOAVehicle}
          nextAllowedSubtypes={nextAllowedSubtypes}
          powerUnitSubtypeNamesMap={powerUnitSubtypeNamesMap}
          trailerSubtypeNamesMap={trailerSubtypeNamesMap}
          selectedConfigSubtypes={selectedVehicleConfigSubtypes}
          onSetSaveVehicle={onToggleSaveVehicle}
          onSetVehicle={onSetVehicle}
          onClearVehicle={onClearVehicle}
          onUpdateVehicleConfigTrailers={onUpdateVehicleConfigTrailers}
        />

        <LoadedDimensionsSection
          permitType={permitType}
          feature={feature}
          vehicleConfiguration={vehicleConfiguration}
          onUpdateVehicleConfiguration={onUpdateVehicleConfig}
        />

        <TripDetailsSection
          feature={feature}
          permitType={permitType}
          highwaySequence={highwaySequence}
          onUpdateHighwaySequence={onUpdateHighwaySequence}
        />

        <ApplicationNotesSection
          feature={feature}
          permitType={permitType}
        />

        {isAmendAction ? (
          <>
            <AmendRevisionHistory revisionHistory={revisionHistory} />
            <AmendReason feature={feature} />
          </>
        ) : null}
      </Box>

      <FormActions
        onLeave={onLeave}
        onSave={onSave}
        onCancel={onCancel}
        onContinue={onContinue}
      />
    </Box>
  );
};
