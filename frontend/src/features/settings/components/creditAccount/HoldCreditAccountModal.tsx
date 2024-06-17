import { Button, Dialog } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FormProvider, useForm } from "react-hook-form";

import "./HoldCreditAccountModal.scss";
import { requiredMessage } from "../../../../common/helpers/validationMessages";
import { CustomFormComponent } from "../../../../common/components/form/CustomFormComponents";

export const HoldCreditAccountModal = ({
  showModal,
  onCancel,
  onConfirm,
}: {
  showModal: boolean;
  onCancel: () => void;
  onConfirm: (comment: string) => void;
}) => {
  const formMethods = useForm<{ comment: string }>({
    defaultValues: {
      comment: "",
    },
    reValidateMode: "onChange",
  });

  const { handleSubmit, getValues } = formMethods;

  const handleCancel = () => onCancel();

  const handleHoldAccount = () => {
    const { comment } = getValues();
    onConfirm(comment);
  };

  const holdAccountCommentRules = {
    required: {
      value: true,
      message: requiredMessage(),
    },
  };

  return (
    <Dialog
      className="hold-account-modal"
      open={showModal}
      onClose={handleCancel}
      PaperProps={{
        className: "hold-account-modal__container",
      }}
    >
      <div className="hold-account-modal__header">
        <div className="hold-account-modal__icon">
          <FontAwesomeIcon className="icon" icon={faExclamationTriangle} />
        </div>

        <span className="hold-account-modal__title">Put Account on Hold</span>
      </div>

      <FormProvider {...formMethods}>
        <div className="hold-account-modal__body">
          <div className="hold-account-form">
            <CustomFormComponent
              type="textarea"
              feature="hold-account-comment"
              options={{
                label: "Comment for Account Hold",
                name: "comment",
                rules: holdAccountCommentRules,
              }}
              className="hold-account-form__input"
            />
          </div>
        </div>

        <div className="hold-account-modal__footer">
          <Button
            key="cancel-hold-account-button"
            aria-label="Cancel"
            variant="contained"
            className="hold-account-button hold-account-button--cancel"
            onClick={handleCancel}
            data-testid="cancel-hold-account-button"
          >
            Cancel
          </Button>

          <Button
            key="hold-account-button"
            aria-label="Hold-account Company"
            onClick={handleSubmit(handleHoldAccount)}
            className="hold-account-button hold-account-button--hold-account"
            data-testid="hold-account-button"
          >
            Put on Hold
          </Button>
        </div>
      </FormProvider>
    </Dialog>
  );
};
