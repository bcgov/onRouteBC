import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

import "./LeaveApplicationDialog.scss";

export const LeaveApplicationDialog = ({
  showDialog,
  onLeaveUnsaved,
  onContinueEditing,
}: {
  showDialog: boolean;
  onLeaveUnsaved: () => void;
  onContinueEditing: () => void;
}) => {
  return (
    <Dialog
      open={showDialog}
      onClose={onContinueEditing}
      aria-labelledby="leave-application-title"
      className="leave-application-dialog"
    >
      <div className="leave-application-dialog__title">
        <div className="leave-application-dialog__icon">
          <FontAwesomeIcon
            className="warning-icon"
            icon={faTriangleExclamation}
          />
        </div>
        <strong>Are you sure you want to leave?</strong>
      </div>
      <div className="leave-application-dialog__content">
        <p>Your application progress will be lost if you haven&apos;t saved.</p>
      </div>
      <div className="leave-application-dialog__actions">
        <Button
          className="leave-action leave-action--discard"
          onClick={onLeaveUnsaved}
        >
          Leave Application
        </Button>
        <Button
          className="leave-action leave-action--back"
          onClick={onContinueEditing}
        >
          Continue Editing
        </Button>
      </div>
    </Dialog>
  );
};
