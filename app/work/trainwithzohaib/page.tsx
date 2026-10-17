import type { Metadata } from "next";
import SocialCase from "@/components/SocialCase";

export const metadata: Metadata = {
  title: "Trainwithzohaib \u2014 Zohaib Narejo",
  description: "Trainwithzohaib: Zohaib Narejo's fitness page, with short explainer reels in English.",
};

const R = "/work/trainwithzohaib/";

export default function TrainWithZohaib() {
  return (
    <SocialCase
      title="Trainwithzohaib"
      tagline="Own your training."
      about="My fitness page: short explainer reels in English, for people anywhere who want to understand their training. You'll find it as @trainwithzohaib on Instagram and TikTok."
      reels={[
        { src: R + "reel-how-muscle-grows.mp4", still: R + "reel-how-muscle-grows.jpg", caption: "How muscle grows: it grows after." },
        { src: R + "reel-progressive-overload.mp4", still: R + "reel-progressive-overload.jpg", caption: "Same weight every week? Progressive overload, explained." },
      ]}
    />
  );
}
