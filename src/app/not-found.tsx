import type { Metadata } from "next";
import { SectionDivider } from "@/components/ui/section-divider";
import { InfoPage, MorePages, PillLink } from "@/components/ui/page-parts";
import { SITE_NAME } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: `Page not found — ${SITE_NAME}`,
};

/** Any address that isn't a page: the same lit shell as the companion pages, pointing home. */
export default function NotFound() {
  return (
    <InfoPage title="No lantern here">
      <SectionDivider compact />
      <p className="max-w-[480px] text-center text-ink-light leading-relaxed text-balance">
        This page doesn&apos;t exist, or its link was cut short. Your cycle is
        still waiting on the home page.
      </p>
      <div className="mt-10">
        <PillLink href="/">See your cycle</PillLink>
      </div>
      <MorePages />
    </InfoPage>
  );
}
