/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Typography } from "@mui/material";
import { ApplicationRejectionHistory } from "../../../../types/ApplicationRejectionHistory";
import "./ReviewApplicationRejectionHistory.scss";
import {
  DATE_FORMATS,
  toLocal,
} from "../../../../../../common/helpers/formatDate";
import { canViewApplicationQueue } from "../../../../../queue/helpers/canViewApplicationQueue";
import { useContext } from "react";
import OnRouteBCContext from "../../../../../../common/authentication/OnRouteBCContext";
import { useMemoizedArray } from "../../../../../../common/hooks/useMemoizedArray";
import dayjs from "dayjs";

export const ReviewApplicationRejectionHistory = ({
  applicationRejectionHistory,
}: {
  applicationRejectionHistory: ApplicationRejectionHistory[];
}) => {
  const { idirUserDetails } = useContext(OnRouteBCContext);

  const sortRejectionHistoryByDate = (
    history: ApplicationRejectionHistory[],
  ): ApplicationRejectionHistory[] => {
    return history.slice().sort((current, next) => {
      const curentDate = dayjs(current.dateTime);
      const nextDate = dayjs(next.dateTime);
      return nextDate.valueOf() - curentDate.valueOf();
    });
  };

  const reversedApplicationRejectionHistory = useMemoizedArray(
    sortRejectionHistoryByDate(applicationRejectionHistory),
    (rejectionHistoryItem) => rejectionHistoryItem.caseActivityId,
    (current, next) => current === next,
  );

  return (
    <Box className="rejection-history">
      <Box className="rejection-history__header">
        <Typography
          variant={"h3"}
          className="rejection-history__title"
          data-testid="rejection-history-title"
        >
          Rejection History
        </Typography>
      </Box>
      <Box className="rejection-history__body">
        <Box className="rejection-history__info">
          {applicationRejectionHistory.map((item) => (
            <Box
              className="rejection-history__item item"
              key={item.caseActivityId}
            >
              <div className="item__row item__row--flex">
                <Typography>
                  {canViewApplicationQueue(idirUserDetails?.userRole)
                    ? `${item.userName}, ${toLocal(item.dateTime, DATE_FORMATS.LONG)}`
                    : toLocal(item.dateTime, DATE_FORMATS.LONG)}
                </Typography>
              </div>
              <div className="item__row">
                <Typography>{item.caseNotes}</Typography>
              </div>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
