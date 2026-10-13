import type { Metadata } from "next";
import BrandCase from "@/components/BrandCase";

export const metadata: Metadata = {
  title: "Steady \u2014 Zohaib Narejo",
  description: "Steady brand identity by Zohaib Narejo: wordmark, palette, packaging and campaign imagery.",
};

export default function SteadyBrand() {
  return (
    <BrandCase
      title="Steady"
      tagline="Brand identity: wordmark, palette and packaging."
      about="A bold, angular wordmark and a palette of black, orange and warm white, carried across cans, a sports bottle, a tote bag and campaign imagery."
      board={{ src: "/work/branding/steady.jpg", alt: "The Steady brand board: wordmark, colour palette, cans, a bottle, a tote bag and campaign images", width: 1080, height: 1920 }}
    />
  );
}
