import * as React from "react";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Stack from "@mui/material/Stack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

import { VEHICLES_ROUTES, withCompanyId } from "../../../../routes/constants";
import { VEHICLE_TYPES, VehicleType } from "../../types/Vehicle";

/**
 *
 * Code taken largely from MUI MenuList Composition
 * https://mui.com/material-ui/react-menu/#menulist-composition
 *
 *
 */
export const AddVehicleButton = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const options = [
    {
      vehicleMode: VEHICLE_TYPES.POWER_UNIT,
      labelValue: "Power Unit",
    },
    {
      vehicleMode: VEHICLE_TYPES.TRAILER,
      labelValue: "Trailer",
    },
  ];

  const handleToggle = () => {
    setIsMenuOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current?.contains(event.target as HTMLElement)) {
      return;
    }

    setIsMenuOpen(false);
  };
  const navigate = useNavigate();

  const handleMenuItemClick = (
    _event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    _index: number,
    vehicleMode: VehicleType,
  ) => {
    if (vehicleMode === VEHICLE_TYPES.POWER_UNIT) {
      navigate(withCompanyId(VEHICLES_ROUTES.ADD_POWER_UNIT));
    } else if (vehicleMode === VEHICLE_TYPES.TRAILER) {
      navigate(withCompanyId(VEHICLES_ROUTES.ADD_TRAILER));
    }

    setIsMenuOpen(false);
  };

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
      setIsMenuOpen(false);
    } else if (event.key === "Escape") {
      setIsMenuOpen(false);
    }
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(isMenuOpen);
  React.useEffect(() => {
    if (prevOpen.current === true && isMenuOpen === false) {
      // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
      anchorRef.current!.focus();
    }

    prevOpen.current = isMenuOpen;
  }, [isMenuOpen]);

  return (
    <Stack direction="row" spacing={2}>
      <div>
        <Button
          ref={anchorRef}
          id="composition-button"
          variant="contained"
          aria-controls={isMenuOpen ? "composition-menu" : undefined}
          aria-expanded={isMenuOpen ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          Add Vehicle{" "}
          <FontAwesomeIcon className="dash-downarrow" icon={faChevronDown} />
        </Button>
        <Popper
          open={isMenuOpen}
          anchorEl={anchorRef.current}
          role={undefined}
          placement="bottom-end"
          transition
          disablePortal
          sx={{ zIndex: 5 }} // Show above all other elements
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom-start" ? "left top" : "left bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={isMenuOpen}
                    id="composition-menu"
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                  >
                    {options.map((option, index) => {
                      const { vehicleMode, labelValue } = option;
                      return (
                        <MenuItem
                          key={vehicleMode}
                          onClick={(event) =>
                            handleMenuItemClick(event, index, vehicleMode)
                          }
                        >
                          {labelValue}
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </Stack>
  );
};
