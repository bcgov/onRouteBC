import { Button, Dialog } from "@mui/material";
import "./ApplicationInReviewModal.scss";

export const ApplicationInReviewModal = ({
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
      className="application-in-review-modal"
      PaperProps={{
        className: "application-in-review-modal__container",
      }}
    >
      <div className="application-in-review-modal__header">
        <h2 className="application-in-review-modal__title">
          Application Status
        </h2>
      </div>

      <div className="application-in-review-modal__body">
        <p className="application-in-review-modal__text">
          Application(s) have either been withdrawn or are in review by the
          Provincial Permit Centre.
        </p>
      </div>

      <div className="application-in-review-modal__footer">
        <Button
          className="application-in-review-modal__button"
          variant="contained"
          color="primary"
          onClick={onConfirm}
        >
          Continue
        </Button>
      </div>
    </Dialog>
  );
};
