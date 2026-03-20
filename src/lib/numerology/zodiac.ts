/**
 * Chinese Lunar New Year Lookup Table
 *
 * Maps years to Chinese New Year dates for zodiac determination.
 * Births before CNY use the previous year's zodiac animal.
 */

export const ZODIAC_ANIMALS = [
  "Rat",
  "Ox",
  "Tiger",
  "Rabbit",
  "Dragon",
  "Snake",
  "Horse",
  "Goat",
  "Monkey",
  "Rooster",
  "Dog",
  "Pig",
] as const;

export type ZodiacAnimal = (typeof ZODIAC_ANIMALS)[number];

/**
 * Chinese New Year dates by Gregorian year.
 * Format: { month, day } of the CNY date for that year.
 * Source: Hong Kong Observatory / authoritative lunar calendar references.
 * Coverage: 1900–2100 (201 years).
 */
export const CNY_DATES: Record<number, { month: number; day: number }> = {
  1900: { month: 1, day: 31 },
  1901: { month: 2, day: 19 },
  1902: { month: 2, day: 8 },
  1903: { month: 1, day: 29 },
  1904: { month: 2, day: 16 },
  1905: { month: 2, day: 4 },
  1906: { month: 1, day: 25 },
  1907: { month: 2, day: 13 },
  1908: { month: 2, day: 2 },
  1909: { month: 1, day: 22 },
  1910: { month: 2, day: 10 },
  1911: { month: 1, day: 30 },
  1912: { month: 2, day: 18 },
  1913: { month: 2, day: 6 },
  1914: { month: 1, day: 26 },
  1915: { month: 2, day: 14 },
  1916: { month: 2, day: 3 },
  1917: { month: 1, day: 23 },
  1918: { month: 2, day: 11 },
  1919: { month: 2, day: 1 },
  1920: { month: 2, day: 20 },
  1921: { month: 2, day: 8 },
  1922: { month: 1, day: 28 },
  1923: { month: 2, day: 16 },
  1924: { month: 2, day: 5 },
  1925: { month: 1, day: 24 },
  1926: { month: 2, day: 13 },
  1927: { month: 2, day: 2 },
  1928: { month: 1, day: 23 },
  1929: { month: 2, day: 10 },
  1930: { month: 1, day: 30 },
  1931: { month: 2, day: 17 },
  1932: { month: 2, day: 6 },
  1933: { month: 1, day: 26 },
  1934: { month: 2, day: 14 },
  1935: { month: 2, day: 4 },
  1936: { month: 1, day: 24 },
  1937: { month: 2, day: 11 },
  1938: { month: 1, day: 31 },
  1939: { month: 2, day: 19 },
  1940: { month: 2, day: 8 },
  1941: { month: 1, day: 27 },
  1942: { month: 2, day: 15 },
  1943: { month: 2, day: 5 },
  1944: { month: 1, day: 25 },
  1945: { month: 2, day: 13 },
  1946: { month: 2, day: 2 },
  1947: { month: 1, day: 22 },
  1948: { month: 2, day: 10 },
  1949: { month: 1, day: 29 },
  1950: { month: 2, day: 17 },
  1951: { month: 2, day: 6 },
  1952: { month: 1, day: 27 },
  1953: { month: 2, day: 14 },
  1954: { month: 2, day: 3 },
  1955: { month: 1, day: 24 },
  1956: { month: 2, day: 12 },
  1957: { month: 1, day: 31 },
  1958: { month: 2, day: 18 },
  1959: { month: 2, day: 8 },
  1960: { month: 1, day: 28 },
  1961: { month: 2, day: 15 },
  1962: { month: 2, day: 5 },
  1963: { month: 1, day: 25 },
  1964: { month: 2, day: 13 },
  1965: { month: 2, day: 2 },
  1966: { month: 1, day: 21 },
  1967: { month: 2, day: 9 },
  1968: { month: 1, day: 30 },
  1969: { month: 2, day: 17 },
  1970: { month: 2, day: 6 },
  1971: { month: 1, day: 27 },
  1972: { month: 2, day: 15 },
  1973: { month: 2, day: 3 },
  1974: { month: 1, day: 23 },
  1975: { month: 2, day: 11 },
  1976: { month: 1, day: 31 },
  1977: { month: 2, day: 18 },
  1978: { month: 2, day: 7 },
  1979: { month: 1, day: 28 },
  1980: { month: 2, day: 16 },
  1981: { month: 2, day: 5 },
  1982: { month: 1, day: 25 },
  1983: { month: 2, day: 13 },
  1984: { month: 2, day: 2 },
  1985: { month: 2, day: 20 },
  1986: { month: 2, day: 9 },
  1987: { month: 1, day: 29 },
  1988: { month: 2, day: 17 },
  1989: { month: 2, day: 6 },
  1990: { month: 1, day: 27 },
  1991: { month: 2, day: 15 },
  1992: { month: 2, day: 4 },
  1993: { month: 1, day: 23 },
  1994: { month: 2, day: 10 },
  1995: { month: 1, day: 31 },
  1996: { month: 2, day: 19 },
  1997: { month: 2, day: 7 },
  1998: { month: 1, day: 28 },
  1999: { month: 2, day: 16 },
  2000: { month: 2, day: 5 },
  2001: { month: 1, day: 24 },
  2002: { month: 2, day: 12 },
  2003: { month: 2, day: 1 },
  2004: { month: 1, day: 22 },
  2005: { month: 2, day: 9 },
  2006: { month: 1, day: 29 },
  2007: { month: 2, day: 18 },
  2008: { month: 2, day: 7 },
  2009: { month: 1, day: 26 },
  2010: { month: 2, day: 14 },
  2011: { month: 2, day: 3 },
  2012: { month: 1, day: 23 },
  2013: { month: 2, day: 10 },
  2014: { month: 1, day: 31 },
  2015: { month: 2, day: 19 },
  2016: { month: 2, day: 8 },
  2017: { month: 1, day: 28 },
  2018: { month: 2, day: 16 },
  2019: { month: 2, day: 5 },
  2020: { month: 1, day: 25 },
  2021: { month: 2, day: 12 },
  2022: { month: 2, day: 1 },
  2023: { month: 1, day: 22 },
  2024: { month: 2, day: 10 },
  2025: { month: 1, day: 29 },
  2026: { month: 2, day: 17 },
  2027: { month: 2, day: 6 },
  2028: { month: 1, day: 26 },
  2029: { month: 2, day: 13 },
  2030: { month: 2, day: 3 },
  2031: { month: 1, day: 23 },
  2032: { month: 2, day: 11 },
  2033: { month: 1, day: 31 },
  2034: { month: 2, day: 19 },
  2035: { month: 2, day: 8 },
  2036: { month: 1, day: 28 },
  2037: { month: 2, day: 15 },
  2038: { month: 2, day: 4 },
  2039: { month: 1, day: 24 },
  2040: { month: 2, day: 12 },
  2041: { month: 2, day: 1 },
  2042: { month: 1, day: 22 },
  2043: { month: 2, day: 10 },
  2044: { month: 2, day: 1 },
  2045: { month: 1, day: 22 },
  2046: { month: 2, day: 9 },
  2047: { month: 1, day: 29 },
  2048: { month: 2, day: 17 },
  2049: { month: 2, day: 6 },
  2050: { month: 1, day: 23 },
  2051: { month: 2, day: 11 },
  2052: { month: 2, day: 1 },
  2053: { month: 2, day: 19 },
  2054: { month: 2, day: 8 },
  2055: { month: 1, day: 28 },
  2056: { month: 2, day: 15 },
  2057: { month: 2, day: 4 },
  2058: { month: 1, day: 24 },
  2059: { month: 2, day: 12 },
  2060: { month: 2, day: 2 },
  2061: { month: 1, day: 21 },
  2062: { month: 2, day: 9 },
  2063: { month: 1, day: 29 },
  2064: { month: 2, day: 17 },
  2065: { month: 2, day: 5 },
  2066: { month: 1, day: 26 },
  2067: { month: 2, day: 14 },
  2068: { month: 2, day: 3 },
  2069: { month: 1, day: 23 },
  2070: { month: 2, day: 11 },
  2071: { month: 1, day: 31 },
  2072: { month: 2, day: 19 },
  2073: { month: 2, day: 7 },
  2074: { month: 1, day: 27 },
  2075: { month: 2, day: 15 },
  2076: { month: 2, day: 5 },
  2077: { month: 1, day: 24 },
  2078: { month: 2, day: 12 },
  2079: { month: 2, day: 2 },
  2080: { month: 1, day: 22 },
  2081: { month: 2, day: 9 },
  2082: { month: 1, day: 29 },
  2083: { month: 2, day: 17 },
  2084: { month: 2, day: 6 },
  2085: { month: 1, day: 26 },
  2086: { month: 2, day: 14 },
  2087: { month: 2, day: 3 },
  2088: { month: 1, day: 24 },
  2089: { month: 2, day: 10 },
  2090: { month: 1, day: 30 },
  2091: { month: 2, day: 18 },
  2092: { month: 2, day: 7 },
  2093: { month: 1, day: 27 },
  2094: { month: 2, day: 15 },
  2095: { month: 2, day: 5 },
  2096: { month: 1, day: 25 },
  2097: { month: 2, day: 12 },
  2098: { month: 2, day: 1 },
  2099: { month: 1, day: 21 },
  2100: { month: 2, day: 9 },
};

