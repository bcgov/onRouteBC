import { useContext } from "react";
import {
  BCeID_USER_ROLE,
  BCeIDUserRoleType,
  IDIR_USER_ROLE,
  IDIRUserRoleType,
} from "./types";
import OnRouteBCContext from "./OnRouteBCContext";
import { useFeatureFlagsQuery } from "../hooks/hooks";

// Idir User roles
const {
  SYSTEM_ADMINISTRATOR: SA,
  CTPO,
  PPC_CLERK: PC,
  FINANCE: FIN,
  ENFORCEMENT_OFFICER: EO,
  HQ_ADMINISTRATOR: HQA,
} = IDIR_USER_ROLE;

// CV Client User roles
const { COMPANY_ADMINISTRATOR: CA, PERMIT_APPLICANT: PA } = BCeID_USER_ROLE;

const ALL_IDIR_ROLES = Object.values(IDIR_USER_ROLE);
const ALL_BCeID_ROLES = Object.values(BCeID_USER_ROLE);

/**
 * -----------------------------------------------------------------
 * ---------------- PERMISSION MATRIX MAPPINGS ---------------------
 * -----------------------------------------------------------------
 */

const MANAGE_VEHICLE_INVENTORY = {
  VIEW_VEHICLE_INVENTORY_SCREEN: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  ADD_VEHICLE: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  /**
   * Power Unit tab
   */
  VIEW_LIST_OF_POWER_UNITS: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  UPDATE_POWER_UNIT: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  DELETE_POWER_UNIT: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  /**
   * Trailer tab
   */
  VIEW_LIST_OF_TRAILERS: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  UPDATE_TRAILER: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  DELETE_TRAILER: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  /**
   * For future implementation
   */
  VEHICLE_CONFIGURATION_TAB: {},
} as const;

const MANAGE_PERMITS = {
  VIEW_PERMITS_SCREEN: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  START_APPLICATION: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  /**
   * Applications in Progress tab
   */
  VIEW_LIST_OF_APPLICATIONS_IN_PROGRESS: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  VIEW_INDIVIDUAL_APPLICATION_IN_PROGRESS_DETAILS: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  EDIT_INDIVIDUAL_APPLICATION_IN_PROGRESS_DETAILS: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  CANCEL_APPLICATION_IN_PROGRESS: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  /**
   * Applications in Review tab
   */
  VIEW_LIST_OF_APPLICATIONS_IN_REVIEW: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  VIEW_INDIVIDUAL_APPLICATION_IN_REVIEW_DETAILS: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  WITHDRAW_APPLICATION_IN_REVIEW: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  /**
   * Active Permits tab
   */
  VIEW_ACTIVE_PERMITS: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  VIEW_INDIVIDUAL_ACTIVE_PERMIT_PDF: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: ALL_IDIR_ROLES,
  },
  VIEW_PERMIT_RECEIPT: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: ALL_IDIR_ROLES,
  },
  REQUEST_PERMIT_AMENDMENT: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  /**
   * Expired Permits tab
   */
  VIEW_LIST_OF_EXPIRED_PERMITS: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  VIEW_INDIVIDUAL_EXPIRED_PERMIT_PDF: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: ALL_IDIR_ROLES,
  },
  VIEW_EXPIRED_PERMIT_RECEIPT: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: ALL_IDIR_ROLES,
  },
} as const;

