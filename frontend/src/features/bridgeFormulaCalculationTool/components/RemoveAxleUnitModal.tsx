import { Button, Dialog } from "@mui/material";
import "./RemoveAxleUnitModal.scss";

export const RemoveAxleUnitModal = ({
  isOpen,
  onCancel,
  onConfirm,
}: {
  /**
   * Boolean to control the open and close state of Dialog box.
   */
  isOpen: boolean;
  /**
   * A callback function on clicking cancel button.
   * @returns void
   */
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      className="remove-axle-unit-modal"
      PaperProps={{
        className: "remove-axle-unit-modal__container",
      }}
    >
      <div className="remove-axle-unit-modal__header">
        <h2 className="remove-axle-unit-modal__title">Remove item?</h2>
      </div>

      <div className="remove-axle-unit-modal__body">
        <p className="remove-axle-unit-modal__text">
          Are you sure you want to remove this? This action cannot be undone.
        </p>
      </div>

      <div className="remove-axle-unit-modal__footer">
        <Button
          className="remove-axle-unit-modal__button remove-axle-unit-modal__button--cancel"
          variant="contained"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          className="remove-axle-unit-modal__button remove-axle-unit-modal__button--remove"
          variant="contained"
          color="primary"
          onClick={onConfirm}
        >
          Remove
        </Button>
      </div>
    </Dialog>
  );
};
