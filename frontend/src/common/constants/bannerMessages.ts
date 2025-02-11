import { TOLL_FREE_NUMBER } from "./constants";

export const BANNER_MESSAGES = {
  COMPANY_CONTACT:
    "The Company Primary Contact will be contacted for all onRouteBC client profile queries.",
  ALL_FIELDS_MANDATORY:
    "Please note, unless stated otherwise, all fields are mandatory.",
  PERMIT_SEND_TO:
    "The permit will be sent to the email on your onRouteBC Company Information, in addition to any email listed below.",
  PERMIT_REFUND_REQUEST: `Refunds and amendments can be requested over the phone by calling the Provincial Permit Centre at Toll-free: ${TOLL_FREE_NUMBER}. Please have your permit number ready.`,
  POLICY_REMINDER:
    "The applicant is responsible for ensuring they are following Legislation, policies, standards and guidelines in the operation of a commercial transportation business in British Columbia.",
  CANNOT_FIND_VEHICLE: {
    TITLE: "Can't find a vehicle from your inventory?",
    DETAIL:
      "Your vehicle may not be available in a permit application because it cannot be used for the type of permit you are applying for.",
    INELIGIBLE_SUBTYPES:
      "If you are creating a new vehicle, a desired Vehicle Sub-Type may not be available because it is not eligible for the permit application you are currently in.",
  },
  ISSUED_PERMIT_NUMBER_7_YEARS:
    "Enter any Permit No. issued to the above Client No. in the last 7 years",
  SELECT_VEHICLES_LOA:
    "Only vehicles in the Vehicle Inventory can be designated to LOA(s).",
  SELECT_VEHICLES_LOA_INFO:
    "If you do not see the vehicle(s) you wish to designate here, please make sure you add them to the client's Vehicle Inventory first and come back to this page.",
  FIND_LOA_DETAILS:
    "To find details about the LOA go to the Special Authorizations page.",
  LOA_VEHICLE_CANNOT_BE_EDITED_IN_PERMIT:
    "Vehicle details cannot be edited in the permit application if you are using an LOA.",
  REJECTED_APPLICATIONS:
    "Rejected applications appear in Applications in Progress.",
  APPLICATION_NOTES:
    "Application notes can provide additional details to the Provincial Permit Centre when submitting a permit application for review.",
  APPLICATION_NOTES_EXAMPLE: "e.g. Use the credit account for payment.",
  APPLICATION_NOTES_INFO:
    "Application notes will not appear on the permit document.",
  HIGHWAY_SEQUENCES: {
    TITLE: "The sequence of highways should be in order of travel.",
    EXAMPLE:
      "e.g. If the origin is Victoria, BC and the destination is Hope, BC, the sequence of highways travelled in order will be 17 1 3.",
  },
  TOTAL_DISTANCE:
    "The total distance, in km, is the distance that will be travelled within BC (or from/to BC border). This is to include the return trip distance.",
  BRIDGE_FORMULA_CALCULATION_TOOL:
    "This tool only calculates Bridge Formula, which is a mathematical equation that is used to calculate the maximum allowable weight allowed by permit for various axle groups in a combination. This tool is not confirming compliance with the CTR or CTPM.\n\nThe image on the right is for illustration purposes only.",
};
