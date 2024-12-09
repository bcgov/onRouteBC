import { serializePermitData } from "./serializePermitData";
import {
  ApplicationFormData,
  CreateApplicationRequestData,
  UpdateApplicationRequestData,
} from "../../types/application";

/**
 * Serializes Application form data to CreateApplicationRequestData.
 * The result can be used as payload for create application requests.
 * @param application Application form data
 * @returns CreateApplicationRequestData object used for payload data to request to backend
 */
export const serializeForCreateApplication = (
  application: ApplicationFormData,
): CreateApplicationRequestData => {
  const {
    permitId,
    originalPermitId,
    applicationNumber,
    permitType,
    permitData,
    comment,
  } = application;

  return {
    permitId,
    originalPermitId,
    applicationNumber,
    permitType,
    comment,
    permitData: serializePermitData(permitData),
  };
};

/**
 * Serializes Application form data to UpdateApplicationRequestData.
 * The result can be used as payload for update application requests.
 * @param application Application form data
 * @returns UpdateApplicationRequestData object used for payload to request to backend
 */
export const serializeForUpdateApplication = (
  application: ApplicationFormData,
): UpdateApplicationRequestData => {
  const {
    permitType,
    comment,
    permitData,
  } = application;

  return {
    permitType,
    comment,
    permitData: serializePermitData(permitData),
  };
};
