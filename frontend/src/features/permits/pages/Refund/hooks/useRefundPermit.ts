import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refundPermit } from "../api/api";
import { useState } from "react";
import { Nullable } from "../../../../../common/types/common";
import { StartTransactionResponseData } from "../../../types/payment";

export const useRefundPermitMutation = () => {
  const [transaction, setTransaction] =
    useState<Nullable<StartTransactionResponseData>>(undefined);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: refundPermit,
    retry: false,
    onSuccess: (transactionData) => {
      queryClient.invalidateQueries({
        queryKey: ["transaction"],
      });
      queryClient.setQueryData(["transaction"], transactionData);
      setTransaction(transactionData);
    },
    onError: (err: unknown) => {
      console.error(err);
      setTransaction(undefined);
    },
  });

  return {
    mutation,
    transaction,
  };
};
