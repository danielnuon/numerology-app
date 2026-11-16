/**
 * Home Page Query String
 *
 * The one contract between a share link and the home page. The share route
 * (/r/[date]) redirects to the home page with the reading, and any
 * comparison, in the query string; the home page reads it back. Both sides
 * live here so they cannot drift apart, and a test sends every link through
 * both.
 *
 *   /?day=24&month=7&year=1997&ny=khmer      the reading
 *   &p=2000-03-15-cny&p=2021-05-03           everyone else, as share segments
 *   &n=&n=Sam&n=Mai                          names, the reading's first
 *
 * Links made before households carried a single partner as
 * ?pday=&pmonth=&pyear=&pny=, which still opens.
 */

import { MAX_COMPARED_PEOPLE } from "./numerology/compatibility";
import {
  allQueryValues,
  decodeComparisonNames,
  decodeReadingQuery,
  decodeShareSegment,
  encodeComparisonSegment,
  firstQueryValue,
  readingQuery,
  type DecodedShare,
  type QueryValue,
} from "./numerology/url-encoding";

/** The home page's query string values, as text. */
export interface HomeSearchParams {
  day?: string;
  month?: string;
  year?: string;
  /** New Year rule of a shared reading: "khmer" or "chinese". */
  ny?: string;
  /** Everyone else in a shared comparison, as share segments ("2000-03-15-cny"). */
  p?: string[];
  /** Each person's name in a shared comparison, the reading's first; "" where none. */
  n?: string[];
  /** A single partner's birth date and rule, from a comparison link made before households. */
  pday?: string;
  pmonth?: string;
  pyear?: string;
  pny?: string;
}

/** Picks the home page's values out of the query string Next.js hands the page. */
export function readHomeSearchParams(params: Record<string, QueryValue>): HomeSearchParams {
  return {
    day: firstQueryValue(params.day),
    month: firstQueryValue(params.month),
    year: firstQueryValue(params.year),
    ny: firstQueryValue(params.ny),
    p: allQueryValues(params.p),
    n: allQueryValues(params.n),
    pday: firstQueryValue(params.pday),
    pmonth: firstQueryValue(params.pmonth),
    pyear: firstQueryValue(params.pyear),
    pny: firstQueryValue(params.pny),
  };
}

/** A shared link's reading and, for a comparison, everyone else in it. */
export interface HomeLink extends DecodedShare {
  /** Everyone else in a shared comparison, in the link's order. */
  others?: DecodedShare[];
  /** Each person's name in a shared comparison, the reading's first; null where none. */
  names?: (string | null)[];
}

/** The home page URL that opens this reading, and the comparison if there is one. */
export function homeUrlFor({ others = [], names = [], ...reading }: HomeLink): string {
  const params = new URLSearchParams(readingQuery(reading));
  for (const other of others) params.append("p", encodeComparisonSegment([other]));
  if (names.some((name) => name !== null)) {
    for (const name of names) params.append("n", name ?? "");
  }
  return `/?${params.toString()}`;
}

/** Someone in a shared comparison, other than the reading's owner. */
export interface SharedPerson {
  share: DecodedShare;
  /** The name the link gives them, or null. */
  name: string | null;
}

/** A shared comparison from the link: the reading's owner's name and everyone else. */
export interface SharedComparison {
  readingName: string | null;
  others: SharedPerson[];
}

/**
 * The comparison in a shared link. Readings that don't decode are left out
 * with their names, and at most MAX_COMPARED_PEOPLE people are kept, the
 * reading's owner included.
 *
 * @param now - The current time, which decides whether a date is in the
 *   future (see decodeReadingQuery)
 */
export function comparisonFromSearchParams(params: HomeSearchParams, now: Date = new Date()): SharedComparison {
  const segments = params.p ?? [];
  const names = decodeComparisonNames(params.n, segments.length + 1);
  const others: SharedPerson[] = segments.flatMap((segment, i) => {
    const share = decodeShareSegment(segment, now);
    return share ? [{ share, name: names[i + 1] }] : [];
  });
  if (others.length === 0) {
    const partner = legacyPartner(params, now);
    if (partner) others.push({ share: partner, name: null });
  }
  return { readingName: names[0], others: others.slice(0, MAX_COMPARED_PEOPLE - 1) };
}

/** The single partner from a comparison link made before households, or null if absent or invalid. */
function legacyPartner(params: HomeSearchParams, now: Date): DecodedShare | null {
  return decodeReadingQuery({ day: params.pday, month: params.pmonth, year: params.pyear, ny: params.pny }, now);
}
