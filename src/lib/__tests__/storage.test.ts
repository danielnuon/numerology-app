import {
  readStoredBirthDate,
  saveBirthDate,
  clearStoredBirthDate,
  BIRTH_DATE_STORAGE_KEY,
} from "../storage";

// ---------------------------------------------------------------------------
// Test setup — mock localStorage
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((_index: number) => null),
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// saveBirthDate
// ---------------------------------------------------------------------------

describe("saveBirthDate", () => {
  it("saves { day, month, year } as JSON under the namespaced key", () => {
    saveBirthDate(24, 7, 1997);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      BIRTH_DATE_STORAGE_KEY,
      JSON.stringify({ day: 24, month: 7, year: 1997 })
    );
  });

  it("uses the key 'khmer-numerology:birth'", () => {
    expect(BIRTH_DATE_STORAGE_KEY).toBe("khmer-numerology:birth");
  });
});

// ---------------------------------------------------------------------------
// readStoredBirthDate
// ---------------------------------------------------------------------------

describe("readStoredBirthDate", () => {
  it("returns valid stored data", () => {
    saveBirthDate(24, 7, 1997);
    const result = readStoredBirthDate();
    expect(result).toEqual({ day: 24, month: 7, year: 1997 });
  });

  it("returns null when no data is stored", () => {
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null for corrupted JSON", () => {
    localStorageMock.setItem(BIRTH_DATE_STORAGE_KEY, "not json at all{{{");
    // Clear the mock so readStoredBirthDate uses our corrupted value
    localStorageMock.getItem.mockReturnValueOnce("not json at all{{{");
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null for JSON that is not an object", () => {
    localStorageMock.getItem.mockReturnValueOnce('"just a string"');
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null for JSON array", () => {
    localStorageMock.getItem.mockReturnValueOnce("[1, 2, 3]");
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null when day field is missing", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ month: 7, year: 1997 })
    );
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null when month field is missing", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 24, year: 1997 })
    );
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null when year field is missing", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 24, month: 7 })
    );
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null when fields are strings instead of numbers", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: "24", month: "7", year: "1997" })
    );
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null when fields are floats instead of integers", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 24.5, month: 7, year: 1997 })
    );
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null for year below 1900", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 1, month: 1, year: 1899 })
    );
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null for year above 2100", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 1, month: 1, year: 2101 })
    );
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null for month below 1", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 1, month: 0, year: 2000 })
    );
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null for month above 12", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 1, month: 13, year: 2000 })
    );
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null for day below 1", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 0, month: 1, year: 2000 })
    );
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null for day above 31", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 32, month: 1, year: 2000 })
    );
    expect(readStoredBirthDate()).toBeNull();
  });

  it("returns null for invalid calendar date (Feb 30)", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 30, month: 2, year: 2000 })
    );
    expect(readStoredBirthDate()).toBeNull();
  });

  it("accepts valid leap year date (Feb 29, 2000)", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 29, month: 2, year: 2000 })
    );
    expect(readStoredBirthDate()).toEqual({ day: 29, month: 2, year: 2000 });
  });

  it("rejects non-leap year Feb 29 (Feb 29, 1900)", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 29, month: 2, year: 1900 })
    );
    expect(readStoredBirthDate()).toBeNull();
  });

  it("accepts boundary year 1900", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 1, month: 1, year: 1900 })
    );
    expect(readStoredBirthDate()).toEqual({ day: 1, month: 1, year: 1900 });
  });

  it("accepts boundary year 2100", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 1, month: 1, year: 2100 })
    );
    expect(readStoredBirthDate()).toEqual({ day: 1, month: 1, year: 2100 });
  });

  it("accepts Dec 31 boundary date", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 31, month: 12, year: 2000 })
    );
    expect(readStoredBirthDate()).toEqual({ day: 31, month: 12, year: 2000 });
  });

  it("accepts Jan 1 boundary date", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ day: 1, month: 1, year: 2000 })
    );
    expect(readStoredBirthDate()).toEqual({ day: 1, month: 1, year: 2000 });
  });
});

// ---------------------------------------------------------------------------
// clearStoredBirthDate
// ---------------------------------------------------------------------------

describe("clearStoredBirthDate", () => {
  it("removes the birth date from localStorage", () => {
    saveBirthDate(24, 7, 1997);
    clearStoredBirthDate();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      BIRTH_DATE_STORAGE_KEY
    );
    expect(readStoredBirthDate()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Round-trip: save → read → clear → read
// ---------------------------------------------------------------------------

describe("round-trip", () => {
  it("save then read returns the same data", () => {
    saveBirthDate(15, 3, 2000);
    expect(readStoredBirthDate()).toEqual({ day: 15, month: 3, year: 2000 });
  });

  it("save, clear, then read returns null", () => {
    saveBirthDate(15, 3, 2000);
    clearStoredBirthDate();
    expect(readStoredBirthDate()).toBeNull();
  });

  it("saving new data overwrites old data", () => {
    saveBirthDate(24, 7, 1997);
    saveBirthDate(1, 1, 2000);
    expect(readStoredBirthDate()).toEqual({ day: 1, month: 1, year: 2000 });
  });
});
