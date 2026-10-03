import type { Metadata } from "next";
import FoodLab from "./FoodLab";

export const metadata: Metadata = {
  title: "The Food Lab \u2014 Zohaib Narejo",
  description:
    "Walk into a Karachi kitchen in first person, gather everything, and learn to make biryani.",
};

export default function FoodLabPage() {
  return <FoodLab />;
}
