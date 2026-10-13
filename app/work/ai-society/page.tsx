import type { Metadata } from "next";
import SocialCase from "@/components/SocialCase";

export const metadata: Metadata = {
  title: "The AI Society \u2014 Zohaib Narejo",
  description: "Reels on new AI tools and launches. Zohaib Narejo grew The AI Society from 0 to 6,000 followers.",
};

export default function AISociety() {
  return (
    <SocialCase
      title="The AI Society"
      tagline="Reels on new AI tools and launches."
      about="As Media Manager at Alt Ventures, I grew The AI Society from scratch: short videos that explain new AI tools and tech launches in plain words."
      stats={[
        { value: "0 \u2192 6,000", label: "followers, from scratch" },
        { value: "1M+", label: "views on a single video" },
        { value: "2,300", label: "app downloads in under 24 hours, from that video" },
      ]}
      reels={[
        { src: "/work/ai-society/reel-savvy.mp4", still: "/work/ai-society/reel-savvy.jpg", caption: "Savvy: Savyour\u2019s new AI chatbot." },
        { src: "/work/ai-society/reel-captions.mp4", still: "/work/ai-society/reel-captions.jpg", caption: "Captions and hashtags, written by AI." },
        { src: "/work/ai-society/reel-gptgo.mp4", still: "/work/ai-society/reel-gptgo.jpg", caption: "GPTGO: Google search and ChatGPT in one place." },
        { src: "/work/ai-society/reel-vision-pro.mp4", still: "/work/ai-society/reel-vision-pro.jpg", caption: "Apple Vision Pro: the launch, explained." },
        { src: "/work/ai-society/reel-d-id.mp4", still: "/work/ai-society/reel-d-id.jpg", caption: "D-ID: make any photo talk." },
      ]}
    />
  );
}
