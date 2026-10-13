import type { Metadata } from "next";
import BrandCase from "@/components/BrandCase";

export const metadata: Metadata = {
  title: "Narejo Farms \u2014 Zohaib Narejo",
  description: "The Narejo Farms brand identity, designed by Zohaib Narejo for his own farm.",
};

export default function NarejoFarmsBrand() {
  return (
    <BrandCase
      title="Narejo Farms"
      tagline="Brand identity for my own farm."
      about="A cow-and-field mark beside a clean wordmark, in charcoal, terracotta and off-white, carried across the farm sign and gate, staff T-shirts, the livestock truck, meat packaging and animal records."
      board={{ src: "/work/branding/narejo-farms.jpg", alt: "The Narejo Farms brand board: logo, colour palette, the farm sign and gate, a T-shirt, the truck and meat packaging", width: 1080, height: 1920 }}
    />
  );
}
