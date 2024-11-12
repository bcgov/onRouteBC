import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { useState, useCallback, MouseEvent } from "react";

import "./OnRouteBCTableRowActions.scss";

/**
 * A reusable component meant to be used in table components for row actions.
 */
export const OnRouteBCTableRowActions = ({
  onSelectOption,
  options,
  disabled = false,
}: {
  onSelectOption: (selectedOption: string) => void;
  options: {
    label: string;
    value: string;
  }[];
  disabled?: boolean;
}) => {
  // Used to determine the anchor element to position the actions menu to
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const actionsButtonPressedClassName = isMenuOpen
    ? " onroutebc-table-row-actions__button--pressed"
    : "";

  const handleOpenActionsMenu = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const handleCloseActionsMenu = () => {
    setAnchorEl(null);
  };

  const onClickOption = (event: MouseEvent<HTMLElement>) => {
    const selectedOption = event.currentTarget.dataset.optionValue as string;
    onSelectOption(selectedOption);
    setAnchorEl(null);
  };

  return (
    <>
      {
        // if there are no options, return null to prevent returning an empty menu
        options.length > 0 ? (
          <div className="onroutebc-table-row-actions">
            <Tooltip
              title="Actions"
              classes={{
                popper: "popper onroutebc-table-row-actions__popper",
                tooltip: "tooltip",
                tooltipPlacementBottom: "tooltip--bottom",
              }}
            >
              <IconButton
                className={`onroutebc-table-row-actions__button ${actionsButtonPressedClassName}`}
                classes={{
                  disabled: "onroutebc-table-row-actions__button--disabled",
                }}
                aria-label="Actions"
                id="actions-button"
                aria-controls={isMenuOpen ? "actions-menu" : undefined}
                aria-expanded={isMenuOpen ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleOpenActionsMenu}
                disabled={disabled}
              >
                <FontAwesomeIcon
                  icon={faEllipsisVertical}
                  className="onroutebc-table-row-actions__icon"
                />
              </IconButton>
            </Tooltip>

            <Menu
              className="onroutebc-table-row-actions__menu"
              id="actions-menu"
              MenuListProps={{
                "aria-labelledby": "actions-button",
              }}
              anchorEl={anchorEl}
              anchorOrigin={{
                horizontal: "right",
                vertical: "bottom",
              }}
              transformOrigin={{
                horizontal: "right",
                vertical: "top",
              }}
              open={isMenuOpen}
              onClose={handleCloseActionsMenu}
              slotProps={{
                paper: {
                  className: "onroutebc-table-row-actions__paper",
                },
              }}
            >
              {options.map((option) => (
                <MenuItem
                  key={`option-${option.value}`}
                  className="onroutebc-table-row-actions__menu-item"
                  onClick={onClickOption}
                  data-option-value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Menu>
          </div>
        ) : null
      }
    </>
  );
};
