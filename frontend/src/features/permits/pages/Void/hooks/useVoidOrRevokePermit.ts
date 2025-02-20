import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VoidOrRevokePermitResponseData } from "../types/VoidPermit";
import { voidOrRevokePermit } from "../../../apiManager/permitsAPI";
import { Nullable } from "../../../../../common/types/common";

export const useVoidOrRevokePermit = () => {
  const [voidResults, setVoidResults] =
    useState<Nullable<VoidOrRevokePermitResponseData>>(undefined);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: voidOrRevokePermit,
    retry: false,
    onSuccess: (voidResponseData) => {
      queryClient.invalidateQueries({
        queryKey: ["permit"],
      });
      setVoidResults(voidResponseData);
    },
    onError: (err: unknown) => {
      console.error(err);
      setVoidResults(null);
    },
  });

  return {
    mutation,
    voidResults,
  };
};
