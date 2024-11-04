/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from "react";

import {
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import "./TransactionHistoryTable.scss";
import { PermitHistory } from "../../../types/PermitHistory";
import { getPaymentMethod } from "../../../../../common/types/paymentMethods";
import { isValidTransaction } from "../../../helpers/payment";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../../../common/helpers/util";

import {
  feeSummaryDisplayText,
  isTransactionTypeRefund,
  isZeroAmount,
} from "../../../helpers/feeSummary";

import {
  defaultTableInitialStateOptions,
  defaultTableOptions,
  defaultTableStateOptions,
} from "../../../../../common/helpers/tableHelper";
import { CustomFormComponent } from "../../../../../common/components/form/CustomFormComponents";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import {
  MultiplePaymentMethodRefundFormData,
  MultiplePaymentMethodRefundRowData,
  PermitHistoryWithRefund,
} from "../types/RefundFormData";
import { Button, Checkbox, FormControlLabel } from "@mui/material";
import { requiredMessage } from "../../../../../common/helpers/validationMessages";

export const TransactionHistoryTable = ({
  permitHistory,
}: {
  permitHistory: PermitHistory[];
}) => {
  const validTransactionHistory = permitHistory.filter((history) =>
    isValidTransaction(history.paymentMethodTypeCode, history.pgApproved),
  );

  const formMethods = useForm<MultiplePaymentMethodRefundFormData>({
    defaultValues: {
      refundData: validTransactionHistory.map(() => ({
        refundAmount: "",
        refundTransactionId: "",
        chequeRefund: false,
      })),
    },
    reValidateMode: "onChange",
  });

  const { handleSubmit, register, watch, setValue, trigger } = formMethods;

  const onSubmit = (data: FieldValues) => {
    console.log(data);
  };

  const isRowSelectable = (row: MRT_Row<PermitHistoryWithRefund>): boolean => {
    return (
      !isTransactionTypeRefund(row.original.transactionTypeId) &&
      !isZeroAmount(row.original.transactionAmount)
    );
  };

  const columns = useMemo<MRT_ColumnDef<PermitHistoryWithRefund>[]>(
    () => [
      {
        accessorKey: "permitNumber",
        header: "Permit #",
        muiTableHeadCellProps: {
          className:
            "transaction-history-table__header transaction-history-table__header--permit-number",
        },
        muiTableBodyCellProps: {
          className:
            "transaction-history-table__data transaction-history-table__data--permit-number",
        },
        size: 150,
        enableSorting: false,
        enableColumnActions: false,
      },
      {
        accessorFn: (originalRow) => {
          return getPaymentMethod(
            originalRow.paymentMethodTypeCode,
            originalRow.paymentCardTypeCode,
          );
        },
        id: "paymentMethod",
        header: "Payment Method",
        muiTableHeadCellProps: {
          className:
            "transaction-history-table__header transaction-history-table__header--payment-method",
        },
        muiTableBodyCellProps: {
          className:
            "transaction-history-table__data transaction-history-table__data--payment-method",
        },
        size: 200,
        enableSorting: false,
        enableColumnActions: false,
      },
      {
        accessorFn: (originalRow) =>
          getDefaultRequiredVal(
            originalRow.transactionOrderNumber,
            originalRow.pgTransactionId,
          ),
        id: "providerTransactionId",
        header: "Provider Tran ID",
        muiTableHeadCellProps: {
          className:
            "transaction-history-table__header transaction-history-table__header--provider-transaction-id",
        },
        muiTableBodyCellProps: {
          className:
            "transaction-history-table__data transaction-history-table__data--provider-transaction-id",
        },
        size: 100,
        enableSorting: false,
        enableColumnActions: false,
      },
      {
        accessorFn: (originalRow) => {
          const amount = isTransactionTypeRefund(originalRow.transactionTypeId)
            ? -1 * originalRow.transactionAmount
            : originalRow.transactionAmount;

          return feeSummaryDisplayText(
            applyWhenNotNullable((val) => `${val}`, amount),
          );
        },
        header: "Amount (CAD)",
        muiTableHeadCellProps: {
          className:
            "transaction-history-table__header transaction-history-table__header--amount",
          align: "right",
        },
        muiTableBodyCellProps: {
          className:
            "transaction-history-table__data transaction-history-table__data--amount",
          align: "right",
        },
        id: "transactionAmount",
        size: 50,
        enableSorting: false,
        enableColumnActions: false,
      },
      {
        id: "refundAmount",
        header: "Refund Amount (CAD)",
        muiTableHeadCellProps: {
          className:
            "transaction-history-table__header transaction-history-table__header--refund-amount",
        },
        muiTableBodyCellProps: {
          className:
            "transaction-history-table__data transaction-history-table__data--refund-amount",
        },
        size: 20,
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ cell }: { cell: MRT_Cell<PermitHistoryWithRefund> }) => {
          const rowIsSelected = cell.row.getIsSelected();

          // clear refundAmount when row is unselected
          useEffect(() => {
            if (!rowIsSelected) {
              setValue(`refundData.${cell.row.index}.refundAmount`, "");
            }
          }, [rowIsSelected, setValue, cell.row.index]);

          return (
            isRowSelectable(cell.row) && (
              <CustomFormComponent
                type="number"
                feature="refund-permit"
                className="transaction-history-table__input transaction-history-table__input--refund-amount"
                options={{
                  name: `refundData.${cell.row.index}.refundAmount`,
                  rules: { required: false },
                  width: "200px",
                  showOptionalLabel: false,
                }}
                disabled={!cell.row.getIsSelected()}
              />
            )
          );
        },
      },
      {
        id: "refundTransactionId",
        header: "Refund Tran ID",
        muiTableHeadCellProps: {
          className:
            "transaction-history-table__header transaction-history-table__header--refund-transaction-id",
        },
        muiTableBodyCellProps: {
          className:
            "transaction-history-table__data transaction-history-table__data--refund-transaction-id",
        },
        size: 20,
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ cell }: { cell: MRT_Cell<PermitHistoryWithRefund> }) => {
          const rowIsSelected = cell.row.getIsSelected();
          const refundAmount = watch(
            `refundData.${cell.row.index}.refundAmount`,
          );
          const chequeRefund = watch(
            `refundData.${cell.row.index}.chequeRefund`,
          );

          // clear refundTransactionId when refundAmount is cleared
          useEffect(() => {
            if (!refundAmount) {
              setValue(`refundData.${cell.row.index}.refundTransactionId`, "");
            }
          }, [refundAmount, cell.row.index, setValue]);

          // re-validate refundTransactionId when chequeRefund is checked/unchecked
          useEffect(() => {
            trigger(`refundData.${cell.row.index}.refundTransactionId`);
          }, [chequeRefund, cell.row.index, trigger]);

          // clear refundTransactionId when row is unselected
          useEffect(() => {
            if (!rowIsSelected) {
              setValue(`refundData.${cell.row.index}.refundTransactionId`, "");
            }
          }, [rowIsSelected, setValue, cell.row.index]);

          return (
            isRowSelectable(cell.row) && (
              <CustomFormComponent
                type="input"
                feature="refund-permit"
                className="transaction-history-table__input"
                options={{
                  name: `refundData.${cell.row.index}.refundTransactionId`,
                  rules: {
                    required: {
                      value: refundAmount !== "" && !chequeRefund,
                      message: requiredMessage(),
                    },
                  },
                  width: "200px",
                  showOptionalLabel: false,
                }}
                disabled={!refundAmount || chequeRefund}
              />
            )
          );
        },
      },
      {
        id: "chequeRefund",
        header: "Cheque Refund",
        muiTableHeadCellProps: {
          className:
            "transaction-history-table__header transaction-history-table__header--refund-cheque-refund",
        },
        muiTableBodyCellProps: {
          className:
            "transaction-history-table__data transaction-history-table__data--refund-cheque-refund",
        },
        size: 20,
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ cell }: { cell: MRT_Cell<PermitHistoryWithRefund> }) => {
          const chequeRefund = watch(
            `refundData.${cell.row.index}.chequeRefund`,
          );
          const refundAmount = watch(
            `refundData.${cell.row.index}.refundAmount`,
          );
          const refundTransactionId = watch(
            `refundData.${cell.row.index}.refundTransactionId`,
          );

          const rowIsSelected = cell.row.getIsSelected();

          // TODO this implementation is not currently working
          // set chequeRefund to false when row is unselected
          useEffect(() => {
            if (!rowIsSelected) {
              setValue(`refundData.${cell.row.index}.chequeRefund`, false);
            }
          }, [rowIsSelected, cell.row.index, setValue]);

          return (
            isRowSelectable(cell.row) && (
              <FormControlLabel
                control={
                  <Checkbox
                    className="cheque-refund-checkbox"
                    {...register(`refundData.${cell.row.index}.chequeRefund`)}
                    disabled={
                      !cell.row.getIsSelected() ||
                      refundAmount === "" ||
                      refundTransactionId !== ""
                    }
                  />
                }
                label="Cheque Refund"
                classes={{
                  root: "cheque-refund-label",
                  disabled: "cheque-refund-label--disabled",
                }}
              />
            )
          );
        },
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    ...defaultTableOptions,
    columns: columns,
    data: validTransactionHistory,
    enableRowActions: false,
    enableGlobalFilter: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableRowSelection: (row: MRT_Row<PermitHistoryWithRefund>) =>
      isRowSelectable(row),
    initialState: {
      ...defaultTableInitialStateOptions,
      showGlobalFilter: false,
    },
    state: {
      ...defaultTableStateOptions,
    },
    muiTablePaperProps: {
      className: "transaction-history-table",
    },
    muiTableContainerProps: {
      className: "transaction-history-table__container",
    },
    muiTableBodyRowProps: ({ row }) => ({
      className: `transaction-history-table__row ${row.getIsSelected() && "transaction-history-table__row--selected"}`,
    }),
  });

  return (
    <FormProvider {...formMethods}>
      <MaterialReactTable table={table} />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit(onSubmit)}
        className="submit-btn"
      >
        Finish
      </Button>
    </FormProvider>
  );
};
