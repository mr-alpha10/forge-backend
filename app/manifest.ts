import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Forge — workout tracker",
    short_name: "Forge",
    description: "Browse exercises, build routines, and track your lifts.",
    start_url: "/",
    display: "standalone",
    background_color: "#06060A",
    theme_color: "#06060A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}