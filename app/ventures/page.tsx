import type { Metadata } from "next";
import Companies from "@/components/Companies";

export const metadata: Metadata = {
  title: "Ventures \u2014 Zohaib Narejo",
  description: "Narejo Farms and Venfound: the companies Zohaib Narejo has built.",
};

export default function VenturesPage() {
  return (
    <main>
      <Companies />
    </main>
  );
}
