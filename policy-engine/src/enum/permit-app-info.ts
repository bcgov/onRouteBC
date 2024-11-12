/**
 * This enum represents a subset of commonly-used paths and
 * other information in permit applications which may be
 * referenced from within source code.
 */
export enum PermitAppInfo {
  PermitType = 'permitType',
  PermitData = 'permitData',
  PermitStartDate = '$.startDate',
  PermitDateFormat = 'YYYY-MM-DD',
  CompanyName = '$.companyName',
  PermitDuration = '$.permitDuration',
  PowerUnitType = '$.vehicleDetails.vehicleSubType',
  TrailerList = '$.vehicleConfiguration.trailers',
  Commodity = '$.permittedCommodity.commodityType',
}
