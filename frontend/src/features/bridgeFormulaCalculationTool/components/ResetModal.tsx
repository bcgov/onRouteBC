import { Button, Dialog } from "@mui/material";
import "./ResetModal.scss";

export const ResetModal = ({
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
      className="reset-modal"
      PaperProps={{
        className: "reset-modal__container",
      }}
    >
      <div className="reset-modal__header">
        <h2 className="reset-modal__title">Reset all?</h2>
      </div>

      <div className="reset-modal__body">
        <p className="reset-modal__text">
          Reset will remove all data. This action cannot be undone.
        </p>
      </div>

      <div className="reset-modal__footer">
        <Button
          className="reset-modal__button reset-modal__button--cancel"
          variant="contained"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          className="reset-modal__button reset-modal__button--reset"
          variant="contained"
          color="primary"
          onClick={onConfirm}
        >
          Reset
        </Button>
      </div>
    </Dialog>
  );
};
