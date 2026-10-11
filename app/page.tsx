import Image from "next/image";
import Work from "@/components/Work";
import Companies from "@/components/Companies";
import Scrapbook from "@/components/Scrapbook";
import Typewriter from "@/components/Typewriter";

export default function Home() {
  const heroIntro =
    "Hi, I am Zohaib Narejo. I build things on the internet and talk to people who do the same.";
  const typeSpeed = 32;

  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden flex flex-col md:flex-row md:min-h-screen md:items-center px-6 md:px-16 lg:px-24 py-16 md:py-0 gap-8 md:gap-12">

        {/* Left: photo */}
        <div className="flex justify-center md:justify-end md:w-[40%]">
          <div className="relative w-[260px] h-[340px] md:w-[360px] md:h-[460px] lg:w-[400px] lg:h-[500px]">
            <Image
              src="/me.png"
              alt="Zohaib Narejo"
              fill
              className="object-contain object-bottom"
              priority
            />
          </div>
        </div>

        {/* Right: text */}
        <div className="md:w-[60%] flex flex-col justify-center gap-5">
          <div className="flex flex-col gap-1">
            <p className="text-lg md:text-xl text-[#c2410c]">
              Founder &amp; Marketeer.
            </p>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-[#1a1a1a]">
              based in Karachi,&nbsp;Pakistan
            </h1>
          </div>
          <Typewriter
            className="text-lg md:text-xl text-[#1a1a1a] leading-relaxed max-w-md"
            text={heroIntro}
            speed={typeSpeed}
          />
        </div>

      </section>

      {/* About me: the scrapbook (story, photos, things on my mind) */}
      <Scrapbook />

      {/* Work */}
      <Work />

      {/* Companies I've built */}
      <Companies />

      {/* Contact */}
      <section className="mx-auto max-w-[640px] lg:max-w-5xl px-6 pb-28 md:pb-36 text-center">
        <p className="text-xl md:text-2xl text-[#1a1a1a] leading-relaxed mb-5">
          Drop me a line at{" "}
          <a
            href="mailto:narejozohaib33@gmail.com"
            className="text-[#c2410c] hover:text-[#ea580c] transition-colors"
          >
            narejozohaib33@gmail.com
          </a>
          . I read everything.
        </p>
        <p className="text-sm text-[#1a1a1a]/60" style={{ fontFamily: "system-ui, sans-serif" }}>
          <a href="https://www.linkedin.com/in/zohaib-narejo-aa61192a8/" target="_blank" rel="noopener noreferrer" className="hover:text-[#1a1a1a] transition-colors">LinkedIn</a>
          <span className="mx-2">&middot;</span>
          <a href="https://x.com/NarejoZohaib" target="_blank" rel="noopener noreferrer" className="hover:text-[#1a1a1a] transition-colors">Twitter</a>
          <span className="mx-2">&middot;</span>
          <a href="https://www.instagram.com/zohaibnarejo._/" target="_blank" rel="noopener noreferrer" className="hover:text-[#1a1a1a] transition-colors">Instagram</a>
        </p>
      </section>
    </>
  );
}
