import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Dialog } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { CustomFormComponent } from "../../../common/components/form/CustomFormComponents";
import { requiredMessage } from "../../../common/helpers/validationMessages";
import "./RejectApplicationModal.scss";

export const RejectApplicationModal = ({
  showModal,
  onCancel,
  onConfirm,
  isPending,
}: {
  showModal: boolean;
  onCancel: () => void;
  onConfirm: (comment: string) => void;
  isPending: boolean;
}) => {
  const formMethods = useForm<{ comment: string }>({
    defaultValues: {
      comment: "",
    },
    reValidateMode: "onChange",
  });

  const { handleSubmit, getValues } = formMethods;

  const handleCancel = () => onCancel();

  const handleRejectApplication = () => {
    const { comment } = getValues();
    onConfirm(comment);
  };

  const rejectApplicationCommentRules = {
    required: {
      value: true,
      message: requiredMessage(),
    },
  };

  return (
    <Dialog
      className="reject-application-modal"
      open={showModal}
      onClose={handleCancel}
      PaperProps={{
        className: "reject-application-modal__container",
      }}
    >
      <div className="reject-application-modal__header">
        <div className="reject-application-modal__icon">
          <FontAwesomeIcon className="icon" icon={faCircleExclamation} />
        </div>

        <span className="reject-application-modal__title">
          Application Rejection
        </span>
      </div>

      <FormProvider {...formMethods}>
        <div className="reject-application-modal__body">
          <div className="reject-application-form">
            <CustomFormComponent
              type="textarea"
              feature="reject-application-comment"
              options={{
                label: "Reason for Rejection",
                name: "comment",
                rules: rejectApplicationCommentRules,
              }}
              className="reject-application-form__input"
            />
          </div>
        </div>

        <div className="reject-application-modal__footer">
          <Button
            className="reject-application-modal__button reject-application-modal__button--cancel"
            key="cancel-reject-application-button"
            aria-label="Cancel"
            variant="contained"
            onClick={handleCancel}
            data-testid="cancel-reject-application-button"
          >
            Cancel
          </Button>

          <Button
            className="reject-application-modal__button reject-application-modal__button--confirm"
            key="reject-application-button"
            onClick={handleSubmit(handleRejectApplication)}
            data-testid="reject-application-button"
            disabled={isPending}
          >
            Reject Application
          </Button>
        </div>
      </FormProvider>
    </Dialog>
  );
};
