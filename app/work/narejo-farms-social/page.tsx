import type { Metadata } from "next";
import SocialCase from "@/components/SocialCase";

export const metadata: Metadata = {
  title: "Narejo Farms on social media \u2014 Zohaib Narejo",
  description: "Reels from the farm's Sindhri mango season, from its Getlivestock days, by Zohaib Narejo.",
};

const R = "/work/narejo-farms-social/";

export default function NarejoFarmsSocial() {
  return (
    <SocialCase
      title="Narejo Farms on social media"
      tagline="Reels from the farm&rsquo;s mango season, back when it was Getlivestock."
      about="Before the farm became Narejo Farms, it sold as Getlivestock. These reels ran its Sindhri mango season on Instagram, from the pre-order announcements to the sold-out post, with one more: a story from the farm worth listening to."
      reels={[
        { src: R + "reel-mango-season.mp4", still: R + "reel-mango-season.jpg", caption: "Mango season is here, and like always, we bring you the best." },
        { src: R + "reel-sindhri-pre-order.mp4", still: R + "reel-sindhri-pre-order.jpg", caption: "Premium Sindhri mangoes, from the 16th of June. DM to pre-order." },
        { src: R + "reel-now-available.mp4", still: R + "reel-now-available.jpg", caption: "Premium mangoes, now available. DM to order." },
        { src: R + "reel-place-your-order.mp4", still: R + "reel-place-your-order.jpg", caption: "Place your order now for premium mangoes." },
        { src: R + "reel-stories.mp4", still: R + "reel-stories.jpg", caption: "Some stories are worth listening to." },
        { src: R + "reel-sold-out.mp4", still: R + "reel-sold-out.jpg", caption: "Sold out! Restocking soon. DM to pre-order." },
      ]}
    />
  );
}
