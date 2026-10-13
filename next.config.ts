import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Orbit is switched off: its code is kept, unbuilt, in app/_orbit (see the
  // README there to bring it back). Old links to it go to the home page
  // instead of an error page. These are temporary (307) redirects, so
  // browsers won't remember them if Orbit comes back.
  async redirects() {
    return [
      { source: "/orbit", destination: "/", permanent: false },
      { source: "/orbit/:path*", destination: "/", permanent: false },
      { source: "/whisper-wall.html", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
