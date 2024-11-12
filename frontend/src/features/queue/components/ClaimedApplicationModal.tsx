import { Button, Dialog } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import "./ClaimedApplicationModal.scss";

export const ClaimedApplicationModal = ({
  showModal,
  onCancel,
  onConfirm,
  currentClaimant,
}: {
  showModal: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  currentClaimant: string;
}) => {
  const formMethods = useForm<{ comment: string }>({
    defaultValues: {
      comment: "",
    },
    reValidateMode: "onChange",
  });

  const handleCancel = () => onCancel();
  const handleConfirm = () => onConfirm();

  return (
    <Dialog
      className="claimed-application-modal"
      open={showModal}
      onClose={handleCancel}
      PaperProps={{
        className: "claimed-application-modal__container",
      }}
    >
      <div className="claimed-application-modal__header">
        <span className="claimed-application-modal__title">
          Claimed Application
        </span>
      </div>

      <FormProvider {...formMethods}>
        <div className="claimed-application-modal__body">
          <span className="claimed-application-modal__text">
            This application is already claimed by{" "}
            <strong>{currentClaimant}.</strong>
          </span>
          <span className="claimed-application-modal__text">
            All unsaved changes will be lost. Would you like to claim it
            instead?
          </span>
        </div>

        <div className="claimed-application-modal__footer">
          <Button
            className="claimed-application-modal__button claimed-application-modal__button--cancel"
            key="cancel-claim-application-button"
            aria-label="Cancel"
            variant="contained"
            onClick={handleCancel}
            data-testid="cancel-claim-application-button"
          >
            Cancel
          </Button>

          <Button
            className="claimed-application-modal__button claimed-application-modal__button--confirm"
            key="claim-application-button"
            aria-label="Claim application"
            onClick={handleConfirm}
            data-testid="claim-application-button"
          >
            Claim Application
          </Button>
        </div>
      </FormProvider>
    </Dialog>
  );
};
