import { MRT_Row } from "material-react-table";

import { LOADetail } from "../../../../types/LOADetail";
import { CustomActionLink } from "../../../../../../common/components/links/CustomActionLink";

export const LOANumberCell = ({
  allowEditLOA,
  onEditLOA,
  props: { row },
}: {
  allowEditLOA: boolean;
  onEditLOA: (loaId: number) => void;
  props: {
    row: MRT_Row<LOADetail>;
  };
}) => {
  return allowEditLOA ? (
    <CustomActionLink
      className="loa-list__link loa-list__link--edit-loa"
      onClick={() => onEditLOA(row.original.loaId)}
    >
      {row.original.loaNumber}
    </CustomActionLink>
  ) : (
    <>{row.original.loaNumber}</>
  );
};
