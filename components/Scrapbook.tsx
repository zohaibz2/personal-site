import Image from "next/image";
import { Caveat, Courier_Prime } from "next/font/google";
import "./scrapbook.css";

// "About me" as a scrapbook: a screenplay page telling the story, Zohaib's own
// photos (in /public/about), an Eidi receipt, the pact in cut-out letters and
// "Things on my mind lately" on a notebook page. All the words are real text
// (readable by Google and screen readers); the story is from his own website,
// narejofarms.com and venfound.com.

const hand = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--sb-hand" });
const type = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--sb-type" });

const THINGS = [
  "How AI is changing what one person can build in a week \u2014 not just coding, but the whole stack: design, copy, research, marketing",
  "What it would take to make small parts of Pakistan's food system more sustainable",
  "The Pakistani startup ecosystem, and why it deserves better documentation than it gets",
  "Small teams that ship things, and what they do differently",
];

// the pact, one cut-out letter at a time (colours, fonts and tilts vary)
const PACT = "I WOULD NOT QUIT";
const CUTOUT = [
  { bg: "#111111", fg: "#ffffff", font: "Georgia, serif", rot: -5 },
  { bg: "#fde68a", fg: "#111111", font: "Impact, 'Arial Black', sans-serif", rot: 4 },
  { bg: "#ffffff", fg: "#c2410c", font: "'Times New Roman', serif", rot: -2 },
  { bg: "#c2410c", fg: "#ffffff", font: "'Courier New', monospace", rot: 6 },
  { bg: "#e7e5e4", fg: "#111111", font: "Verdana, sans-serif", rot: -6 },
  { bg: "#ffffff", fg: "#111111", font: "Georgia, serif", rot: 3 },
];

