import { Button, Dialog } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FormProvider, useForm } from "react-hook-form";
import { CompanyProfile } from "../../../manageProfile/types/manageProfile";
import "./AddUserModal.scss";

export const AddUserModal = ({
  showModal,
  onCancel,
  onConfirm,
  company,
}: {
  showModal: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  company: CompanyProfile;
}) => {
  const formMethods = useForm<{ comment: string }>({
    reValidateMode: "onChange",
  });

  const { handleSubmit } = formMethods;

  const handleCancel = () => onCancel();

  const handleAddUser = () => {
    onConfirm();
  };

  return (
    <Dialog
      className="add-user-modal"
      open={showModal}
      onClose={handleCancel}
      PaperProps={{
        className: "add-user-modal__container",
      }}
    >
      <div className="add-user-modal__header">
        <div className="add-user-modal__icon">
          <FontAwesomeIcon className="icon" icon={faPlusCircle} />
        </div>

        <span className="add-user-modal__title">Add Credit Account User</span>
      </div>

      <FormProvider {...formMethods}>
        <div className="add-user-modal__body">
          <dl>
            <div className="add-user-modal__item">
              <dt className="add-user-modal__key">Company Name</dt>
              <dd className="add-user-modal__value">{company.legalName}</dd>
            </div>
            {company.alternateName ? (
              <div className="add-user-modal__item">
                <dt className="add-user-modal__key">Doing Buisness As (DBA)</dt>
                <dd className="add-user-modal__value">
                  {company.alternateName}
                </dd>
              </div>
            ) : null}
            <div className="add-user-modal__item">
              <dt className="add-user-modal__key">OnRouteBC Client No.</dt>
              <dd className="add-user-modal__value">{company.clientNumber}</dd>
            </div>
          </dl>
        </div>

        <div className="add-user-modal__footer">
          <Button
            key="cancel-add-user-button"
            aria-label="Cancel"
            variant="contained"
            color="tertiary"
            className="add-user-button add-user-button--cancel"
            onClick={handleCancel}
            data-testid="cancel-add-user-button"
          >
            Cancel
          </Button>

          <Button
            key="add-user-button"
            aria-label="Add-user Company"
            onClick={handleSubmit(handleAddUser)}
            className="add-user-button add-user-button--add-user"
            data-testid="add-user-button"
          >
            Add Account User
          </Button>
        </div>
      </FormProvider>
    </Dialog>
  );
};
