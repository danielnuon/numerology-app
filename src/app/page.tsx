import { Suspense } from "react";
import { HomeClient } from "@/components/home-client";

/**
 * Home page — Server component wrapper.
 * Wraps the client component in Suspense to support useSearchParams
 * for share URL pre-fill (?day=24&month=7&year=1997).
 */
export default function Home() {
  return (
    <Suspense>
      <HomeClient />
    </Suspense>
  );
}
