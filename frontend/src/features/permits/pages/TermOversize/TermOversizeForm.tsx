import { FieldValues, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

import "./TermOversizeForm.scss";
import { Application, VehicleDetails } from "../../types/application.d";
import { ApplicationContext } from "../../context/ApplicationContext";
import { ApplicationBreadcrumb } from "../../components/application-breadcrumb/ApplicationBreadcrumb";
import { useSaveTermOversizeMutation } from "../../hooks/hooks";
import { SnackBarContext } from "../../../../App";
import { LeaveApplicationDialog } from "../../components/dialog/LeaveApplicationDialog";
import { areApplicationDataEqual } from "../../helpers/equality";
import { useDefaultApplicationFormData } from "../../hooks/useDefaultApplicationFormData";
import OnRouteBCContext from "../../../../common/authentication/OnRouteBCContext";
import { PermitForm } from "./components/form/PermitForm";
import { usePermitVehicleManagement } from "../../hooks/usePermitVehicleManagement";
import { useCompanyInfoQuery } from "../../../manageProfile/apiManager/hooks";
import { TROS_PERMIT_DURATIONS } from "../../constants/termOversizeConstants";
import { Nullable } from "../../../../common/types/common";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../../common/helpers/util";

import {
  APPLICATIONS_ROUTES,
  APPLICATION_STEPS,
  ERROR_ROUTES,
} from "../../../../routes/constants";

/**
 * The first step in creating and submitting a TROS Application.
 * @returns A form for users to create a Term Oversize Application
 */
export const TermOversizeForm = () => {
  // The name of this feature that is used for id's, keys, and associating form components
  const FEATURE = "term-oversize";

  // Context to hold all of the application data related to the TROS application
  const applicationContext = useContext(ApplicationContext);

  const { companyId, userDetails } = useContext(OnRouteBCContext);
  const companyInfoQuery = useCompanyInfoQuery();

  // Use a custom hook that performs the following whenever page is rendered (or when application context is updated/changed):
  // 1. Get all data needed to generate default values for the application form (from application context, company, user details)
  // 2. Generate those default values and register them to the form
  // 3. Listens for changes to application context (which happens when application is fetched/submitted/updated)
  // 4. Updates form default values when application context data values change
  const {
    defaultApplicationDataValues: termOversizeDefaultValues,
    formMethods,
  } = useDefaultApplicationFormData(
    applicationContext?.applicationData,
    companyId,
    userDetails,
    companyInfoQuery.data,
  );

  const companyInfo = companyInfoQuery.data;

  const submitTermOversizeMutation = useSaveTermOversizeMutation();
  const snackBar = useContext(SnackBarContext);
  const { companyLegalName, onRouteBCClientNumber } =
    useContext(OnRouteBCContext);

  const { handleSaveVehicle, vehicleOptions, powerUnitSubTypes, trailerSubTypes } =
    usePermitVehicleManagement(
      applyWhenNotNullable((companyIdNum) => `${companyIdNum}`, companyId, "0"),
    );

  // Show leave application dialog
  const [showLeaveApplicationDialog, setShowLeaveApplicationDialog] =
    useState<boolean>(false);

  const { handleSubmit, getValues } = formMethods;

  const navigate = useNavigate();

  // Helper method to return form field values as an Application object
  const applicationFormData = (data: FieldValues) => {
    return {
      ...data,
      applicationNumber: applicationContext.applicationData?.applicationNumber,
      permitData: {
        ...data.permitData,
        companyName: companyLegalName,
        clientNumber: onRouteBCClientNumber,
        vehicleDetails: {
          ...data.permitData.vehicleDetails,
          // Convert year to number here, as React doesn't accept valueAsNumber prop for input component
          year: !isNaN(Number(data.permitData.vehicleDetails.year))
            ? Number(data.permitData.vehicleDetails.year)
            : data.permitData.vehicleDetails.year,
        },
      },
    } as Application;
  };

  // Check to see if all application values were already saved
  const isApplicationSaved = () => {
    const currentFormData = applicationFormData(getValues());
    const savedData = applicationContext.applicationData;
    if (!savedData) return false;

    // Check if all current form field values match field values already saved in application context
    return areApplicationDataEqual(
      currentFormData.permitData,
      savedData.permitData,
    );
  };

  // When "Continue" button is clicked
  const onContinue = async (data: FieldValues) => {
    const termOverSizeToBeAdded = applicationFormData(data);
    const vehicleData = termOverSizeToBeAdded.permitData.vehicleDetails;
    const savedVehicleDetails = await handleSaveVehicle(vehicleData);

    // Save application before continuing
    await onSaveApplication((permitId) =>
      navigate(APPLICATIONS_ROUTES.REVIEW(permitId)),
      savedVehicleDetails,
    );
  };

  const isSaveTermOversizeSuccessful = (status: number) =>
    status === 200 || status === 201;

  const onSaveSuccess = (responseData: Application, status: number) => {
    snackBar.setSnackBar({
      showSnackbar: true,
      setShowSnackbar: () => true,
      message: `Application ${responseData.applicationNumber} ${
        status === 201 ? "created" : "updated"
      }.`,
      alertType: "success",
    });

    applicationContext.setApplicationData(responseData);
    return getDefaultRequiredVal("", responseData.permitId);
  };

  const onSaveFailure = () => {
    navigate(ERROR_ROUTES.UNEXPECTED);
  };

  // Whenever application is to be saved (either through "Save" or "Continue")
  const onSaveApplication = async (
    additionalSuccessAction?: (permitId: string) => void,
    savedVehicleInventoryDetails?: Nullable<VehicleDetails>,
  ) => {
    if (!savedVehicleInventoryDetails && typeof savedVehicleInventoryDetails !== "undefined") {
      // save vehicle to inventory failed (result is null), go to unexpected error page
      return onSaveFailure();
    }

    const formValues = getValues();
    const termOverSizeToBeAdded = applicationFormData(
      !savedVehicleInventoryDetails ?
      formValues :
      {
        ...formValues,
        permitData: {
          ...formValues.permitData,
          vehicleDetails: {
            ...savedVehicleInventoryDetails,
            saveVehicle: true,
          }
        },
      }
    );

    const response = await submitTermOversizeMutation.mutateAsync(
      termOverSizeToBeAdded,
    );

    if (isSaveTermOversizeSuccessful(response.status)) {
      const responseData = response.data;
      const savedPermitId = onSaveSuccess(
        responseData as Application,
        response.status,
      );
      additionalSuccessAction?.(savedPermitId);
    } else {
      onSaveFailure();
    }
  };

  const onSave = async () => {
    await onSaveApplication((permitId) =>
      navigate(APPLICATIONS_ROUTES.DETAILS(permitId)),
    );
  };

  // Whenever "Leave" button is clicked
  const handleLeaveApplication = () => {
    if (!isApplicationSaved()) {
      setShowLeaveApplicationDialog(true);
    } else {
      navigate(APPLICATIONS_ROUTES.BASE);
    }
  };

  const handleLeaveUnsaved = () => {
    navigate(APPLICATIONS_ROUTES.BASE);
  };

  const handleStayOnApplication = () => {
    setShowLeaveApplicationDialog(false);
  };

  return (
    <div className="application-form">
      <ApplicationBreadcrumb applicationStep={APPLICATION_STEPS.DETAILS} />

      <FormProvider {...formMethods}>
        <PermitForm
          feature={FEATURE}
          onLeave={handleLeaveApplication}
          onSave={onSave}
          onContinue={handleSubmit(onContinue)}
          isAmendAction={false}
          permitType={termOversizeDefaultValues.permitType}
          applicationNumber={termOversizeDefaultValues.applicationNumber}
          permitNumber={termOversizeDefaultValues.permitNumber}
          createdDateTime={termOversizeDefaultValues.createdDateTime}
          updatedDateTime={termOversizeDefaultValues.updatedDateTime}
          permitStartDate={termOversizeDefaultValues.permitData.startDate}
          permitDuration={termOversizeDefaultValues.permitData.permitDuration}
          permitCommodities={termOversizeDefaultValues.permitData.commodities}
          vehicleDetails={termOversizeDefaultValues.permitData.vehicleDetails}
          vehicleOptions={vehicleOptions}
          powerUnitSubTypes={powerUnitSubTypes}
          trailerSubTypes={trailerSubTypes}
          companyInfo={companyInfo}
          durationOptions={TROS_PERMIT_DURATIONS}
        />
      </FormProvider>

      <LeaveApplicationDialog
        onLeaveUnsaved={handleLeaveUnsaved}
        onContinueEditing={handleStayOnApplication}
        showDialog={showLeaveApplicationDialog}
      />
    </div>
  );
};
