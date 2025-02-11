import { RequiredOrNull } from "../../../common/types/common";

export interface AxleUnit {
  numberOfAxles?: RequiredOrNull<number>;
  axleSpread?: RequiredOrNull<number>;
  interaxleSpacing?: RequiredOrNull<number>;
  axleUnitWeight?: RequiredOrNull<number>;
  numberOfTires?: RequiredOrNull<number>;
  tireSize?: RequiredOrNull<number>;
}
