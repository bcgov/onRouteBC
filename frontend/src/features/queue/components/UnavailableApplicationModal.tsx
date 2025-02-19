import { Button, Dialog } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import "./UnavailableApplicationModal.scss";

export const UnavailableApplicationModal = ({
  showModal,
  onConfirm,
  onCancel,
  assignedUser,
}: {
  showModal: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  assignedUser: string;
}) => {
  const formMethods = useForm<{ comment: string }>({
    defaultValues: {
      comment: "",
    },
    reValidateMode: "onChange",
  });

  const handleConfirm = () => onConfirm();
  const handleCancel = () => onCancel();

  return (
    <Dialog
      className="unavailable-application-modal"
      open={showModal}
      onClose={handleCancel}
      PaperProps={{
        className: "unavailable-application-modal__container",
      }}
    >
      <div className="unavailable-application-modal__header">
        <span className="unavailable-application-modal__title">
          Application no longer available
        </span>
      </div>

      <FormProvider {...formMethods}>
        <div className="unavailable-application-modal__body">
          <span className="unavailable-application-modal__text">
            This application is claimed by <strong>{assignedUser}.</strong>
          </span>
        </div>

        <div className="unavailable-application-modal__footer">
          <Button
            className="unavailable-application-modal__button unavailable-application-modal__button--confirm"
            key="close-application-button"
            aria-label="Close application"
            onClick={handleConfirm}
            data-testid="close-application-button"
          >
            Close Application
          </Button>
        </div>
      </FormProvider>
    </Dialog>
  );
};
