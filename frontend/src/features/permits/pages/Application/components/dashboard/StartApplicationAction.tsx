import { Box, Button, FormLabel, Menu, MenuItem, Tooltip } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NestedMenuItem } from "mui-nested-menu";
import { APPLICATIONS_ROUTES } from "../../../../../../routes/constants";
import {
  ALL_PERMIT_TYPE_CHOOSE_FROM_OPTIONS,
  PermitTypeChooseFromItem,
} from "../../../../constants/constants";
import {
  EMPTY_PERMIT_TYPE_SELECT,
  PermitType,
  getFormattedPermitTypeName,
} from "../../../../types/PermitType";
import "./StartApplicationAction.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export const StartApplicationAction = () => {
  const navigate = useNavigate();
  const [chooseFrom, setChooseFrom] = useState<
    PermitType | typeof EMPTY_PERMIT_TYPE_SELECT
  >(EMPTY_PERMIT_TYPE_SELECT);

  const [isError, setIsError] = useState<boolean>(false);

  const handleChooseFrom = (
    _event: React.MouseEvent<HTMLElement>,
    item: PermitTypeChooseFromItem,
  ) => {
    setIsError(false);
    setChooseFrom(item.value as PermitType);
    handleClose();
  };

  const handleStartButtonClicked = () => {
    if (chooseFrom !== EMPTY_PERMIT_TYPE_SELECT) {
      navigate(APPLICATIONS_ROUTES.START_APPLICATION(chooseFrom));
    } else {
      setIsError(true);
    }
  };

  // Update the structure of menuItems to ensure the callback is applied correctly
  const menuItems = ALL_PERMIT_TYPE_CHOOSE_FROM_OPTIONS.map(
    (item: PermitTypeChooseFromItem) => ({
      ...item,
      callback: (event: React.MouseEvent<HTMLElement>) =>
        handleChooseFrom(event, item),
      // Correctly set the nested item's callback
      items: item?.items?.map((nestedItem) => ({
        ...nestedItem,
        callback: (event: React.MouseEvent<HTMLElement>) =>
          handleChooseFrom(event, nestedItem),
      })),
    }),
  );

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();
  const open = Boolean(anchorEl);

  const handleClick = (e: any) =>
    setAnchorEl(e.currentTarget as HTMLDivElement);
  const handleClose = () => setAnchorEl(null);

  return (
    <Box className="start-application-action">
      <FormLabel className="start-application-action__label">
        Select Permit Type
      </FormLabel>
      <div className="start-application-action__control">
        <Tooltip
          className="start-application-action__input-tooltip"
          title={
            chooseFrom !== EMPTY_PERMIT_TYPE_SELECT
              ? getFormattedPermitTypeName(chooseFrom)
              : EMPTY_PERMIT_TYPE_SELECT
          }
        >
          <Button
            className={`start-application-action__input ${open && "start-application-action__input--open"} ${isError && "start-application-action__input--error"}`}
            onClick={handleClick}
          >
            <span className="start-application-action__input-text">
              {chooseFrom !== EMPTY_PERMIT_TYPE_SELECT
                ? getFormattedPermitTypeName(chooseFrom)
                : EMPTY_PERMIT_TYPE_SELECT}
            </span>
            <FontAwesomeIcon
              className="start-application__input-icon"
              icon={faChevronDown}
            />
          </Button>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          onClose={handleClose}
          open={open}
          slotProps={{
            paper: {
              className: `start-application-action__menu-container ${open && "start-application-action__menu-container--open"}`,
            },
          }}
          MenuListProps={{
            className: "start-application-action__menu-list",
          }}
        >
          {menuItems.map((item) =>
            item.items ? (
              <NestedMenuItem
                className="start-application-action__menu-item"
                label={item.label}
                parentMenuOpen={open}
                key={item.value}
                MenuProps={{
                  MenuListProps: {
                    className: "start-application-action__nested-menu-list",
                  },
                  slotProps: {
                    paper: {
                      className:
                        "start-application-action__nested-menu-container",
                    },
                  },
                }}
              >
                {item.items.map((nestedItem) => (
                  <MenuItem
                    className="start-application-action__nested-menu-item"
                    key={nestedItem.value}
                    onClick={nestedItem.callback}
                  >
                    {nestedItem.label}
                  </MenuItem>
                ))}
              </NestedMenuItem>
            ) : (
              <MenuItem key={item.label} onClick={item.callback}>
                {item.label}
              </MenuItem>
            ),
          )}
        </Menu>

        <Button
          className="start-application-action__btn"
          variant="contained"
          onClick={handleStartButtonClicked}
        >
          Start Application
        </Button>
      </div>
      {isError && (
        <span className="start-application-action__error-msg">
          Select a permit type.
        </span>
      )}
    </Box>
  );
};