const MANAGE_PROFILE = {
  /**
   * Company Information tab
   */
  VIEW_COMPANY_INFORMATION: {
    allowedBCeIDRoles: ALL_BCeID_ROLES,
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  EDIT_COMPANY_INFORMATION: {
    allowedBCeIDRoles: [CA],
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  /**
   * My Information tab
   */
  VIEW_MY_INFORMATION: {
    allowedBCeIDRoles: [CA, PA],
    allowedIDIRRoles: [],
  },
  EDIT_MY_INFORMATION: {
    allowedBCeIDRoles: [CA, PA],
    allowedIDIRRoles: [],
  },
  /**
   * User Management tab
   */
  VIEW_USER_MANAGEMENT_SCREEN: {
    allowedBCeIDRoles: [CA],
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  ADD_USER: {
    allowedBCeIDRoles: [CA],
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  REMOVE_USER: {
    allowedBCeIDRoles: [CA],
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  EDIT_USER: {
    allowedBCeIDRoles: [CA],
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  /**
   * Special Authorization tab
   */
  VIEW_SPECIAL_AUTHORIZATIONS: {
    allowedBCeIDRoles: [CA, PA],
    allowedIDIRRoles: [],
  },
  VIEW_LOA: {
    allowedBCeIDRoles: [CA, PA],
    allowedIDIRRoles: [],
  },
  /**
   * Credit Account Tab
   */
  /**
   * View Credit Account tab - Account holder
   * Comment: Account number, status
   */
  VIEW_CREDIT_ACCOUNT_TAB_ACCOUNT_HOLDER: {
    allowedBCeIDRoles: [CA],
  },
  /**
   * View Credit Account users - Account holder
   */
  VIEW_CREDIT_ACCOUNT_USERS_ACCOUNT_HOLDER: {
    allowedBCeIDRoles: [CA],
  },
  /**
   * View Credit Account details - Account holder
   * Comment: Credit Limit/Current Balance/Available Credit
   */
  VIEW_CREDIT_ACCOUNT_DETAILS_ACCOUNT_HOLDER: {
    allowedBCeIDRoles: [CA],
  },
} as const;

const MANAGE_SETTINGS = {
  /**
   * Special Authorizations Tab
   */
  VIEW_SPECIAL_AUTHORIZATIONS: { allowedIDIRRoles: ALL_IDIR_ROLES },
  ADD_NO_FEE_FLAG: { allowedIDIRRoles: [SA, HQA] },
  UPDATE_NO_FEE_FLAG: { allowedIDIRRoles: [SA, HQA] },
  ADD_LCV_FLAG: { allowedIDIRRoles: [SA, HQA] },
  REMOVE_LCV_FLAG: { allowedIDIRRoles: [SA, HQA] },
  ADD_AN_LOA: { allowedIDIRRoles: [SA, HQA] },
  EDIT_AN_LOA: { allowedIDIRRoles: [SA, HQA] },
  VIEW_LOA: { allowedIDIRRoles: ALL_IDIR_ROLES },
  REMOVE_LOA: { allowedIDIRRoles: [SA, HQA] },

  /**
   * Credit Account Tab
   */
  /**
   * View Credit Account tab - Account Holder
   * Comment: Account number, status
   */
  VIEW_CREDIT_ACCOUNT_TAB_ACCOUNT_HOLDER: {
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  /**
   * View Credit Account Users - Account Holder
   */
  VIEW_CREDIT_ACCOUNT_USERS_ACCOUNT_HOLDER: {
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  /**
   * Manage Credit Account Users - Account Holder
   * Comment: Add/remove users
   */
  MANAGE_CREDIT_ACCOUNT_USERS_ACCOUNT_HOLDER: { allowedIDIRRoles: [FIN] },
  /**
   * View Credit Account Details - Account Holder
   * Comment: Credit Limit/Current Balance/Available Credit
   */
  VIEW_CREDIT_ACCOUNT_DETAILS_ACCOUNT_HOLDER: {
    allowedIDIRRoles: [SA, FIN, HQA],
  },
  /**
   * Perform Credit Account Detail actions - Account Holder
   *
   * Comment: Hold, Close, Remove Hold, Reopen Credit Account,
   * update credit account - available actions vary depending on
   * account state (see spec/hifi for details)
   */
  PERFORM_CREDIT_ACCOUNT_DETAIL_ACTIONS_ACCOUNT_HOLDER: {
    allowedIDIRRoles: [FIN],
  },
  /**
   * View Hold/Close History - Account Holder
   */
  VIEW_HOLD_OR_CLOSE_HISTORY_ACCOUNT_HOLDER: { allowedIDIRRoles: [FIN] },

  /**
   * View Credit Account tab - Account User
   * Comment: Account number, status
   */
  VIEW_CREDIT_ACCOUNT_TAB_ACCOUNT_USER: {
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  /**
   * View Credit Account Users - Account User
   */
  VIEW_CREDIT_ACCOUNT_USERS_ACCOUNT_USER: {
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  /**
   * View Credit Account Details - Account User
   * Comment: Credit Limit/Current Balance/Available Credit
   */
  VIEW_CREDIT_ACCOUNT_DETAILS_ACCOUNT_USER: {
    allowedIDIRRoles: [SA, FIN, HQA],
  },
  /**
   * View Credit Account tab - Non-Holder/user
   * Comment: Info box
   *
   * Todo: ORV2-2771 Implement info box.
   */
  VIEW_CREDIT_ACCOUNT_TAB_NON_HOLDER_OR_USER: {
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  /**
   * Add Credit Account - Non-Holder/user
   */
  ADD_CREDIT_ACCOUNT_NON_HOLDER_OR_USER: { allowedIDIRRoles: [FIN] },

  /**
   * Suspend tab
   */
  VIEW_SUSPEND_COMPANY_INFO: {
    allowedIDIRRoles: [SA, FIN, CTPO, EO],
  },
  UPDATE_SUSPEND_COMPANY_FLAG: {
    allowedIDIRRoles: [SA, FIN, CTPO],
  },
} as const;

const STICKY_SIDE_BAR = {
  VIEW_STICKY_SIDE_BAR: {
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  HOME_BUTTON: {
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  REPORTS_BUTTON: {
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  MANAGE_PPC_USERS_BUTTON: {
    allowedIDIRRoles: [SA],
  },
} as const;

const MANAGE_PPC_USERS = {
  VIEW_MANAGE_PPC_USERS_SCREEN: { allowedIDIRRoles: [SA] },
  UPDATE_PPC_USER_ROLE: { allowedIDIRRoles: [SA] },
  REMOVE_PPC_USER: { allowedIDIRRoles: [SA] },
  MANAGE_PPC_USERS_BUTTON: { allowedIDIRRoles: [SA] },
} as const;

const REPORTS = {
  PAYMENT_AND_REFUND_SUMMARY_REPORT: {
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  PAYMENT_AND_REFUND_DETAIL_REPORT: {
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
  /**
   * There are some nuances with the permissions:
   * - Permit clerks can only run for their own user;
   * - SA/FIN/HQA can run for all users
   *
   * These are data-oriented filters that only the implementing component
   * takes care of. It cannot be sufficiently designed for here.
   */
} as const;

const GLOBAL_SEARCH = {
  VIEW_GLOBAL_SEARCH_SCREEN: {
    allowedIDIRRoles: ALL_IDIR_ROLES,
  },
  SEARCH_FOR_VEHICLE: {
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  SEARCH_FOR_COMPANY: {
    allowedIDIRRoles: ALL_IDIR_ROLES,
  },
  DELETE_COMPANY: {
    allowedIDIRRoles: [SA],
  },
  MERGE_COMPANY: {
    allowedIDIRRoles: [SA],
  },
  CREATE_COMPANY: {
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  /** Search for Active Permit */
  SEARCH_FOR_ACTIVE_PERMIT: {
    allowedIDIRRoles: ALL_IDIR_ROLES,
  },
  AMEND_PERMIT: { allowedIDIRRoles: [PC, SA, CTPO] },
  VOID_PERMIT: { allowedIDIRRoles: [SA] },
  REVOKE_PERMIT: { allowedIDIRRoles: [SA] },
  RESEND: { allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA] },

  /** Search for Inactive Permit */
  SEARCH_FOR_INACTIVE_PERMIT: { allowedIDIRRoles: [PC, SA, CTPO, EO] },
  SEARCH_FOR_APPLICATION: { allowedIDIRRoles: [PC, SA, CTPO] },
} as const;

/**
 * Application review queue on staff home screen
 */
const STAFF_HOME_SCREEN = {
  VIEW_QUEUE: { allowedIDIRRoles: [PC, SA, CTPO] },
  MANAGE_QUEUE: { allowedIDIRRoles: [PC, SA, CTPO] },
} as const;

const MISCELLANEOUS = {
  VIEW_SHOPPING_CART: {
    allowedBCeIDRoles: [CA, PA],
    allowedIDIRRoles: [PC, SA, CTPO],
  },
  /**
   * The following are already controlled by API.
   * So, frontend needs no implementation for this.
   */
  /**
   * - sees own created applications
   * - sees applications from whole company
   * - sees IDIR-created applications
   */

  // Add this in permissions matrix document.
  STAFF_ACT_AS_COMPANY: {
    allowedIDIRRoles: [PC, SA, FIN, CTPO, HQA],
  },
} as const;

/**
 * All the permissions in the file are directly based off of the confluence page.
 * @link https://confluence.th.gov.bc.ca/x/kwY3C
 *
 * @description All the keys and comments are identical to the feature keys used
 * in the permissions matrix document so that cross-verifying is easy.
 *
 * Note that this is a general structure for permissions as specified in the document.
 * Individual features may need custom checks based on data or API calls
 * and they are not in scope for this implementation.
 */
export const PERMISSIONS_MATRIX = {
  MANAGE_VEHICLE_INVENTORY: MANAGE_VEHICLE_INVENTORY,
  MANAGE_PERMITS: MANAGE_PERMITS,
  MANAGE_PROFILE: MANAGE_PROFILE,
  MANAGE_SETTINGS: MANAGE_SETTINGS,
  STICKY_SIDE_BAR: STICKY_SIDE_BAR,
  MANAGE_PPC_USERS: MANAGE_PPC_USERS,
  REPORTS: REPORTS,
  GLOBAL_SEARCH: GLOBAL_SEARCH,
  STAFF_HOME_SCREEN: STAFF_HOME_SCREEN,
  MISCELLANEOUS: MISCELLANEOUS,
} as const;

/**
 * -----------------------------------------------------------------
 * -------------------------- END OF -------------------------------
 * ---------------- PERMISSION MATRIX MAPPINGS ---------------------
 * -----------------------------------------------------------------
 */

export type PermissionConfigType = {
  /**
   * The feature flag to check if the feature is enabled.
   * If provided, it takes the highest priority.
   *
   * If a feature is not enabled,
   * the component **WILL NOT** render regardless of other conditions.
   */
  featureFlag?: string;
  /**
   * The permission matrix keys for looking up the allowed roles.
   */
  permissionMatrixKeys?: PermissionMatrixKeysType;
  /**
   * An additional function call whose boolean value will be accounted
   * for determining whether to render a component.
   * i.e., this function will be called the last after other conditions
   * have succeeded.
   *
   * @param args Any arguments to be passed.
   * @returns A boolean.
   */
  additionalConditionToCheck?: (...args: any) => boolean;
};

/**
 * The permission matrix config props.
 */
export type PermissionMatrixConfigObject = {
  /**
   * The idir roles that are allowed to see the component.
   *
   * If the user has one of the specified roles,
   * the component will render.
   */
  allowedIDIRRoles?: readonly IDIRUserRoleType[];

  /**
   * The bceid roles that are allowed to see the component.
   *
   * If the user has one of the specified roles,
   * the component will render.
   */
  allowedBCeIDRoles?: readonly BCeIDUserRoleType[];
};

/**
 * The type for features and functions in Permission Matrix.
 */
export type PermissionMatrixKeysType = {
  [K in keyof typeof PERMISSIONS_MATRIX]: {
    /**
     * The name of the feature as defined in the Feature column in the matrix
     * document.
     */
    permissionMatrixFeatureKey: K;
    /**
     * The name of the function as defined in the Function column in the matrix
     * document.
     */
    permissionMatrixFunctionKey: keyof (typeof PERMISSIONS_MATRIX)[K];
  };
}[keyof typeof PERMISSIONS_MATRIX];

/**
 * A hook to manage the permissions matrix for various features and user roles.
 *
 * @param {Object} config - Configuration object for the permission matrix.
 *
 * Priority 1
 * @param {string} [config.featureFlag] - Feature flag key to check if the feature is enabled.
 *
 * Priority 2
 * @param {string} [config.permissionMatrixFeatureKey] - The major feature that's the primary key in {@link PERMISSIONS_MATRIX}.
 * @param {string} [config.permissionMatrixFunctionKey] - The function that's the nested key in {@link PERMISSIONS_MATRIX}.
 *
 * Priority 3
 * @param {Function} [config.additionalConditionToCheck] - Additional custom condition to call if the basic conditions are met.
 *
 * @returns {boolean} - Returns whether the current user has the permission.
 */
export const usePermissionMatrix = ({
  featureFlag,
  permissionMatrixKeys,
  additionalConditionToCheck,
}: PermissionConfigType): boolean => {
  const { userDetails, idirUserDetails } = useContext(OnRouteBCContext);
  const { data: featureFlags } = useFeatureFlagsQuery();
  const isIdir = Boolean(idirUserDetails?.userRole);

  // If featureFlag is given, exit if it is not enabled.
  if (featureFlag) {
    if (featureFlags?.[featureFlag] !== "ENABLED") {
      return false;
    }
  }
  let isAllowed = false;
  if (permissionMatrixKeys) {
    isAllowed = checkPermissionMatrix({
      permissionMatrixKeys,
      isIdir,
      currentUserRole: isIdir
        ? (idirUserDetails?.userRole as IDIRUserRoleType)
        : (userDetails?.userRole as BCeIDUserRoleType),
    });
  }
  if (isAllowed && additionalConditionToCheck) {
    isAllowed = isAllowed && additionalConditionToCheck();
  }
  return isAllowed;
};

/**
 * Checks if the current user has the necessary permissions based on the provided
 * permission matrix keys, user role, and whether the user is an IDIR user or not.
 *
 * @param {Object} params - Parameters for the permission matrix check.
 * @param {PermissionMatrixKeysType} params.permissionMatrixKeys - The keys to use for looking up in the permissions matrix.
 * @param {boolean} params.isIdir - Boolean indicating whether the current user is an IDIR user.
 * @param {BCeIDUserRoleType | IDIRUserRoleType} params.currentUserRole - The role of the current user.
 *
 * @returns {boolean} - Returns whether the user is allowed to access the resource.
 */
export const checkPermissionMatrix = ({
  permissionMatrixKeys,
  isIdir,
  currentUserRole,
}: {
  permissionMatrixKeys: PermissionMatrixKeysType;
  isIdir: boolean;
  currentUserRole: BCeIDUserRoleType | IDIRUserRoleType;
}) => {
  let isAllowed: boolean;
  const { permissionMatrixFeatureKey, permissionMatrixFunctionKey } =
    permissionMatrixKeys;
  const { allowedBCeIDRoles, allowedIDIRRoles } = (
    PERMISSIONS_MATRIX[permissionMatrixFeatureKey] as {
      [key: string]: PermissionMatrixConfigObject;
    }
  )[permissionMatrixFunctionKey];
  if (isIdir) {
    isAllowed = Boolean(
      currentUserRole &&
        allowedIDIRRoles?.includes(currentUserRole as IDIRUserRoleType),
    );
  } else {
    isAllowed = Boolean(
      currentUserRole &&
        allowedBCeIDRoles?.includes(currentUserRole as BCeIDUserRoleType),
    );
  }
  return isAllowed;
};
