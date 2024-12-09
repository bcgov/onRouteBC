import { Province } from "./Province";

export interface Country {
  name: string;
  code: string;
  states: Province[];
}
