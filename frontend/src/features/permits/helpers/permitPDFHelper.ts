import {
  downloadPermitApplicationPdf,
  downloadReceiptPdf,
} from "../apiManager/permitsAPI";

/**
 * Opens the PDF in a new browser tab.
 * NOTE: Only supports PDFs.
 * @param blob The blob to be opened.
 */
export const openBlobInNewTab = (blob: Blob) => {
  const objUrl = URL.createObjectURL(
    new Blob([blob], { type: "application/pdf" }),
  );
  window.open(objUrl, "_blank");
};

/**
 * Opens the receipt pdf for a permit in a new tab.
 * @param companyId id of the company that the permit belongs to
 * @param permitId The permit id of the receipt
 * @param onDocumentUnavailable Callback function invoked when the PDF document is unavailable
 */
export const viewReceiptPdf = async (
  companyId: number,
  permitId: string, 
  onDocumentUnavailable?: () => void,
) => {
  if (permitId) {
    try {
      const { blobObj: blobObjWithoutType } = await downloadReceiptPdf(
        companyId,
        permitId,
      );
      openBlobInNewTab(blobObjWithoutType);
    } catch (err) {
      console.error(err);
      onDocumentUnavailable?.();
    }
  }
};

/**
 * Opens the permit PDF in a new tab.
 * @param companyId id of the company that the permit belongs to
 * @param permitId The id of the permit
 * @param onDocumentUnavailable Callback function invoked when the PDF document is unavailable
 */
export const viewPermitPdf = async (
  companyId: number,
  permitId: string, 
  onDocumentUnavailable?: () => void,
) => {
  try {
    const { blobObj: blobObjWithoutType } = await downloadPermitApplicationPdf(
      companyId,
      permitId,
    );
    openBlobInNewTab(blobObjWithoutType);
  } catch (err) {
    console.error(err);
    onDocumentUnavailable?.();
  }
};
