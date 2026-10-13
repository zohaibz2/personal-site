import type { Metadata } from "next";
import SocialCase from "@/components/SocialCase";

export const metadata: Metadata = {
  title: "Venfound on social media \u2014 Zohaib Narejo",
  description: "Reels and posts Zohaib Narejo made for Venfound's LinkedIn and Instagram.",
};

export default function VenfoundSocial() {
  return (
    <SocialCase
      title="Venfound on social media"
      tagline="Reels and posts for Venfound&rsquo;s LinkedIn and Instagram."
      about="Content for Venfound, the studio I co-founded: short reels about what we build, a post that says it in one line, and covers for the articles we write for founders."
      reels={[
        { src: "/work/social/reel-lets-build-it.mp4", still: "/work/social/reel-lets-build-it.jpg", caption: "Got an idea? Need an MVP? Let\u2019s build it." },
        { src: "/work/social/reel-clients-online.mp4", still: "/work/social/reel-clients-online.jpg", caption: "Hey, business owner: get your clients online." },
        { src: "/work/social/reel-websites-that-grow.mp4", still: "/work/social/reel-websites-that-grow.jpg", caption: "We build websites that grow your business." },
      ]}
      posts={[
        { src: "/work/social/post-ideas-to-impact.jpg", alt: "Venfound post: From ideas to impact, we build for founders!", caption: "The studio, in one line.", width: 1080, height: 1350 },
        { src: "/work/social/post-six-months.jpg", alt: "Venfound post: Why do founders spend 6 months building something they'll never launch?", caption: "Cover for an Insights article.", width: 1081, height: 1350 },
        { src: "/work/social/post-validate.jpg", alt: "Venfound post: Everybody tells you to validate your idea. Nobody tells you how.", caption: "Cover for an Insights article.", width: 1080, height: 1350 },
      ]}
    />
  );
}
