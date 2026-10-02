import type { Metadata } from "next";
import FoodLab from "./FoodLab";

export const metadata: Metadata = {
  title: "The Food Lab \u2014 Zohaib Narejo",
  description:
    "Squish raw dough, bake it, and poke at the physics. A playful 3D material study.",
};

export default function FoodLabPage() {
  return <FoodLab />;
}
