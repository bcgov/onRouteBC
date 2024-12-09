import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import "./ChangeCommodityTypeDialog.scss";

export const ChangeCommodityTypeDialog = ({
  newCommodityType,
  onClose,
  onConfirm,
}: {
  newCommodityType: string | undefined;
  onClose: () => void;
  onConfirm: (updatedCommodityType: string) => void;
}) => {
  return (
    <Dialog
      className="change-commodity-type-dialog"
      open={Boolean(newCommodityType)}
      onClose={onClose}
    >
      <DialogTitle className="change-commodity-type-dialog__title-section" component="div">
        <div className="change-commodity-type-dialog__icon">
          <FontAwesomeIcon
            className="warning-icon"
            icon={faTriangleExclamation}
          />
        </div>

        <strong className="change-commodity-type-dialog__title">
          Change Commodity Type
        </strong>
      </DialogTitle>

      <DialogContent className="change-commodity-type-dialog__content">
        <Typography className="change-commodity-type-dialog__warning-msg">
          Changing your commodity will require you to re-enter your vehicle information.
        </Typography> 
      </DialogContent>

      <DialogActions className="change-commodity-type-dialog__actions">
        <Button
          className="change-commodity-type-dialog__action-btn change-commodity-type-dialog__action-btn--cancel"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          className="change-commodity-type-dialog__action-btn change-commodity-type-dialog__action-btn--continue"
          onClick={() => onConfirm(newCommodityType as string)}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};