/**
 * Determines the zodiac year for a given birth date,
 * accounting for the Chinese New Year boundary.
 *
 * Births before CNY of that year use the previous year's zodiac.
 * Births on or after CNY use the current year's zodiac.
 *
 * @returns The effective zodiac year (Gregorian year adjusted for CNY boundary)
 */
export function getZodiacYear(birthDate: Date): number {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1; // 0-indexed → 1-indexed
  const day = birthDate.getDate();

  const cny = CNY_DATES[year];
  if (!cny) {
    throw new Error(
      `Year ${year} is outside the supported range (1900-2100).`
    );
  }

  // If birth is before CNY, use previous year
  if (month < cny.month || (month === cny.month && day < cny.day)) {
    return year - 1;
  }

  return year;
}

/**
 * Returns the zodiac animal name for a given birth date.
 */
export function getZodiacAnimal(birthDate: Date): ZodiacAnimal {
  const zodiacYear = getZodiacYear(birthDate);
  const index = ((zodiacYear - 4) % 12 + 12) % 12; // Rat = year 4 in cycle
  return ZODIAC_ANIMALS[index];
}

/**
 * Returns the zodiac number (1-12) for a given birth date.
 * Rat=1, Ox=2, Tiger=3, ..., Pig=12
 */
export function getZodiacNumber(birthDate: Date): number {
  const zodiacYear = getZodiacYear(birthDate);
  return ((zodiacYear - 4) % 12 + 12) % 12 + 1;
}

/**
 * Generates the 12-element zodiac row for the numerology calculation.
 * Starts at the zodiac number and cycles through 1-12.
 *
 * Example: Ox (2) → [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1]
 */
export function getZodiacRow(zodiacNumber: number): number[] {
  if (zodiacNumber < 1 || zodiacNumber > 12) {
    throw new Error(
      `Invalid zodiac number: ${zodiacNumber}. Must be 1-12.`
    );
  }

  const row: number[] = [];
  for (let i = 0; i < 12; i++) {
    row.push(((zodiacNumber - 1 + i) % 12) + 1);
  }
  return row;
}
