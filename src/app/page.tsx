import { HomeClient, type HomeSearchParams } from "@/components/home-client";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** The first value of a query parameter, ignoring repeats. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Home page — Server component wrapper.
 * Reads the share URL pre-fill params (?day=24&month=7&year=1997&ny=khmer)
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
  };
  return <HomeClient searchParams={shareParams} />;
}
