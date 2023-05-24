import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { BC_COLOURS } from "../../../../themes/bcGovStyles";

/**
 *  A stateless confirmation dialog box for Delete Operations.
 */
export default function DeleteConfirmationDialog({
  isOpen,
  onClickDelete,
  onClickCancel,
  caption,
}: {
  /**
   * Boolean to control the open and close state of Dialog box.
   */
  isOpen: boolean;
  /**
   * A callback function on clicking delete button.
   * @returns void
   */
  onClickDelete: () => void;

  /**
   * A callback function on clicking cancel button.
   * @returns void
   */
  onClickCancel: () => void;
  /**
   * A caption string showing on title of the Dialog box.
   * @returns string
   */
  caption: string
}) {
  const title = caption;
  return (
    <div>
      <Dialog
        onClose={onClickCancel}
        aria-labelledby="confirmation-dialog-title"
        open={isOpen}
      >
        <DialogTitle
          sx={{
            background: BC_COLOURS.bc_background_light_grey,
            color: BC_COLOURS.bc_red,
          }}
        >
          <FontAwesomeIcon icon={faTrash} /> &nbsp;
          <strong>Delete {title}(s)? </strong>
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Are you sure you want to delete this? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" onClick={onClickCancel}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={onClickDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
