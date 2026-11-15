import { HomeClient } from "@/components/home-client";
import { readHomeSearchParams } from "@/lib/home-params";
import type { QueryValue } from "@/lib/numerology/url-encoding";

type Props = {
  searchParams: Promise<Record<string, QueryValue>>;
};

/**
 * The moment of this request. The page is rendered once per request, on the
 * server, and the browser's first render reads the date from the same moment
 * so the two agree whatever the visitor's time zone (see useToday).
 */
function requestTime(): number {
  return Date.now();
}

/**
 * Home page — Server component wrapper.
 * Reads the share URL pre-fill params (?day=24&month=7&year=1997&ny=khmer,
 * plus a shared comparison's ?p= and ?n=, or an older link's
 * ?pday=&pmonth=&pyear=&pny=; see src/lib/home-params.ts)
 * on the server and passes them to the client component. Reading them here
 * rather than with useSearchParams lets the whole page render on the server,
 * so search engines and link previews see its content, not an empty shell.
 */
export default async function Home({ searchParams }: Props) {
  const params = readHomeSearchParams(await searchParams);
  return <HomeClient searchParams={params} renderedAt={requestTime()} />;
}
