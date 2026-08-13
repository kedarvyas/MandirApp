import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // sanctumcommunity.com is the real site. The auto-assigned Vercel domain
      // cannot be removed, and leaving a second live copy of the whole site at
      // sanctumapp.vercel.app is a poor signal to compliance reviewers (Twilio
      // toll-free verification quoted the old URL) and splits SEO.
      //
      // Defined here rather than in the Vercel dashboard so it is version
      // controlled. next.config redirects run ahead of middleware, so this does
      // not interfere with the auth redirects in lib/supabase/middleware.ts.
      {
        source: "/:path*",
        has: [{ type: "host", value: "sanctumapp.vercel.app" }],
        destination: "https://sanctumcommunity.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
