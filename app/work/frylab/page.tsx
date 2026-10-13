import type { Metadata } from "next";
import BrandCase from "@/components/BrandCase";

export const metadata: Metadata = {
  title: "FryLab \u2014 Zohaib Narejo",
  description: "FryLab brand identity by Zohaib Narejo: logo, palette, packaging, uniforms and signage.",
};

export default function FryLabBrand() {
  return (
    <BrandCase
      title="FryLab"
      tagline="Brand identity: logo, palette and packaging."
      about="A playful logo with a dripping F, in red, mustard and white, carried across food packaging, cups, staff uniforms, a billboard, a delivery bag and the storefront."
      board={{ src: "/work/branding/frylab.jpg", alt: "The FryLab brand board: logo, colour palette, packaging, uniforms, a billboard and the storefront", width: 1080, height: 1919 }}
    />
  );
}
