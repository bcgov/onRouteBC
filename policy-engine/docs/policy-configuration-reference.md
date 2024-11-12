# Policy Configuration Reference

## Configuration File Structure
Policy rules are defined in the policy configuration JSON object. Rules include checks for validating permit applications against policy, as well as definitions of all permit types, commodity types, vehicle types, vehicle combinations, and permittable dimensions (weight, size, allowable distances, etc.)

The JSON configuration structure is described by TypeScript types, starting with types/PolicyDefinition. The reference below goes into more detail about what each of the properties is intended to express.

### Current configuration properties in use
The below properties (link for more details) are used by the current version of the policy engine.

* [geographicRegions](#geographicRegions)
* [permitTypes](#permitTypes)
* [commonRules](#commonRules)
* [vehicleTypes](#vehicleTypes)
* [commodities](#commodities)

### Configuration properties for future use
The below properties (link for more details) are for __potential__ future use of the policy engine, and are listed in this documentation for completeness but should not be relied on yet.

* [version](#version)
* [globalWeightDefaults](#globalWeightDefaults)
* [globalSizeDefaults](#globalSizeDefaults)
* [vehicleCategories](#vehicleCategories)
* [rangeMatrices](#rangeMatrices)

## Current Configuration Properties

### geographicRegions
The geographicRegions property defines all of the distinct regions in the province which may have unique policy rules. For example, a vehicle travelling through the Peace region may have different permittable size dimensions than a vehcicle travelling through Lower Mainland.

Geographic regions are __not__ used when validating permits which do not require routing (e.g. term oversize permits).

The spatial geometry of the region itself is not stored in the policy configuration; rather, the regions travelled are returned along with the generated route from the external route planner API. The route planner maintains the link between roads and geographic regions which the policy configuration relies on.

When applying for a permit which requires a route (such as a single trip oversize) the permit applicant will enter their start and destination locations. The external route planner will generate a route appropriate for the vehicle, and will return that route along with the list of all geographic regions the route crosses.

The structure of the geographicRegions is as follows:

```js
  geographicRegions: [
    {
      id: 'LMN',
      name: 'Lower Mainland',
    },
    {
      id: 'KTN',
      name: 'Kootenay',
    },
    {
      id: 'PCE',
      name: 'Peace',
    },
  ]
```
Another 'pseudo' geographic region exists which is every area of the province __not__ covered by one of the other named regions. This 'pseudo' region is typically called 'BC Default' but is not explicitly configured as its own region, though it can have its own set of permittable sizes and weights. See the [commodities](#commodities) section below for details on configuring dimensions for BC Default.

> [!NOTE]
> The IDs assigned to the geographic regions are arbitrary, they need only be unique. When onRouteBC integrates with the route planner, the geographic region IDs may need to be modified to align with the IDs as returned by the route planner API. Alternately, a separate `key` property may be added for this purpose in future.

### permitTypes
The permitTypes property defines the rules and properties of all the known permit types. The basic structure is:

```js
  permitTypes: [
    {
      id: 'TROS',
      name: 'Term Oversize',
      routingRequired: false,
      weightDimensionRequired: false,
      sizeDimensionRequired: false,
      commodityRequired: false,
      allowedVehicles: [
        'EXPANDO',
        'FEBGHSE',
        'TRKTRAC',
      ],
      rules: [
        // ...see rules section...
      ],
      costRules: [
        //...see cost rules section...
      ],
    }
```
Properties of the permit type define whether it requires a driving route, weights, size, and commodity. The term oversize example above does not require any of these. A complex permit such as single trip oversize overweight would require all four.

The `allowedVehicles` property is required for permit types that are for a single vehicle as opposed to for a vehicle combination (truck and trailers). For permits requiring a vehicle combination such as single trip oversize, the `allowedVehicles` property is not used, instead using configuration inside the commodity property, described in its own section below.

The `rules` property defines policy rules for the permit type that will be checked during permit validation. There will be many rules for a single permit type, expressing business policy such as 'you may not apply for a permit with a start date in the past', 'the vehicle type being permitted must be one of the allowed vehicles for the permit type', 'a vehicle identification number must be 6 alphanumeric characters', and others. Rules are expressed using the syntax defined by [JSON Rules Engine](https://github.com/cachecontrol/json-rules-engine). See the separate section on [rules](#rules) in this document.

`costRules` are a special type of rule that define how much a permit costs based on the permit itself. Costs can take into account any property of the permit application such as duration, travel distance, start date, vehicle type, and others. See the separate section on [costRules](#costRules) in this document to understand how they differ from standard [JSON Rules Engine](https://github.com/cachecontrol/json-rules-engine) rules.

### commonRules
`commonRules` are a collection of standard rules which apply to all permit types. Certain rules such as the requirement to supply a company name for the permit and the requirement to supply a license plate for the permitted vehicle can be configured in this central location. All rules in the `commonRules` array will be validated against any permit in the validation step.

The basic structure is straightforward, and uses the same rule definition format as the rules defined as part of the permit type.
```js
  commonRules: [
    // ...see rules section...
  ]
```

### vehicleTypes
The `vehicleTypes` property defines all of the known vehicle types, both power units and trailers. The basic structure is:

```js
  vehicleTypes: {
    powerUnitTypes: [
      {
        id: 'BUSCRUM',
        name: 'Buses/Crummies',
        category: 'powerunit',
      },
      {
        id: 'BUSTRLR',
        name: 'Inter-City Bus (Pulling Pony Trailer)',
        category: 'powerunit',
      }
    ],
    trailerTypes: [
      {
        id: 'BOOSTER',
        name: 'Boosters',
        category: 'accessory',
      },
      {
        id: 'DBTRBTR',
        name: 'Tandem/Tridem Drive B-Train (Super B-Train)',
        category: 'trailer',
      },
    ],
  ]
```
The example above defines 2 types of power unit and 2 types of trailer that the system knows about. The full configuration will contain all known vehicle types and will be much larger.

The ID for a vehicle type must be unique in the configuration; that is, a power unit and trailer may not share the same ID.

> [!NOTE]
> Power unit and trailer types both have a `category` property which is not currently used by the policy engine but will be used for overweight permits when they are developed (different weight allowances when a booster follows a specific category of trailer, for example).

### commodities
The `commodities` property defines all of the known permittable commodities. In addition to the ID and common name of the commodity, this property defines the allowable vehicle combinations that are allowed to transport the commodity, along with the allowable size and weight of the vehicles. Permittable sizes and weights are configured under `commodities` instead of under `vehicleTypes` because the permittable sizes and weights are dependent on the commodity being carried.

Here is an example of a single commodity configured in a policy configuration JSON:
```js
  commodities: [
    {
      id: 'IMCONTN',
      name: 'Intermodal Containers',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'STACTRN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 2.9,
                    l: 27.5,
                  },
                ],
              },
              {
                type: 'STBTRAN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    h: 4.4,
                    l: 27.5,
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    h: 4.4,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                        l: 36,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    h: 4.4,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ]
```
> [!NOTE]
> The values above do not reflect actual policy, they are for demonstration purposes only.

#### Size Dimension Set
Size dimensions for a given commodity and vehicle combination are configured in the `size` property of the commodity.

In the example above, the commodity 'Intermodal Containers' has permittable size dimensions configured. There are two size permittable power unit types for this commodity (TRKTRAC and REGTRCK), with TRKTRAC permitted to pull one of 3 different trailer types. REGTRCK is permitted only to pull the trailer 'NONEXXX', which is a special ID indicating no trailer is being pulled. TODO: link to documentation about 'pseudo' vehicle types and commodity types.

> [!NOTE]
> Vehicles in the size dimension set are referenced by type. The type must match an ID configured in the `vehicleTypes` property of the policy configuration as a relational data key.

Size dimensions are configured exclusively on trailers, never on power units. For power units that may be permitted with or without trailers, the special pseudo trailer 'NONEXXX' is used as the configuration point for the power unit on its own.

There are 5 dimensions that can be configured on a trailer:
* height (defined by `h`)
* length (defined by `l`)
* width (defined by `w`)
* front projection (defined by `fp`)
* rear projection (defined by `rp`)

When any of these is configured directly on the `sizeDimensions` property it indicates a permittable size for the 'BC Default' geographic area. STACTRN in the example above has permittable maximum sizes for 4 dimensions in BC Default. Configuring separate sizes for other geographic regions is handled with a `regions` property of `sizeDimensions`. HIBOFLT in the example above configures a height and length specific to the PCE geographic region. As with vehicles, the `region` property must match a configured `geographicRegion` ID in the policy configuration file (it is a relational data key).

If any dimensions are __not__ configured for a trailer, this indicates that the maximum dimension is the __legal__ dimension and extra size is not permitted.

> [!NOTE]
> The reason `sizeDimensions` is an array instead of a single object is for future flexibility. Size dimensions generally do not need multiple size dimensions for a given trailer; this is for weight dimensions primarily. However, it is possible that in the future a trailer may be permitted extra length if it is following a tridem jeep or has a trailing tridem booster. In this case the configuration will be able to use multiple size dimensions for one trailer. For now however, it can be assumed there will only be a single size dimension in the array.

##### Jeeps and Boosters
Whether a jeep or a booster is permitted in a vehicle combination for a commodity is configured with the `allowJeep` and `allowBooster` properties. The presence of either a jeep or booster does not change the maximum permittable sizes that have been configured.

##### Self Issue
Certain vehicle combinations hauling certain commodities may not be 'auto-approved' by the system; they require review by staff. These combinations which are not permitted for self-issuance are indicated with a `selfIssue` value of `false`.

#### Weight Dimension Set
> [!NOTE]
> Weight dimensions are not configured in the example above because overweight permits have not yet been implemented in the policy engine.

## rules
Policy rules are defined in `json-rules-engine` format and are validated against permit applications according to the permit type. Rules may be configured as common to all permit types, or specific to permit types. Common policy rules are defined inside the top-level [commonRules](#commonRules) property, while type-specific policy rules are defined inside the `rules` property of the permit type itself, in the top-level [permitTypes](#permitTypes) property.

The structure of a rule is identical whether configured as common, or permit type-specific.

Example common and permit type-specific rules are as follows:
```js
  commonRules: [
    {
      conditions: {
        not: {
          fact: 'permitData',
          operator: 'stringMinimumLength',
          value: 1,
          path: '$.companyName',
        },
      },
      event: {
        type: 'violation',
        params: {
          message: 'Company is required',
          code: 'field-validation-error',
          fieldReference: 'permitData.companyName',
        },
      },
    },
  ],
  permitTypes: [
    {
      id: 'TROS',
      name: 'Term Oversize',
      routingRequired: false,
      weightDimensionRequired: false,
      sizeDimensionRequired: false,
      commodityRequired: false,
      allowedVehicles: [
        'STINGER',
        'TOWVEHC',
        'TRKTRAC',
      ],
      rules: [
        {
          conditions: {
            all: [
              {
                not: {
                  fact: 'permitData',
                  operator: 'in',
                  value: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
                  path: '$.permitDuration',
                },
              },
              {
                not: {
                  fact: 'permitData',
                  operator: 'equal',
                  value: {
                    fact: 'daysInPermitYear',
                  },
                  path: '$.permitDuration',
                },
              },
            ],
          },
          event: {
            type: 'violation',
            params: {
              message: 'Duration must be in 30 day increments or a full year',
              code: 'field-validation-error',
              fieldReference: 'permitData.permitDuration',
            },
          },
        },
      ],
    }
  ]
```
A rule consists of a condition (which may itself be multiple separate conditions with a logical operator) and an event that is triggered if the condition evaluates to `true`. Currently in onroute, a true condition always indicates a policy __violation__. In the future, true conditions may indicate other informational messages returned to the calling application, such as a requirement that a supplemental permit is required. See [event](#event) below for more details.

Refer to the [JSON Rules Engine](https://github.com/cachecontrol/json-rules-engine) documentation about the general structure of rule conditions and events. onRoute-specific notes follow, below.

### conditions
Facts in conditions are based on the structure of the permit application that will be validated. A permit application will have the following general structure:
```js
{
  permitType: 'TROS',
  permitData: {
    // ...as saved in the onroute database...
  }
}
```
Due to the structure above, the `fact` property will usually be `permitData` when validating user input from the permit application. The `path` defines what property of `permitData` is being validated. For example, the common rule in the example above is validating `permitData.companyName`.

#### operators
Besides the default operators from `json-rules-engine`, `onroute-policy-engine` defines additional custom operators:

* `stringMinimumLength` - returns true if the fact is a string type and has a minimum trimmed length greater than or equal to the supplied value
* `dateLessThan` - returns true if the fact is a date and is earlier than the supplied date value
* `regex` - returns true if the fact matches the supplied regular expression

#### custom facts
Besides facts that are from the permit application JSON, additional custom facts are available within conditions:

* `allowedVehicles` - returns an array of vehicle IDs (strings) that are valid for the permit type
  * Note this is valid only for permit types that do not require a full vehicle configuration
* `configurationIsValid` - returns true if the vehicle configuration in the permit application is valid as per policy
  * Note this is valid only for permit types that require a full vehicle configuration
* `daysInPermitYear` - returns the number of days in the year starting with the permit start date, either 365 or 366
* `validationDate` - returns the current date at the time of permit validation

### event
Example:
```js
  event: {
    type: 'violation',
    params: {
      message: 'Duration must be in 30 day increments or a full year',
      code: 'field-validation-error',
      fieldReference: 'permitData.permitDuration',
    },
  },
```

Currently in onroute, events define policy violations. For a violation event, the `type` property is always `violation`. The event `params` provide more context about the violation itself:

* `message` - description of the violation which can be presented to permit applicants
* `code` - type of violation which may be used by the calling application, currently limited to just `field-validation-error`
* `fieldReference` - the field in the permit application which caused the violation, usually but not always the same as the condition fact

All of these params are technically optional, but omitting them may impact how the calling application (e.g. onroute frontend) can respond to the violation. For example, if the `message` is omitted the frontend can only present a generic error message with no additional context which may not be a good user experience.

Additional event types which are planned, but not currently used in onroute include:

* `requirement`
* `warning`
* `information`

## costRules
The cost of a permit is calculated using a modified type of rule based on the [JSON Rules Engine](https://github.com/cachecontrol/json-rules-engine) rule type. The structure looks like:

```js
  costRules: [
    {
      fact: 'costPerMonth',
      params: {
        cost: 30,
      },
    },
  ],
```

`costRules` are defined as part of the `permitType` definition. Multiple `costRules` may apply to a specific permit type. For example, a permit may have a fixed cost plus a cost per kilometre driven. In such cases, multiple cost rules are defined in the array.

> [!NOTE]
> `costRules` are defined as facts alone, with no operator or event. Internally during validation, the `onroute-policy-engine` creates a `cost` event with the calculated cost supplied as a `cost` property of the event params.

There are currently two cost fact types:

* `fixedCost` - returns the value of the `cost` param without modification
* `costPerMonth` - returns the product of the number of months duration of the permit and the value of the `cost` param

As more complex cost rules are required, more cost fact types will be implemented in the `onroute-policy-engine` to accomodate these.