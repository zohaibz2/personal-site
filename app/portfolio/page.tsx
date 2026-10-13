import type { Metadata } from "next";
import Work from "@/components/Work";

export const metadata: Metadata = {
  title: "Portfolio \u2014 Zohaib Narejo",
  description: "Products Zohaib Narejo has built with founders, from the first idea to launch.",
};

export default function PortfolioPage() {
  return (
    <main>
      <Work />
    </main>
  );
}
