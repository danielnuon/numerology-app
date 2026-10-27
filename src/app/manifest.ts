import type { MetadataRoute } from "next";
import { SHARE_DESCRIPTION, SITE_NAME } from "@/lib/site-copy";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SHARE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#17131C",
    theme_color: "#17131C",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
