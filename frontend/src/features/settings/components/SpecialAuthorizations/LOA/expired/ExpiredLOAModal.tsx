import { Button, Dialog } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";

import "./ExpiredLOAModal.scss";
import { LOAList } from "../list/LOAList";
import { LOADetail } from "../../../../types/LOADetail";

export const ExpiredLOAModal = ({
  showModal,
  allowEditLOA,
  handleCancel,
  handleEdit,
  handleDownload,
  expiredLOAs,
}: {
  showModal: boolean;
  allowEditLOA: boolean;
  handleCancel: () => void;
  handleEdit: (loaId: number) => void;
  handleDownload: (loaId: number) => void;
  expiredLOAs: LOADetail[];
}) => {
  return (
    <Dialog
      className="expired-loa-modal"
      open={showModal}
      onClose={handleCancel}
      PaperProps={{
        className: "expired-loa-modal__container"
      }}
    >
      <div className="expired-loa-modal__header">
        <div className="expired-loa-modal__icon">
          <FontAwesomeIcon className="icon" icon={faClockRotateLeft} />
        </div>

        <span className="expired-loa-modal__title">
          Expired LOA(s)
        </span>
      </div>

      <div className="expired-loa-modal__body">
        <LOAList
          isActive={false}
          allowEditLOA={allowEditLOA}
          loas={expiredLOAs}
          onEdit={handleEdit}
          onDownload={handleDownload}
        />
      </div>

      <div className="expired-loa-modal__footer">
        <Button
          key="cancel-expired-loa-button"
          aria-label="Cancel"
          variant="contained"
          color="tertiary"
          className="expired-loa-button expired-loa-button--cancel"
          onClick={handleCancel}
          data-testid="cancel-expired-loa-button"
        >
          Close
        </Button>
      </div>
    </Dialog>
  );
};
