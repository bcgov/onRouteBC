import { MRT_Row } from "material-react-table";

import { CustomActionLink } from "../../../../../../common/components/links/CustomActionLink";
import { LOADetail } from "../../../../types/LOADetail";

export const LOADownloadCell = ({
  onDownload,
  props: { row },
}: {
  onDownload: (loaId: number) => void;
  props: {
    row: MRT_Row<LOADetail>;
  };
}) => {
  const loaHasDocument = Boolean(row.original.documentId);

  return loaHasDocument ? (
    <CustomActionLink
      className="loa-list__link loa-list__link--download-loa"
      onClick={() => onDownload(row.original.loaId)}
    >
      Download Letter
    </CustomActionLink>
  ) : null;
};
