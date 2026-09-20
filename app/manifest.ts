import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AJVEK",
    short_name: "AJVEK",
    description:
      "AJVEK — Streetwear français. Du dessin au vêtement.",
    start_url: "/",
    display: "standalone",
    background_color: "#121110",
    theme_color: "#121110",
    orientation: "portrait",
  };
}