function Polaroid({ src, alt, w, h, caption, className = "" }: { src: string; alt: string; w: number; h: number; caption: string; className?: string }) {
  return (
    <figure className={`sb-photo ${className}`}>
      <Image src={src} alt={alt} width={w} height={h} sizes="(max-width: 768px) 90vw, 360px" />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export default function Scrapbook() {
  let n = 0;
  return (
    <section id="about" className="mx-auto max-w-[640px] lg:max-w-5xl px-6 py-16 md:py-24 scroll-mt-24">
      <div className={`scrapbook ${hand.variable} ${type.variable}`}>
        <h2 className="sb-title">
          Pages from <span>my story</span>
        </h2>

        <div className="sb-board">
          {/* the story, as a screenplay */}
          <article className="sb-script sb-tilt-l sb-tape" aria-label="My story, written as a screenplay">
            <div className="sb-pageno" aria-hidden="true">13.</div>
            <p>FADE IN:</p>
            <p className="sb-scene">EXT. MIRPURKHAS, SINDH - EID, 2017</p>
            <p>A kid counts 4,000 rupees of Eidi. He doesn&apos;t buy toys. He goes looking for his first goat.</p>
            <p className="sb-scene">INT. BEDROOM - 2019</p>
            <p>
              ZOHAIB (13) props up a phone and hits record. A YouTube channel. Then a couple of online stores. Small
              steps, trying to figure out what he likes most.
            </p>
            <p className="sb-scene">INT. A SMALL STUDIO - 2023</p>
            <p>
              Founders walk in with ideas and leave with web products. The studio is called{" "}
              <a href="https://www.venfound.com" target="_blank" rel="noopener noreferrer">
                VENFOUND
              </a>
              .
            </p>
            <p className="sb-scene">EXT. THE ROAD TO KARACHI - QURBANI SEASON</p>
            <p>
              Goats raised in Mirpurkhas ride 250 km to the city, so the value stays with the people who raised them.
              The sign on the gate says{" "}
              <a href="https://www.narejofarms.com" target="_blank" rel="noopener noreferrer">
                NAREJO FARMS
              </a>
              .
            </p>
            <p className="sb-scene">INT. FCCU, LAHORE - PRESENT DAY</p>
            <p>Between BBA classes he hosts STALAB: honest conversations about building startups, with the founders behind them.</p>
            <p className="sb-char">ZOHAIB</p>
            <p className="sb-paren">(to camera)</p>
            <p className="sb-line">Fewer, bigger things.</p>
            <p className="sb-end">TO BE CONTINUED.</p>
          </article>

          {/* that's me */}
          <div className="sb-me">
            <svg className="sb-arrow" viewBox="0 0 120 70" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 18 C 38 4, 74 10, 92 44" />
              <path d="M82 40 L 93 46 L 96 33" />
            </svg>
            <span className="sb-melabel" aria-hidden="true">
              that&apos;s me
            </span>
            <Polaroid src="/about/portrait.jpg" alt="Zohaib Narejo in a black blazer" w={812} h={1100} caption="Zohaib Narejo" className="sb-tilt-r sb-tape" />
          </div>

          {/* a still from a video */}
          <figure className="sb-photo sb-still sb-tilt-ll">
            <div className="sb-frame">
              <Image src="/about/youtube.jpg" alt="Zohaib talking to the camera in one of his videos" width={1200} height={683} sizes="(max-width: 768px) 90vw, 320px" />
              <span className="sb-rec" aria-hidden="true">REC</span>
            </div>
            <figcaption>on YouTube since I was 13</figcaption>
          </figure>

          {/* the farm, and a goat in a heart */}
          <Polaroid src="/about/farm.jpg" alt="Buffalo and cattle at the farm, with thatched sheds" w={1100} h={1070} caption="the farm" className="sb-farm sb-tilt-l sb-tape corner" />
          <div className="sb-heart">
            <div className="sb-heartcut">
              <Image src="/about/goat.jpg" alt="A brown and white goat at the farm" width={900} height={661} sizes="220px" />
            </div>
            <p>first love: goats</p>
          </div>

          {/* the Eidi receipt */}
          <div className="sb-receipt sb-tilt-rr" aria-label="Eidi, 2017: 4,000 rupees, spent on a first goat">
            <div className="sb-rhead">EIDI &middot; 2017</div>
            <div className="sb-row"><span>CASH</span><span>RS 4,000</span></div>
            <div className="sb-row"><span>TOYS</span><span>0</span></div>
            <div className="sb-row"><span>FIRST GOAT</span><span>1</span></div>
            <div className="sb-row sb-total"><span>CHANGE</span><span>A FARM</span></div>
          </div>

          {/* the pact */}
          <div className="sb-pact sb-tilt-l">
            <div className="sb-letters" role="img" aria-label={PACT}>
              {PACT.split(" ").map((word, w) => (
                <span key={w} className="sb-word" aria-hidden="true">
                  {word.split("").map((ch, i) => {
                    const c = CUTOUT[n++ % CUTOUT.length];
                    return (
                      <span key={i} className="sb-l" style={{ background: c.bg, color: c.fg, fontFamily: c.font, transform: `rotate(${c.rot}deg)` }}>
                        {ch}
                      </span>
                    );
                  })}
                </span>
              ))}
            </div>
            <p>the pact: rebuild it from scratch 10 times if I have to</p>
          </div>

          {/* life outside work */}
          <div className="sb-strip">
            <div className="sb-row3">
              <figure>
                <div className="sb-crop">
                  <Image src="/about/waterfall-smile.jpg" alt="Zohaib smiling by a waterfall in the mountains" width={615} height={1100} sizes="(max-width: 768px) 30vw, 300px" />
                </div>
                <figcaption>chasing waterfalls</figcaption>
              </figure>
              <figure>
                <div className="sb-crop">
                  <Image src="/about/waterfall-arms.jpg" alt="Zohaib with his arms out under a huge waterfall" width={771} height={1000} sizes="(max-width: 768px) 30vw, 300px" />
                </div>
                <figcaption>getting soaked on purpose</figcaption>
              </figure>
              <figure>
                <div className="sb-crop">
                  <Image src="/about/karting.jpg" alt="Zohaib in a racing suit, helmet in hand, at a go-kart track at night" width={727} height={1000} sizes="(max-width: 768px) 30vw, 300px" />
                </div>
                <figcaption>helmet on</figcaption>
              </figure>
            </div>
          </div>

          {/* things on my mind */}
          <div className="sb-notebook sb-tilt-l">
            <h3>Things on my mind lately</h3>
            <ul>
              {THINGS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="sb-sticky sb-tilt-rr">
            15 pages a day.
            <small>(and the newspaper, some days)</small>
          </div>

          <div className="sb-pair">
            <Polaroid src="/about/classroom.jpg" alt="Zohaib talking to a classroom of students" w={1100} h={825} caption="back in a classroom" className="sb-tilt-ll" />
            <Polaroid src="/about/circle.jpg" alt="A circle of students sitting on the grass at FCCU at sunset" w={825} h={1100} caption="sunset circles at FCCU" className="sb-tilt-r" />
          </div>
        </div>
      </div>
    </section>
  );
}
