import {
  IDIR_USER_ROLE,
  IDIRUserRoleType,
} from "../../../common/authentication/types";
import { Optional } from "../../../common/types/common";

const allowableRolesForApplicationQueue: IDIRUserRoleType[] = [
  IDIR_USER_ROLE.CTPO,
  IDIR_USER_ROLE.PPC_CLERK,
  IDIR_USER_ROLE.SYSTEM_ADMINISTRATOR,
];

export const canViewApplicationQueue = (userRole: Optional<IDIRUserRoleType>) =>
  allowableRolesForApplicationQueue.includes(userRole as IDIRUserRoleType);
