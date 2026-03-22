import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Solini",
    short_name: "Solini",
    description:
      "Discover your 12-year life cycle through Khmer numerology.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F0E8",
    theme_color: "#2C2417",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
