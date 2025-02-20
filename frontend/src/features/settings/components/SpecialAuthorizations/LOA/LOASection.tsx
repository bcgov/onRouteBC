import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@mui/material";
import { CustomActionLink } from "../../../../../common/components/links/CustomActionLink";
import { LOAList } from "./list/LOAList";
import { getDefaultRequiredVal } from "../../../../../common/helpers/util";
import { useFetchLOAs, useRemoveLOAMutation } from "../../../hooks/LOA";
import { usePermissionMatrix } from "../../../../../common/authentication/PermissionMatrix";
import { useState } from "react";
import { RequiredOrNull } from "../../../../../common/types/common";
import { downloadLOA } from "../../../apiManager/loa";
import { LOASteps } from "../../../pages/SpecialAuthorizations/LOA/LOASteps";
import { ExpiredLOAModal } from "./expired/ExpiredLOAModal";
import { DeleteConfirmationDialog } from "../../../../../common/components/dialog/DeleteConfirmationDialog";

export const LOASection = ({
  canReadLOA,
  companyId,
  // enableLOA,
}: {
  canReadLOA: boolean;
  companyId: number;
  enableLOA: boolean;
}) => {
  const [showExpiredLOAs, setShowExpiredLOAs] = useState<boolean>(false);
  const [loaToDelete, setLoaToDelete] = useState<RequiredOrNull<number>>(null);
  const [showLOASteps, setShowLOASteps] = useState<boolean>(false);
  const [loaToEdit, setLoaToEdit] = useState<RequiredOrNull<number>>(null);
  const activeLOAsQuery = useFetchLOAs(companyId, false);
  const expiredLOAsQuery = useFetchLOAs(companyId, true);
  const activeLOAs = getDefaultRequiredVal([], activeLOAsQuery.data);
  const expiredLOAs = getDefaultRequiredVal([], expiredLOAsQuery.data);
  const showExpiredLOAsLink = canReadLOA && expiredLOAs.length > 0;
  const showActiveLOAsList = canReadLOA && activeLOAs.length > 0;
  const showExpiredLOAsModal = canReadLOA && showExpiredLOAs;
  const removeLOAMutation = useRemoveLOAMutation();

  const canWriteLOA = usePermissionMatrix({
    featureFlag: "LOA",
    permissionMatrixKeys: {
      permissionMatrixFeatureKey: "MANAGE_SETTINGS",
      permissionMatrixFunctionKey: "EDIT_AN_LOA",
    },
  });

  const showDeleteDialog = canWriteLOA && loaToDelete;

  const handleOpenDeleteModal = (loaId: number) => {
    if (!canWriteLOA) return;
    setLoaToDelete(loaId);
  };

  const handleCloseDeleteModal = () => {
    setLoaToDelete(null);
  };

  const handleDeleteLOA = async (loaId: number) => {
    try {
      if (canWriteLOA) {
        await removeLOAMutation.mutateAsync({
          companyId,
          loaId,
        });

        activeLOAsQuery.refetch();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoaToDelete(null);
    }
  };

  const handleDownloadLOA = async (loaId: number) => {
    if (loaId && canReadLOA) {
      try {
        const { blobObj: blobObjWithoutType } = await downloadLOA(
          loaId,
          companyId,
        );

        const objUrl = URL.createObjectURL(
          new Blob([blobObjWithoutType], { type: "application/pdf" }),
        );
        window.open(objUrl, "_blank");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleShowExpiredLOA = () => {
    setShowExpiredLOAs(true);
  };
  const handleAddLOA = () => {
    if (!canWriteLOA) return;
    setShowLOASteps(true);
    setLoaToEdit(null);
  };

  const handleEditLOA = (loaId: number) => {
    if (!canWriteLOA) return;
    setShowLOASteps(true);
    setLoaToEdit(loaId);
  };

  const handleExitLOASteps = () => {
    setShowLOASteps(false);
    setLoaToEdit(null);
    activeLOAsQuery.refetch();
    expiredLOAsQuery.refetch();
  };

  if (showLOASteps) {
    return canWriteLOA ? (
      <LOASteps
        loaId={loaToEdit}
        companyId={companyId}
        onExit={handleExitLOASteps}
      />
    ) : null;
  }

  return activeLOAs.length > 0 || expiredLOAs.length > 0 || canWriteLOA ? (
    <div className="special-authorizations__loa">
      <div className="special-authorizations__section-header">
        <div className="special-authorizations__header-title">
          Letter of Authorization (LOA)
        </div>

        {showExpiredLOAsLink ? (
          <CustomActionLink
            className="special-authorizations__link"
            onClick={handleShowExpiredLOA}
          >
            Expired LOA(s)
          </CustomActionLink>
        ) : null}
      </div>

      {canWriteLOA ? (
        <Button
          className="add-loa-btn"
          key="add-loa-button"
          aria-label="Add LOA"
          variant="contained"
          color="tertiary"
          onClick={handleAddLOA}
        >
          <FontAwesomeIcon className="add-loa-btn__icon" icon={faPlus} />
          Add an LOA
        </Button>
      ) : (
        <div className="loa-info">
          Download the letter to see the specific travel terms of the LOA.
        </div>
      )}

      {showActiveLOAsList ? (
        <div className="active-loas">
          <div className="active-loas__header">Active LOA(s)</div>

          <LOAList
            loas={activeLOAs}
            isActive={true}
            allowEditLOA={canWriteLOA}
            onDelete={handleOpenDeleteModal}
            onEdit={handleEditLOA}
            onDownload={handleDownloadLOA}
          />
        </div>
      ) : null}
      {showExpiredLOAsModal ? (
        <ExpiredLOAModal
          allowEditLOA={canWriteLOA}
          showModal={showExpiredLOAs}
          handleCancel={() => setShowExpiredLOAs(false)}
          expiredLOAs={expiredLOAs}
          handleEdit={(loaId) => {
            setShowExpiredLOAs(false);
            handleEditLOA(loaId);
          }}
          handleDownload={handleDownloadLOA}
        />
      ) : null}

      {showDeleteDialog ? (
        <DeleteConfirmationDialog
          showDialog={Boolean(loaToDelete)}
          onCancel={handleCloseDeleteModal}
          onDelete={() => handleDeleteLOA(loaToDelete)}
          itemToDelete="item"
          confirmationMsg={"Are you sure you want to delete this?"}
        />
      ) : null}
    </div>
  ) : null;
};

export default LOASection;
