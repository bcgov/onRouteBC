import * as fs from 'fs';
import { parse } from 'csv-parse';
import { completePolicyConfig } from '../_test/policy-config/complete-in-progress.sample';
import { Policy } from '../policy-engine';
import { getIdFromName } from '../helper/lists.helper';
import { RegionSizeOverride, SizeDimension, TrailerSize } from '../types';

type DimensionEntry = {
  commodity: string;
  powerUnit: string;
  trailer: TrailerSize;
};

enum ColumnNumbers {
  NoSelfIssue = 0,
  Commodity = 1,
  PowerUnit = 2,
  Trailer = 3,
  AllowJeep = 4,
  AllowBooster = 5,
  FirstWidth = 6,
  DefaultWidth = 15,
  FrontProjection = 18,
  RearProjection = 19,
}

function csvRowToObject(
  row: Array<string>,
  pol: Policy,
): DimensionEntry | null {
  const commodityId = getIdFromName(
    pol.policyDefinition.commodities,
    row[ColumnNumbers.Commodity],
  );
  const puId = getIdFromName(
    pol.policyDefinition.vehicleTypes.powerUnitTypes,
    row[ColumnNumbers.PowerUnit].trim(),
  );
  const trId = getIdFromName(
    pol.policyDefinition.vehicleTypes.trailerTypes,
    row[ColumnNumbers.Trailer].trim(),
  );
  let entryObject: DimensionEntry | null = null;
  if (commodityId && puId && trId) {
    entryObject = {
      commodity: commodityId,
      powerUnit: puId,
      trailer: {
        type: trId,
        jeep: row[ColumnNumbers.AllowJeep] == 'X' || row[ColumnNumbers.AllowJeep] == 'x',
        booster: row[ColumnNumbers.AllowBooster] == 'X' || row[ColumnNumbers.AllowBooster] == 'x',
        selfIssue: row[ColumnNumbers.NoSelfIssue] != 'X' && row[ColumnNumbers.NoSelfIssue] != 'x',
      },
    };

    const sizeDimension: SizeDimension = {};

    const fp = parseFloat(row[ColumnNumbers.FrontProjection]);
    const rp = parseFloat(row[ColumnNumbers.RearProjection]);
    if (!isNaN(fp)) {
      sizeDimension.fp = fp;
    }
    if (!isNaN(rp)) {
      sizeDimension.rp = rp;
    }

    // Populate the BC Default dimensions
    const bcWidth = parseFloat(row[ColumnNumbers.DefaultWidth]);
    const bcHeight = parseFloat(row[ColumnNumbers.DefaultWidth + 1]);
    const bcLength = parseFloat(row[ColumnNumbers.DefaultWidth + 2]);
    if (!isNaN(bcWidth)) sizeDimension.w = bcWidth;
    if (!isNaN(bcHeight)) sizeDimension.h = bcHeight;
    if (!isNaN(bcLength)) sizeDimension.l = bcLength;

    const regionIds: Array<string> = ['LMN', 'KTN', 'PCE'];
    // Populate the 3 region dimensions
    for (let i = 0; i < regionIds.length; i++) {
      const w = parseFloat(row[ColumnNumbers.FirstWidth + i * 3]);
      const h = parseFloat(row[ColumnNumbers.FirstWidth + 1 + i * 3]);
      const l = parseFloat(row[ColumnNumbers.FirstWidth + 2 + i * 3]);
      if (
        (isNaN(w) || w == sizeDimension.w) &&
        (isNaN(h) || h == sizeDimension.h) &&
        (isNaN(l) || l == sizeDimension.l)
      ) {
        // All values for this region are empty or are the
        // same as the BC default values. In this case do not
        // include the region in the configuration at all
        continue;
      }

      if (!sizeDimension.regions) {
        sizeDimension.regions = [];
      }

      const regionOverride: RegionSizeOverride = { region: regionIds[i] };
      if (!isNaN(w) && w != sizeDimension.w) regionOverride.w = w;
      if (!isNaN(h) && h != sizeDimension.h) regionOverride.h = h;
      if (!isNaN(l) && l != sizeDimension.l) regionOverride.l = l;
      sizeDimension.regions.push(regionOverride);
    }

    entryObject.trailer.sizeDimensions = [];
    entryObject.trailer.sizeDimensions.push(sizeDimension);

    return entryObject;
  } else {
    console.log(
      `No entry in policy config for commodity '${row[ColumnNumbers.Commodity]}' and/or power unit '${row[ColumnNumbers.PowerUnit]}' and/or trailer '${row[ColumnNumbers.Trailer]}'`,
    );
    return null;
  }
}

const policy = new Policy(completePolicyConfig);
policy.policyDefinition.commodities.forEach((c) => {
  // Remove each size property from the commodity, will
  // be replaced wholesale with the new size. If the configuration
  // is not present in the new input, it should be deleted.
  if (c.size) delete c.size;
});

function processCsvRow(row: any) {
  const dimensionEntry = csvRowToObject(row, policy);
  if (dimensionEntry) {
    const commodity = policy.getCommodityDefinition(dimensionEntry.commodity);
    if (commodity) {
      // Update the list of power units
      if (!commodity.size) {
        commodity.size = { powerUnits: [] };
      }

      // Get or create power unit entry
      let powerUnit = commodity.size.powerUnits?.find(
        (pu) => pu.type == dimensionEntry.powerUnit,
      );
      if (!powerUnit) {
        // We don't have this power unit yet, create it
        powerUnit = {
          type: dimensionEntry.powerUnit,
          trailers: [],
        };
        commodity.size.powerUnits?.push(powerUnit);
      }

      const trailer = powerUnit.trailers.find(
        (tr) => tr.type == dimensionEntry.trailer.type,
      );
      if (!trailer) {
        // Create the trailer in configuration
        powerUnit.trailers.push(dimensionEntry.trailer);
      } else {
        console.log(
          `*** Duplicate trailer '${trailer.type}' in input for power unit '${powerUnit.type}'`,
        );
      }
    }
  }
}

fs.createReadStream('./Single Trip Oversize Dimension Set.csv')
  .pipe(parse({ delimiter: ',', from_line: 3 }))
  .on('data', function (row) {
    processCsvRow(row);
  })
  .on('end', function () {
    console.log(
      JSON.stringify(policy.policyDefinition.commodities, null, '  '),
    );
    //console.log(JSON.stringify(policy.policyDefinition));
  });
