import { HomeClient, type HomeSearchParams } from "@/components/home-client";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** The first value of a query parameter, ignoring repeats. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Every value of a repeatable query parameter, in order. */
function all(value: string | string[] | undefined): string[] | undefined {
  return value === undefined ? undefined : Array.isArray(value) ? value : [value];
}

/**
 * Home page — Server component wrapper.
 * Reads the share URL pre-fill params (?day=24&month=7&year=1997&ny=khmer,
 * plus a shared comparison's ?p= and ?n=, or an older link's
 * ?pday=&pmonth=&pyear=&pny=)
 * on the server and passes them to the client component. Reading them here
 * rather than with useSearchParams lets the whole page render on the server,
 * so search engines and link previews see its content, not an empty shell.
 */
export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const shareParams: HomeSearchParams = {
    day: first(params.day),
    month: first(params.month),
    year: first(params.year),
    ny: first(params.ny),
    p: all(params.p),
    n: all(params.n),
    pday: first(params.pday),
    pmonth: first(params.pmonth),
    pyear: first(params.pyear),
    pny: first(params.pny),
  };
  return <HomeClient searchParams={shareParams} />;
}
