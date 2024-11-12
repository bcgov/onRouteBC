import { getPermitTypeName } from "../../../types/PermitType";
import {
  DATE_FORMATS,
  dayjsToLocalStr,
} from "../../../../../common/helpers/formatDate";

import {
  closeMockServer,
  createdAt,
  defaultApplicationNumber,
  listenToMockServer,
  permitType,
  renderTestComponent,
  resetMockServer,
  updatedAt,
} from "./helpers/ApplicationDetails/prepare";

import {
  applicationNumber,
  createdDate,
  title,
  updatedDate,
} from "./helpers/ApplicationDetails/access";

beforeAll(() => {
  listenToMockServer();
});

beforeEach(async () => {
  resetMockServer();
  vi.resetModules();
});

afterAll(() => {
  closeMockServer();
});

describe("Application Details Display", () => {
  it("properly displays with empty application values", async () => {
    // Arrange and Act
    renderTestComponent();

    // Assert
    expect(await title()).toHaveTextContent("");
    expect(async () => await applicationNumber()).rejects.toThrow();
    expect(async () => await createdDate()).rejects.toThrow();
    expect(async () => await updatedDate()).rejects.toThrow();
  });

  it("properly displays non-empty application details info", async () => {
    // Arrange and act
    renderTestComponent(
      permitType,
      defaultApplicationNumber,
      createdAt,
      updatedAt,
    );

    // Assert
    expect(await title()).toHaveTextContent(getPermitTypeName(permitType));
    expect(await applicationNumber()).toHaveTextContent(
      defaultApplicationNumber,
    );
    expect(await createdDate()).toHaveTextContent(
      dayjsToLocalStr(createdAt, DATE_FORMATS.LONG),
    );
    expect(await updatedDate()).toHaveTextContent(
      dayjsToLocalStr(updatedAt, DATE_FORMATS.LONG),
    );
  });
});
