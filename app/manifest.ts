import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Nation — Геополитическая стратегия",
    short_name: "Nation",
    description: "Мобильная геополитическая и экономическая стратегия.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B1120",
    theme_color: "#0B1120",
    categories: ["games", "strategy"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
