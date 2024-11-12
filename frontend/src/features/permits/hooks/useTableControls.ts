import { useState } from "react";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";

export const useTableControls = ({ pageSize = 10 } = {}) => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const [sorting, setSorting] = useState<MRT_SortingState>([
    {
      id: "updatedDateTime",
      desc: true,
    },
  ]);

  const orderBy =
    sorting.length > 0
      ? [
          {
            column: sorting[0]?.id as string,
            descending: Boolean(sorting[0]?.desc),
          },
        ]
      : [];

  return {
    pagination,
    setPagination,
    sorting,
    setSorting,
    orderBy,
  };
};
